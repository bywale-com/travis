/**
 * SCP-011 — fix Agent.create SDK call shape + typed integration options.
 * model → { id }, cloud.repos with optional startingRef. No top-level repository/ref.
 */
import { eq } from "drizzle-orm";
import { nextUniqueSlug, seatSlugFromLabel } from "@/lib/seat-slug";
import { db } from "@/server/db/client";
import { agentBinding } from "@/server/db/schema";
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

  let cursorAgentId = "";
  const key = apiKey();
  if (key) {
    try {
      const { Agent } = await import("@cursor/sdk");
      const created = await Agent.create({
        apiKey: key,
        name: label,
        model: opts.model ? { id: opts.model } : undefined,
        cloud:
          opts.repository || opts.ref
            ? {
                repos: opts.repository
                  ? [
                      {
                        url: opts.repository,
                        ...(opts.ref ? { startingRef: opts.ref } : {}),
                      },
                    ]
                  : undefined,
              }
            : undefined,
        prompt: `You are ${label}. You sit in a Travis room.`,
      } as Record<string, unknown>);
      const id =
        created && typeof created === "object" && "id" in created
          ? String((created as { id: string }).id)
          : "";
      if (id.startsWith("bc-")) cursorAgentId = id;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Cursor would not create the agent.",
      );
    }
  }

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
