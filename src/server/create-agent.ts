/**
 * SCP-011 options + SCP-033 Cloud HTTP create.
 * Create is Cloud HTTP. No sdk-agent-store. No row without a bc- id.
 */
import { eq } from "drizzle-orm";
import { requestedBindSeatKey } from "@/lib/protocol-path";
import { nextUniqueSlug, seatSlugFromLabel } from "@/lib/seat-slug";
import { db } from "@/server/db/client";
import { agentBinding } from "@/server/db/schema";
import { isLivingCursorId } from "@/lib/dest-glass";
import { createCursorAgent } from "@/server/cursor-port";
import { ensureSitStore } from "@/server/sit-store";

function apiKey(): string {
  return process.env.CURSOR_API_KEY?.trim() ?? "";
}

// ---- SDK shapes (quoted from SDK 1.0.x stubs) ----

type SDKUser = {
  apiKeyName: string;
  userId?: number;
  userEmail?: string;
  userFirstName?: string;
  userLastName?: string;
  createdAt: string;
};

type SDKModelVariant = {
  params: unknown[];
  displayName: string;
  description?: string;
  isDefault?: boolean;
};

type SDKModel = {
  id: string;
  displayName: string;
  description?: string;
  aliases?: string[];
  parameters?: unknown[];
  variants?: SDKModelVariant[];
};

type SDKRepository = {
  url: string;
};

// ---- Typed option structs for I2/I3 ----

export type ModelOption = {
  id: string;
  displayName: string;
  variantLabel: string;
  isDefault: boolean;
};

export type RepoOption = {
  url: string;
  name: string;
};

export type OptionsResponse = {
  models: ModelOption[];
  repositories: RepoOption[];
  defaultModelId: string | null;
};

export type IntegrationStatus = {
  cursor:
    | { connected: true; email: string; keyName: string }
    | { connected: false; reason: "missing_key" | "invalid_key" };
  github:
    | { connected: true; org: string; repoCount: number }
    | { connected: false; reason: "no_scope" | "no_cursor" };
  models: { available: true; count: number } | { available: false };
  repositories:
    | { available: true; count: number; org: string }
    | { available: false };
};

// ---- SDK dynamic import helpers ----

async function getCursorSdk() {
  const sdk = (await import("@cursor/sdk")) as Record<string, unknown>;
  return sdk.Cursor as
    | {
        me?: (opts: { apiKey: string }) => Promise<SDKUser>;
        models?: { list?: (opts: { apiKey: string }) => Promise<SDKModel[]> };
        repositories?: {
          list?: (opts: { apiKey: string }) => Promise<SDKRepository[]>;
        };
      }
    | undefined;
}

function pickDefaultModelId(models: SDKModel[]): string | null {
  const withDefault = models.find((m) =>
    m.variants?.some((v) => v.isDefault === true),
  );
  if (withDefault) return withDefault.id;
  const composer = models.find((m) => m.id === "composer-2.5");
  if (composer) return composer.id;
  return models[0]?.id ?? null;
}

function toModelOption(m: SDKModel): ModelOption {
  const firstVariant = m.variants?.[0];
  const variantLabel =
    firstVariant?.displayName ??
    m.description?.split(" ")[0] ??
    "";
  return {
    id: m.id,
    displayName: m.displayName,
    variantLabel,
    isDefault: m.variants?.some((v) => v.isDefault === true) ?? false,
  };
}

function toRepoOption(r: SDKRepository): RepoOption {
  const name = r.url.split("/").pop() ?? r.url;
  return { url: r.url, name };
}

// ---- Public: integration status (drives I1 + I5) ----

export async function getIntegrationStatus(): Promise<IntegrationStatus> {
  const key = apiKey();
  if (!key) {
    return {
      cursor: { connected: false, reason: "missing_key" },
      github: { connected: false, reason: "no_cursor" },
      models: { available: false },
      repositories: { available: false },
    };
  }

  let user: SDKUser;
  try {
    const Cursor = await getCursorSdk();
    const result = await Cursor?.me?.({ apiKey: key });
    if (!result) throw new Error("no response");
    user = result;
  } catch {
    return {
      cursor: { connected: false, reason: "invalid_key" },
      github: { connected: false, reason: "no_cursor" },
      models: { available: false },
      repositories: { available: false },
    };
  }

  let modelCount = 0;
  let repos: SDKRepository[] = [];
  try {
    const Cursor = await getCursorSdk();
    const [modelsRaw, reposRaw] = await Promise.all([
      Cursor?.models?.list?.({ apiKey: key }) ?? Promise.resolve([]),
      Cursor?.repositories?.list?.({ apiKey: key }) ?? Promise.resolve([]),
    ]);
    modelCount = Array.isArray(modelsRaw) ? modelsRaw.length : 0;
    repos = Array.isArray(reposRaw) ? reposRaw : [];
  } catch {
    // partial failure — cursor is connected, integration details unavailable
  }

  const org =
    repos.length > 0 ? (repos[0].url.split("/")[1] ?? "") : "";

  return {
    cursor: {
      connected: true,
      email: user.userEmail ?? user.apiKeyName,
      keyName: user.apiKeyName,
    },
    github:
      repos.length > 0
        ? { connected: true, org, repoCount: repos.length }
        : { connected: false, reason: "no_scope" },
    models:
      modelCount > 0 ? { available: true, count: modelCount } : { available: false },
    repositories:
      repos.length > 0
        ? { available: true, count: repos.length, org }
        : { available: false },
  };
}

