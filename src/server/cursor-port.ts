/**
 * Cursor cloud send port (SCP-001 + Hotfix 001 + SCP-002 + SCP-003).
 * Persist run.id as soon as send returns. Busy → yield busy (enqueue), not retry-as-product.
 */

import { absorbText } from "@/lib/absorb-text";
import {
  delay,
  isAgentBusyError,
  isRunNotCancellable,
  RACE_RETRY_DELAY_MS,
} from "@/lib/cursor-busy";

export type CursorStreamEvent =
  | { type: "status"; text: string }
  /** Legacy hotfix — same as post_delta */
  | { type: "delta"; text: string }
  | { type: "thought_delta"; text: string }
  | { type: "post_delta"; text: string }
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

function textFromAssistantMessage(content: unknown): string {
  if (!Array.isArray(content)) return "";
  let out = "";
  for (const block of content) {
    if (
      block &&
      typeof block === "object" &&
      (block as { type?: string }).type === "text" &&
      typeof (block as { text?: string }).text === "string"
    ) {
      out += (block as { text: string }).text;
    }
  }
  return out;
}

async function assistantTextFromConversation(run: {
  conversation?: () => Promise<unknown>;
}): Promise<string> {
  if (typeof run.conversation !== "function") return "";
  try {
    const turns = await run.conversation();
    if (!Array.isArray(turns)) return "";
    const parts: string[] = [];
    for (const turn of turns) {
      const t = turn as {
        turn?: {
          steps?: Array<{
            type?: string;
            message?: { text?: string; content?: unknown };
          }>;
        };
      };
      for (const step of t.turn?.steps ?? []) {
        if (step.type !== "assistantMessage") continue;
        const msg = step.message;
        if (!msg) continue;
        if (typeof msg.text === "string" && msg.text.trim()) {
          parts.push(msg.text.trim());
          continue;
        }
        const fromBlocks = textFromAssistantMessage(msg.content);
        if (fromBlocks.trim()) parts.push(fromBlocks.trim());
      }
    }
    return parts.join("\n\n").trim();
  } catch {
    return "";
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
}): Promise<{ status: "active" | "idle" | "unknown"; assistantText: string }> {
  const key = apiKey();
  const agentId = params.agentId.trim();
  const runId = params.runId.trim();
  if (!agentId || !runId || !isCloudAgentId(agentId) || !key) {
    return { status: "unknown", assistantText: "" };
  }
  try {
    const { Agent } = await import("@cursor/sdk");
    const run = await Agent.getRun(runId, {
      runtime: "cloud",
      agentId,
      apiKey: key,
    });
    if (isActiveRunStatus(run.status)) {
      return { status: "active", assistantText: "" };
    }
    let text = await assistantTextFromConversation(run);
    if (!text.trim() && typeof run.result === "string") {
      text = run.result.trim();
    }
    return { status: "idle", assistantText: text.trim() };
  } catch {
    return { status: "unknown", assistantText: "" };
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

  if (typeof run.stream === "function") {
    for await (const event of run.stream()) {
      const e = event as {
        type?: string;
        message?: { content?: unknown };
        status?: string;
        text?: string;
      };

      if (e.type === "tool_call" || e.type === "tool_use") continue;

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
          const next = absorbText(postText, chunk);
          if (next.delta) {
            postText = next.acc;
            yield { type: "post_delta", text: next.delta };
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

  if (!postText.trim()) {
    const fromConversation = await assistantTextFromConversation(run);
    if (fromConversation) {
      postText = fromConversation;
      yield { type: "post_delta", text: fromConversation };
    } else if (result.result?.trim()) {
      postText = result.result.trim();
      yield { type: "post_delta", text: postText };
    }
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
