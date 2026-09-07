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
} from "@/lib/travis-openai";
import { TRAVIS_SYSTEM, TRAVIS_TOOL_DECLS } from "@/server/travis-tools";
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
  // Live grows its own conversation, but it starts blank on every connect —
  // including a reconnect after a drop. Seed it with the room.
  const room = await roomContextFor(sessionId).catch(() => "");
  const res = await openaiFetch(
    "/v1/realtime/client_secrets",
    {
      session: realtimeSessionConfig({
        instructions: liveInstructions(TRAVIS_SYSTEM, room),
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
    // Load after the send route has already returned SSE. A static import
    // of deepagents on this module made finalize/send/live-token HTML 500
    // at function load — the phone then parsed <!DOCTYPE as JSON.
    const { invokeDeepAgent } = await import("@/server/travis-deep-agent");
    return await invokeDeepAgent({
      sessionId: params.sessionId,
      prompt: params.prompt,
      room,
    });
  } finally {
    await runMotionRunner(params.sessionId);
  }
}
