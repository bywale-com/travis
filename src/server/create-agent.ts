/**
 * V4 — create a Cursor cloud agent and a binding row.
 * Does not mint model/repo/ref columns. Those go to Agent.create only.
 */
import { eq } from "drizzle-orm";
import { nextUniqueSlug, seatSlugFromLabel } from "@/lib/seat-slug";
import { db } from "@/server/db/client";
import { agentBinding } from "@/server/db/schema";

function apiKey(): string {
  return process.env.CURSOR_API_KEY?.trim() ?? "";
}

export async function listCreateOptions(): Promise<{
  models: string[];
  repositories: string[];
}> {
  const key = apiKey();
  if (!key) return { models: [], repositories: [] };
  try {
    const sdk = (await import("@cursor/sdk")) as Record<string, unknown>;
    const Cursor = sdk.Cursor as
      | {
          models?: { list?: (opts: { apiKey: string }) => Promise<unknown> };
          repositories?: {
            list?: (opts: { apiKey: string }) => Promise<unknown> };
        }
      | undefined;
    const modelsRaw = await Cursor?.models?.list?.({ apiKey: key });
    const reposRaw = await Cursor?.repositories?.list?.({ apiKey: key });
    return {
      models: namesFrom(modelsRaw),
      repositories: namesFrom(reposRaw),
    };
  } catch {
    return { models: [], repositories: [] };
  }
}

function namesFrom(raw: unknown): string[] {
  if (!raw) return [];
  const items = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && "items" in raw
      ? (raw as { items: unknown }).items
      : [];
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const o = item as { id?: string; name?: string; url?: string };
        return o.url ?? o.name ?? o.id ?? "";
      }
      return "";
    })
    .filter(Boolean);
}

export async function createAgentBinding(opts: {
  label: string;
  model?: string;
  repository?: string;
  ref?: string;
}): Promise<{ id: string; seatKey: string; label: string }> {
  const label = opts.label.trim();
  if (!label) throw new Error("Name the agent.");
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
        model: opts.model || undefined,
        repository: opts.repository || undefined,
        ref: opts.ref || undefined,
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
