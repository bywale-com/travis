/**
 * Cursor cloud send port (SCP-001 + Hotfix 001 + SCP-002 + SCP-003).
 * Persist run.id as soon as send returns. Busy → yield busy (enqueue), not retry-as-product.
 */

import { absorbText } from "@/lib/absorb-text";
import { alignStreamedBeats, nextDestSeatText } from "@/lib/beats";
import {
  assistantBeatsFromConversation,
  textFromAssistantMessage,
} from "@/lib/cursor-conversation";
import {
  delay,
  isAgentBusyError,
  isRunNotCancellable,
  RACE_RETRY_DELAY_MS,
} from "@/lib/cursor-busy";
import { processFromCursorEvent } from "@/lib/stream";

export type CursorStreamEvent =
  | { type: "status"; text: string }
  /** Legacy hotfix — same as post_delta */
  | { type: "delta"; text: string }
  | { type: "thought_delta"; text: string }
  | { type: "post_delta"; text: string }
  /** New dest-seat message — pipe closes the open beat */
  | { type: "post_beat"; text: string }
  | { type: "process"; tool: string; body: string }
  | { type: "run_started"; runId: string }
  | { type: "busy"; discoveredRunId: string | null }
  | {
      type: "done";
      mode: "stand-in" | "real" | "error";
      assistantText: string;
      thoughtText?: string;
      agentId?: string;
      runId?: string;
      statusText: string;
      error?: string;
    };

function isCloudAgentId(id: string): boolean {
  return /^bc-[a-f0-9-]+$/i.test(id.trim());
}

function apiKey(): string {
  return process.env.CURSOR_API_KEY?.trim() ?? "";
}

const CURSOR_API = "https://api.cursor.com";