// ---- Public: typed options (drives I2 + I3) ----

export async function getIntegrationOptions(): Promise<OptionsResponse> {
  const key = apiKey();
  if (!key) return { models: [], repositories: [], defaultModelId: null };
  try {
    const Cursor = await getCursorSdk();
    const [modelsRaw, reposRaw] = await Promise.all([
      Cursor?.models?.list?.({ apiKey: key }) ?? Promise.resolve([]),
      Cursor?.repositories?.list?.({ apiKey: key }) ?? Promise.resolve([]),
    ]);
    const models = Array.isArray(modelsRaw) ? modelsRaw.map(toModelOption) : [];
    const repositories = Array.isArray(reposRaw)
      ? reposRaw.map(toRepoOption)
      : [];
    const defaultModelId = pickDefaultModelId(
      Array.isArray(modelsRaw) ? modelsRaw : [],
    );
    return { models, repositories, defaultModelId };
  } catch {
    return { models: [], repositories: [], defaultModelId: null };
  }
}

// ---- Public: bind an existing Cursor cloud agent (no HTTP create) ----

export async function bindAgentBinding(opts: {
  cursorAgentId: string;
  label: string;
  seatKey?: string;
}): Promise<{ id: string; seatKey: string; label: string; cursorAgentId: string }> {
  const cursorAgentId = opts.cursorAgentId.trim();
  const label = opts.label.trim();
  const requested = requestedBindSeatKey(opts.seatKey);
  if (!label) throw new Error("Name the agent.");
  if (!isLivingCursorId(cursorAgentId)) {
    throw new Error("Need a Cursor cloud agent id (bc-…).");
  }
  if (requested === "travis") {
    throw new Error("Travis is the facilitator, not a Cursor seat.");
  }
  await ensureSitStore();
  if (requested) {
    const [bySeat] = await db
      .select()
      .from(agentBinding)
      .where(eq(agentBinding.seatKey, requested))
      .limit(1);
    if (bySeat) {
      const [row] = await db
        .update(agentBinding)
        .set({ cursorAgentId, label, active: true })
        .where(eq(agentBinding.id, bySeat.id))
        .returning();
      const out = row ?? { ...bySeat, cursorAgentId, label, active: true };
      return {
        id: out.id,
        seatKey: out.seatKey,
        label: out.label,
        cursorAgentId: out.cursorAgentId,
      };
    }
    const [byCursor] = await db
      .select()
      .from(agentBinding)
      .where(eq(agentBinding.cursorAgentId, cursorAgentId))
      .limit(1);
    if (byCursor) {
      const [row] = await db
        .update(agentBinding)
        .set({ seatKey: requested, label, active: true })
        .where(eq(agentBinding.id, byCursor.id))
        .returning();
      const out = row ?? { ...byCursor, seatKey: requested, label, active: true };
      return {
        id: out.id,
        seatKey: out.seatKey,
        label: out.label,
        cursorAgentId: out.cursorAgentId,
      };
    }
    const [row] = await db
      .insert(agentBinding)
      .values({
        seatKey: requested,
        label,
        cursorAgentId,
        runtime: "cloud",
        active: true,
      })
      .returning();
    if (!row) throw new Error("Binding insert failed.");
    return {
      id: row.id,
      seatKey: row.seatKey,
      label: row.label,
      cursorAgentId: row.cursorAgentId,
    };
  }
  const [existing] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.cursorAgentId, cursorAgentId))
    .limit(1);
  if (existing) {
    return {
      id: existing.id,
      seatKey: existing.seatKey,
      label: existing.label,
      cursorAgentId: existing.cursorAgentId,
    };
  }
  const rows = await db.select({ seatKey: agentBinding.seatKey }).from(agentBinding);
  const taken = new Set(rows.map((r) => r.seatKey));
  const seatKey = nextUniqueSlug(seatSlugFromLabel(label), taken);
  const [row] = await db
    .insert(agentBinding)
    .values({
      seatKey,
      label,
      cursorAgentId,
      runtime: "cloud",
      active: true,
    })
    .returning();
  if (!row) throw new Error("Binding insert failed.");
  return {
    id: row.id,
    seatKey: row.seatKey,
    label: row.label,
    cursorAgentId: row.cursorAgentId,
  };
}

// ---- Public: create binding + Cursor agent ----

export async function createAgentBinding(opts: {
  label: string;
  model?: string;
  repository?: string;
  ref?: string;
}): Promise<{ id: string; seatKey: string; label: string }> {
  const label = opts.label.trim();
  if (!label) throw new Error("Name the agent.");
  await ensureSitStore();
  const rows = await db.select({ seatKey: agentBinding.seatKey }).from(agentBinding);
  const taken = new Set(rows.map((r) => r.seatKey));
  const seatKey = nextUniqueSlug(seatSlugFromLabel(label), taken);

  const cursorAgentId = await createCursorAgent({
    name: label,
    prompt: `You are ${label}. You sit in a Travis room.`,
    modelId: opts.model,
    repository: opts.repository,
    ref: opts.ref,
  });

  const [row] = await db
    .insert(agentBinding)
    .values({
      seatKey,
      label,
      cursorAgentId,
      runtime: "cloud",
      active: true,
    })
    .returning();

  if (!row) throw new Error("Binding insert failed.");
  return { id: row.id, seatKey: row.seatKey, label: row.label };
}

export async function agentBindingById(id: string) {
  const [row] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.id, id))
    .limit(1);
  return row ?? null;
}
