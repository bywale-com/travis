/**
 * SCP-006 dest Travis — OpenAI text + Realtime token.
 * SCP-030 / 032 — Type loop is Deep Agents invoke. Live token stays Realtime.
 * Key stays server-side. Phone gets an ephemeral ek_ only.
 */

import { TRAVIS_LIVE_MODEL, TRAVIS_TEXT_MODEL } from "@/lib/travis-models";
import {
  liveInstructions,
  openaiErrorMessage,
  parseEphemeralSecret,
  realtimeSessionConfig,
} from "@/lib/travis-openai";
import { TRAVIS_SYSTEM } from "@/server/travis-tools";
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

/** Browser SDP POST to api.openai.com is CORS/Failed to fetch from the preview origin. */
export async function exchangeRealtimeSdp(opts: {
  token: string;
  offerSdp: string;
}): Promise<{ ok: true; sdp: string } | { ok: false; status: number; body: string }> {
  const res = await fetch("https://api.openai.com/v1/realtime/calls", {
    method: "POST",
    body: opts.offerSdp,
    headers: {
      Authorization: `Bearer ${opts.token}`,
      "Content-Type": "application/sdp",
    },
  });
  const body = await res.text();
  if (!res.ok) return { ok: false, status: res.status, body };
  return { ok: true, sdp: body };
}

export async function generateTravisText(params: {
  sessionId: string;
  prompt: string;
  mode?: "update" | "synthesize";
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
    // 080: hang `deepagents/node` so Vercel require() hits CJS, not browser ESM.
    // 032: kit throw reaches pipeTravisText → travisGenerateMiss. No cousin.
    // 033: create is HTTP — SDK create no longer loads on this send.
    const { invokeDeepAgent } = await import("@/server/travis-deep-agent");
    return await invokeDeepAgent({
      sessionId: params.sessionId,
      prompt: params.prompt,
      room,
      mode: params.mode ?? "synthesize",
    });
  } finally {
    await runMotionRunner(params.sessionId);
  }
}
