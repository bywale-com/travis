/**
 * Cursor cloud send port (SCP-001 + Hotfix 001).
 * Stand-in unless binding has non-empty bc-… id AND CURSOR_API_KEY is set.
 * Never Agent.create per utterance — resume + send only.
 * Hotfix 001: stream assistant text; skip thinking/tool spam.
 */

export type CursorStreamEvent =
  | { type: "status"; text: string }
  | { type: "delta"; text: string }
  | {
      type: "done";
      mode: "stand-in" | "real" | "error";
      assistantText: string;
      agentId?: string;
      runId?: string;
      statusText: string;
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

/** Best-effort stitch of assistant steps when stream deltas were thin. */
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
        type?: string;
        turn?: { steps?: Array<{ type?: string; message?: { text?: string; content?: unknown } }> };
      };
      const steps = t.turn?.steps ?? [];
      for (const step of steps) {
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
    yield { type: "delta", text: assistantText };
    yield {
      type: "done",
      mode: "stand-in",
      assistantText,
      statusText: "stand-in",
    };
    return;
  }

  try {
    const { Agent } = await import("@cursor/sdk");

    await using agent = await Agent.resume(agentId, { apiKey: key });
    const run = await agent.send(params.prompt);

    yield { type: "status", text: "running" };

    let assistantText = "";

    if (typeof run.stream === "function") {
      for await (const event of run.stream()) {
        const e = event as {
          type?: string;
          message?: { content?: unknown };
          status?: string;
          text?: string;
        };

        if (e.type === "thinking" || e.type === "tool_call" || e.type === "tool_use") {
          continue;
        }

        if (e.type === "assistant") {
          const chunk = textFromAssistantMessage(e.message?.content);
          if (chunk) {
            assistantText += chunk;
            yield { type: "delta", text: chunk };
          }
          continue;
        }

        if (e.type === "status" && e.status) {
          yield { type: "status", text: String(e.status).toLowerCase() };
        }
      }
    }

    const result = await run.wait();

    if (!assistantText.trim()) {
      const fromConversation = await assistantTextFromConversation(run);
      if (fromConversation) {
        assistantText = fromConversation;
        yield { type: "delta", text: fromConversation };
      } else if (result.result?.trim()) {
        assistantText = result.result.trim();
        yield { type: "delta", text: assistantText };
      }
    }

    if (result.status === "error") {
      const msg = result.error?.message ?? "Run error";
      yield {
        type: "done",
        mode: "error",
        assistantText: assistantText.trim() || msg,
        agentId,
        runId: result.id,
        statusText: "error",
      };
      return;
    }

    yield {
      type: "done",
      mode: "real",
      assistantText:
        assistantText.trim() ||
        result.result?.trim() ||
        "Run finished (no assistant text).",
      agentId,
      runId: result.id,
      statusText: result.status === "cancelled" ? "cancelled" : "finished",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    yield {
      type: "done",
      mode: "error",
      assistantText: `Cursor send failed: ${msg}`,
      statusText: "error",
    };
  }
}
