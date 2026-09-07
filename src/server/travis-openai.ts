/**
 * SCP-006 dest Travis — OpenAI text + Realtime token.
 * SCP-030 — Type loop is Deep Agents invoke. Live token stays Realtime.
 * Key stays server-side. Phone gets an ephemeral ek_ only.
 */

import { TRAVIS_LIVE_MODEL, TRAVIS_TEXT_MODEL } from "@/lib/travis-models";
import {
  liveInstructions,
  openaiErrorMessage,
  parseEphemeralSecret,
  realtimeSessionConfig,
  responsesText,
  toRealtimeTools,
} from "@/lib/travis-openai";
import {
  TRAVIS_SYSTEM,
  TRAVIS_TOOL_DECLS,
  runTravisTool,
} from "@/server/travis-tools";
import { roomContextFor } from "@/server/room-read";
import { runMotionRunner } from "@/server/motion";

export { TRAVIS_LIVE_MODEL, TRAVIS_TEXT_MODEL };

export function openaiKey(): string {
  return process.env.OPENAI_API_KEY?.trim() ?? "";
}

export function travisIsWired(): boolean {
  return Boolean(openaiKey());
}

async function openaiFetch(
  path: string,
  body: unknown,
  extra?: { sessionId?: string },
): Promise<Response> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${openaiKey()}`,
    "Content-Type": "application/json",
  };
  if (extra?.sessionId) {
    headers["OpenAI-Safety-Identifier"] = `travis-session-${extra.sessionId}`;
  }
  return fetch(`https://api.openai.com${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

export async function mintLiveToken(sessionId: string): Promise<{
  token: string;
  model: string;
} | null> {
  const key = openaiKey();
  if (!key) return null;
  // Live is ear + mouth. Think is generateTravisText (Deep Agents).
  // Seed Here so a reconnect is not a blank room.
  const room = await roomContextFor(sessionId).catch(() => "");
  const res = await openaiFetch(
    "/v1/realtime/client_secrets",
    {
      session: realtimeSessionConfig({
        instructions: liveInstructions(TRAVIS_SYSTEM, room),
        tools: [],
      }),
    },
    { sessionId },
  );
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(openaiErrorMessage(data, res.status));
  }
  const token = parseEphemeralSecret(data);
  if (!token) return null;
  return { token, model: TRAVIS_LIVE_MODEL };
}

type ResponsesBody = {
  id?: string;
  output_text?: string;
  output?: Array<{
    type?: string;
    name?: string;
    call_id?: string;
    arguments?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
  error?: { message?: string };
};

/** Pre-030 Type loop. Fallback when Deep Agents import/invoke throws. */
async function generateTravisTextViaResponses(params: {
  sessionId: string;
  prompt: string;
  room: string;
}): Promise<string> {
  const tools = toRealtimeTools(TRAVIS_TOOL_DECLS);
  let body: Record<string, unknown> = {
    model: TRAVIS_TEXT_MODEL,
    instructions: TRAVIS_SYSTEM,
    input: params.room ? `${params.room}\n\n${params.prompt}` : params.prompt,
    tools,
    reasoning: { effort: "low" },
  };

  for (let i = 0; i < 6; i++) {
    const res = await openaiFetch("/v1/responses", body, {
      sessionId: params.sessionId,
    });
    const data = (await res.json().catch(() => ({}))) as ResponsesBody;
    if (!res.ok) {
      throw new Error(openaiErrorMessage(data, res.status));
    }
    const calls = (data.output ?? []).filter(
      (x) => x.type === "function_call" && x.name && x.call_id,
    );
    if (!calls.length) {
      return responsesText(data);
    }

    const outputs = [];
    for (const call of calls) {
      let args: Record<string, unknown> = {};
      try {
        const parsed = JSON.parse(call.arguments || "{}") as unknown;
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          args = parsed as Record<string, unknown>;
        }
      } catch {
        args = {};
      }
      const result = await runTravisTool({
        sessionId: params.sessionId,
        name: String(call.name),
        args,
      });
      outputs.push({
        type: "function_call_output",
        call_id: call.call_id,
        output: result.text,
      });
    }
    body = {
      model: TRAVIS_TEXT_MODEL,
      previous_response_id: data.id,
      input: outputs,
      tools,
    };
  }
  return "I ran out of tool steps on that one, so I stopped there. Anything I already started is still running — ask me what is in flight.";
}

export async function generateTravisText(params: {
  sessionId: string;
  prompt: string;
}): Promise<string> {
  const key = openaiKey();
  if (!key) {
    await runMotionRunner(params.sessionId);
    return "";
  }
  const room = await roomContextFor(params.sessionId).catch(() => "");
  try {
    try {
      // Load after the send route has already returned SSE. A static import
      // of deepagents on this module made finalize/send/live-token HTML 500
      // at function load — the phone then parsed <!DOCTYPE as JSON.
      // 080: hang `deepagents/node` so Vercel require() hits CJS, not browser ESM.
      const { invokeDeepAgent } = await import("@/server/travis-deep-agent");
      return await invokeDeepAgent({
        sessionId: params.sessionId,
        prompt: params.prompt,
        room,
      });
    } catch {
      return await generateTravisTextViaResponses({
        sessionId: params.sessionId,
        prompt: params.prompt,
        room,
      });
    }
  } finally {
    await runMotionRunner(params.sessionId);
  }
}
