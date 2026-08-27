/**
 * Cursor cloud send port (SCP-001 + Hotfix 001 + SCP-002 thought/post split).
 */

import { absorbText } from "@/lib/absorb-text";
import {
  BUSY_RETRY_DELAYS_MS,
  delay,
  isAgentBusyError,
} from "@/lib/cursor-busy";

export type CursorStreamEvent =
  | { type: "status"; text: string }
  /** Legacy hotfix — same as post_delta */
  | { type: "delta"; text: string }
  | { type: "thought_delta"; text: string }
  | { type: "post_delta"; text: string }
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

export async function* streamCursorReply(params: {
  cursorAgentId: string;
  prompt: string;
}): AsyncGenerator<CursorStreamEvent> {
  const agentId = params.cursorAgentId?.trim() ?? "";
  const key = process.env.CURSOR_API_KEY?.trim() ?? "";

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

  let lastErr: unknown;
  for (let attempt = 0; attempt <= BUSY_RETRY_DELAYS_MS.length; attempt++) {
    try {
      await using agent = await Agent.resume(agentId, { apiKey: key });
      const run = await agent.send(params.prompt);

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
          runId: result.id,
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
        runId: result.id,
        statusText: result.status === "cancelled" ? "cancelled" : "finished",
      };
      return;
    } catch (err) {
      lastErr = err;
      const canRetry =
        isAgentBusyError(err) && attempt < BUSY_RETRY_DELAYS_MS.length;
      if (!canRetry) break;
      yield { type: "status", text: "running" };
      await delay(BUSY_RETRY_DELAYS_MS[attempt]);
    }
  }

  const msg = lastErr instanceof Error ? lastErr.message : String(lastErr);
  yield {
    type: "done",
    mode: "error",
    assistantText: "",
    statusText: "error",
    error: msg,
  };
}