function cursorBasicAuth(key: string): string {
  return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

export type CursorArtifactItem = {
  path: string;
  sizeBytes: number | null;
  updatedAt: string | null;
};

/** Agent-scoped folder. Filter by this run's startedAt before hanging. */
export async function listCursorArtifacts(
  agentId: string,
): Promise<CursorArtifactItem[]> {
  const key = apiKey();
  const id = agentId.trim();
  if (!id || !isCloudAgentId(id) || !key) return [];
  try {
    const res = await fetch(`${CURSOR_API}/v1/agents/${encodeURIComponent(id)}/artifacts`, {
      headers: { Authorization: cursorBasicAuth(key) },
    });
    if (!res.ok) return [];
    const body = (await res.json()) as { items?: unknown };
    if (!Array.isArray(body.items)) return [];
    const out: CursorArtifactItem[] = [];
    for (const raw of body.items) {
      if (!raw || typeof raw !== "object") continue;
      const item = raw as {
        path?: unknown;
        sizeBytes?: unknown;
        updatedAt?: unknown;
      };
      if (typeof item.path !== "string" || !item.path.trim()) continue;
      out.push({
        path: item.path.trim(),
        sizeBytes: typeof item.sizeBytes === "number" ? item.sizeBytes : null,
        updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : null,
      });
    }
    return out;
  } catch (err) {
    console.error("[travis] list artifacts failed:", err);
    return [];
  }
}

/** Fetch bytes through the 15-minute URL. Never return that URL. */
export async function downloadCursorArtifact(params: {
  agentId: string;
  path: string;
}): Promise<Uint8Array | null> {
  const key = apiKey();
  const id = params.agentId.trim();
  const path = params.path.trim();
  if (!id || !isCloudAgentId(id) || !key || !path) return null;
  try {
    const signed = await fetch(
      `${CURSOR_API}/v1/agents/${encodeURIComponent(id)}/artifacts/download?path=${encodeURIComponent(path)}`,
      { headers: { Authorization: cursorBasicAuth(key) } },
    );
    if (!signed.ok) return null;
    const meta = (await signed.json()) as { url?: unknown };
    if (typeof meta.url !== "string" || !meta.url.startsWith("https://")) {
      return null;
    }
    const file = await fetch(meta.url);
    if (!file.ok) return null;
    return new Uint8Array(await file.arrayBuffer());
  } catch (err) {
    console.error("[travis] download artifact failed:", err);
    return null;
  }
}

async function assistantBeatsFromRun(run: {
  conversation?: () => Promise<unknown>;
}): Promise<string[]> {
  if (typeof run.conversation !== "function") return [];
  try {
    const turns = await run.conversation();
    return assistantBeatsFromConversation(turns);
  } catch {
    return [];
  }
}

function isActiveRunStatus(status: string | undefined): boolean {
  const s = (status ?? "").toLowerCase();
  return s === "running" || s === "creating";
}

export async function discoverActiveRunId(
  agentId: string,
): Promise<string | null> {
  const probe = await probeCursorRun(agentId);
  if (probe.status !== "active") return null;
  return probe.runId;
}

/** Idle vs still running vs we could not see Cursor. Drain only on idle. */
export async function probeCursorRun(agentId: string): Promise<{
  status: "active" | "idle" | "unknown";
  runId: string | null;
}> {
  const key = apiKey();
  if (!agentId || !isCloudAgentId(agentId) || !key) {
    return { status: "idle", runId: null };
  }
  try {
    const { Agent } = await import("@cursor/sdk");
    const listed = await Agent.listRuns(agentId, {
      runtime: "cloud",
      limit: 1,
      apiKey: key,
    });
    const run = listed.items?.[0];
    if (!run) return { status: "idle", runId: null };
    if (isActiveRunStatus(run.status)) {
      return { status: "active", runId: run.id ?? null };
    }
    return { status: "idle", runId: run.id ?? null };
  } catch {
    return { status: "unknown", runId: null };
  }
}

/**
 * Look at the stored run id, not the latest listRuns row. A newer
 * follow-up on the same seat must not hide a finished run's text.
 */
export async function harvestFinishedRun(params: {
  agentId: string;
  runId: string;
}): Promise<{
  status: "active" | "idle" | "unknown";
  assistantText: string;
  beats: string[];
}> {
  const key = apiKey();
  const agentId = params.agentId.trim();
  const runId = params.runId.trim();
  if (!agentId || !runId || !isCloudAgentId(agentId) || !key) {
    return { status: "unknown", assistantText: "", beats: [] };
  }
  try {
    const { Agent } = await import("@cursor/sdk");
    const run = await Agent.getRun(runId, {
      runtime: "cloud",
      agentId,
      apiKey: key,
    });
    if (isActiveRunStatus(run.status)) {
      return { status: "active", assistantText: "", beats: [] };
    }
    const beats = await assistantBeatsFromRun(run);
    if (beats.length) {
      return {
        status: "idle",
        assistantText: beats[beats.length - 1],
        beats,
      };
    }
    const fallback =
      typeof run.result === "string" ? run.result.trim() : "";
    return {
      status: "idle",
      assistantText: fallback,
      beats: fallback ? [fallback] : [],
    };
  } catch {
    return { status: "unknown", assistantText: "", beats: [] };
  }
}

export async function cancelCursorRun(
  agentId: string,
  runId: string,
): Promise<void> {
  const key = apiKey();
  if (!agentId || !runId || !key) return;
  const { Agent } = await import("@cursor/sdk");
  try {
    await Agent.cancelRun(runId, {
      runtime: "cloud",
      agentId,
      apiKey: key,
    });
  } catch (err) {
    if (isRunNotCancellable(err)) return;
    throw err;
  }
}

async function* streamRunEvents(
  run: {
    id: string;
    stream?: () => AsyncIterable<unknown>;
    wait: () => Promise<{
      id?: string;
      status?: string;
      result?: string;
      error?: { message?: string };
    }>;
    conversation?: () => Promise<unknown>;
  },
  agentId: string,
): AsyncGenerator<CursorStreamEvent> {
  yield { type: "status", text: "running" };

  let thoughtText = "";
  let postText = "";
  const streamedBeats: string[] = [];

  if (typeof run.stream === "function") {
    for await (const event of run.stream()) {
      const e = event as {
        type?: string;
        message?: { content?: unknown };
        status?: string;
        text?: string;
      };

      if (e.type === "tool_call" || e.type === "tool_use") {
        const process = processFromCursorEvent(e);
        if (process) yield { type: "process", tool: process.tool, body: process.body };
        continue;
      }

      if (e.type === "thinking") {
        const chunk = e.text ?? "";
        if (chunk) {
          const next = absorbText(thoughtText, chunk);
          if (next.delta) {
            thoughtText = next.acc;
            yield { type: "thought_delta", text: next.delta };
          }
        }
        continue;
      }

      if (e.type === "assistant") {
        const chunk = textFromAssistantMessage(e.message?.content);
        if (chunk) {
          const next = nextDestSeatText(postText, chunk);
          if (next.mode === "insert" && postText.trim()) {
            streamedBeats.push(next.text);
            postText = next.text;
            yield { type: "post_beat", text: next.text };
          } else if (next.delta) {
            if (!streamedBeats.length) streamedBeats.push(next.text);
            else streamedBeats[streamedBeats.length - 1] = next.text;
            postText = next.text;
            yield { type: "post_delta", text: next.delta };
          } else {
            if (!streamedBeats.length && next.text) streamedBeats.push(next.text);
            else if (streamedBeats.length) streamedBeats[streamedBeats.length - 1] = next.text;
            postText = next.text;
          }
        }
        continue;
      }

      if (e.type === "status" && e.status) {
        yield { type: "status", text: String(e.status).toLowerCase() };
      }
    }
  }

  const result = await run.wait();

  const fromConversation = await assistantBeatsFromRun(run);
  const aligned = alignStreamedBeats(streamedBeats, fromConversation);
  if (aligned.growLast) {
    postText = aligned.growLast;
    yield { type: "post_delta", text: aligned.growLast };
  }
  for (const beat of aligned.extra) {
    postText = beat;
    yield streamedBeats.length
      ? { type: "post_beat", text: beat }
      : { type: "post_delta", text: beat };
    streamedBeats.push(beat);
  }
  if (aligned.beats.length) {
    postText = aligned.beats[aligned.beats.length - 1];
  } else if (!postText.trim() && result.result?.trim()) {
    postText = result.result.trim();
    yield { type: "post_delta", text: postText };
  }

  if (result.status === "error") {
    const msg = result.error?.message ?? "Run error";
    yield {
      type: "done",
      mode: "error",
      assistantText: postText.trim(),
      thoughtText: thoughtText.trim() || undefined,
      agentId,
      runId: result.id ?? run.id,
      statusText: "error",
      error: msg,
    };
    return;
  }

  yield {
    type: "done",
    mode: "real",
    assistantText:
      postText.trim() ||
      result.result?.trim() ||
      "Run finished (no assistant text).",
    thoughtText: thoughtText.trim() || undefined,
    agentId,
    runId: result.id ?? run.id,
    statusText: result.status === "cancelled" ? "cancelled" : "finished",
  };
}

export async function* streamCursorReply(params: {
  cursorAgentId: string;
  prompt: string;
}): AsyncGenerator<CursorStreamEvent> {
  const agentId = params.cursorAgentId?.trim() ?? "";
  const key = apiKey();

  if (!agentId || !isCloudAgentId(agentId) || !key) {
    const assistantText =
      "Got it. (Cursor stand-in — set CURSOR_API_KEY and a bc-… agent_binding row for a real run.)";
    yield { type: "status", text: "stand-in" };
    yield { type: "post_delta", text: assistantText };
    yield {
      type: "done",
      mode: "stand-in",
      assistantText,
      statusText: "stand-in",
    };
    return;
  }

  const { Agent } = await import("@cursor/sdk");
  const agent = await Agent.resume(agentId, { apiKey: key });

  try {
    let run: Awaited<ReturnType<typeof agent.send>> | undefined;

    try {
      run = await agent.send(params.prompt);
    } catch (err) {
      if (!isAgentBusyError(err)) {
        const msg = err instanceof Error ? err.message : String(err);
        yield {
          type: "done",
          mode: "error",
          assistantText: "",
          statusText: "error",
          error: msg,
        };
        return;
      }

      const discovered = await discoverActiveRunId(agentId);
      if (discovered) {
        yield { type: "busy", discoveredRunId: discovered };
        return;
      }

      await delay(RACE_RETRY_DELAY_MS);
      try {
        run = await agent.send(params.prompt);
      } catch (err2) {
        if (isAgentBusyError(err2)) {
          const again = await discoverActiveRunId(agentId);
          yield { type: "busy", discoveredRunId: again };
          return;
        }
        const msg = err2 instanceof Error ? err2.message : String(err2);
        yield {
          type: "done",
          mode: "error",
          assistantText: "",
          statusText: "error",
          error: msg,
        };
        return;
      }
    }

    yield { type: "run_started", runId: run.id };
    yield* streamRunEvents(run, agentId);
  } finally {
    await agent[Symbol.asyncDispose]();
  }
}
