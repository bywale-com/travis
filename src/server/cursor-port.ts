/**
 * Cursor cloud send port (SCP-001).
 * Stand-in unless binding has non-empty bc-… id AND CURSOR_API_KEY is set.
 * Never Agent.create per utterance — resume + send only.
 */

export type CursorSendResult =
  | {
      mode: "stand-in";
      assistantText: string;
      statusText?: string;
    }
  | {
      mode: "real";
      assistantText: string;
      agentId: string;
      runId?: string;
      statusText?: string;
    }
  | {
      mode: "error";
      assistantText: string;
      statusText: string;
    };

function isCloudAgentId(id: string): boolean {
  return /^bc-[a-f0-9-]+$/i.test(id.trim());
}

export async function sendToCursor(params: {
  cursorAgentId: string;
  prompt: string;
}): Promise<CursorSendResult> {
  const agentId = params.cursorAgentId?.trim() ?? "";
  const key = process.env.CURSOR_API_KEY?.trim() ?? "";

  if (!agentId || !isCloudAgentId(agentId) || !key) {
    return {
      mode: "stand-in",
      assistantText:
        "Got it. (Cursor stand-in — set CURSOR_API_KEY and a bc-… agent_binding row for a real run.)",
      statusText: "stand-in",
    };
  }

  try {
    const { Agent } = await import("@cursor/sdk");

    await using agent = await Agent.resume(agentId, { apiKey: key });
    const run = await agent.send(params.prompt);

    // Hygiene path: prefer wait() for final assistant text; skip thinking/tool via result.result
    const result = await run.wait();

    if (result.status === "error") {
      return {
        mode: "error",
        assistantText: result.error?.message ?? "Run error",
        statusText: "error",
      };
    }
    if (result.status === "cancelled") {
      return {
        mode: "real",
        assistantText: result.result?.trim() || "Run cancelled.",
        agentId,
        runId: result.id,
        statusText: "cancelled",
      };
    }

    return {
      mode: "real",
      assistantText:
        result.result?.trim() || "Run finished (no assistant text).",
      agentId,
      runId: result.id,
      statusText: "finished",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      mode: "error",
      assistantText: `Cursor send failed: ${msg}`,
      statusText: "error",
    };
  }
}
