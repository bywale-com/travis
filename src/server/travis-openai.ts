/**
 * SCP-006 dest Travis — OpenAI text + Realtime token.
 * Key stays server-side. Phone gets an ephemeral ek_ only.
 */

import { TRAVIS_LIVE_MODEL, TRAVIS_TEXT_MODEL } from "@/lib/travis-models";
import {
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
  const res = await openaiFetch(
    "/v1/realtime/client_secrets",
    {
      session: realtimeSessionConfig({
        instructions: TRAVIS_SYSTEM,
        tools: TRAVIS_TOOL_DECLS,
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

export async function generateTravisText(params: {
  sessionId: string;
  prompt: string;
}): Promise<string> {
  const key = openaiKey();
  if (!key) return "";
  const tools = toRealtimeTools(TRAVIS_TOOL_DECLS);
  let body: Record<string, unknown> = {
    model: TRAVIS_TEXT_MODEL,
    instructions: TRAVIS_SYSTEM,
    input: params.prompt,
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
    if (!calls.length) return responsesText(data);

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
  return "";
}
