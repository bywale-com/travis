/**
 * One actor for a runtime walk. Holds session id. Does not open the founder’s tape.
 * POST /api/session resumes that operator’s live room — one cookie is one live tape
 * until SA ascribes a second operator or a create-new door.
 */

import { OPERATOR_COOKIE } from "@/lib/operator-auth";
import type { TapeTurn } from "./app-worked";
import { assertNotHtml, contentKind } from "./not-html";

export type { TapeTurn };

export function runtimeBaseUrl(): string {
  const raw =
    process.env.RUNTIME_BASE_URL?.trim() ||
    process.env.PLAYWRIGHT_BASE_URL?.trim() ||
    process.env.PREVIEW_URL?.trim() ||
    "";
  return raw.replace(/\/$/, "");
}

export function runtimeReady(): boolean {
  return Boolean(runtimeBaseUrl());
}

function testOperatorCookie(): string {
  return process.env.TRAVIS_TEST_OPERATOR_COOKIE?.trim() ?? "";
}

function headers(): Headers {
  const h = new Headers();
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();
  if (bypass) h.set("x-vercel-protection-bypass", bypass);
  const cookie = testOperatorCookie();
  if (cookie) h.set("cookie", `${OPERATOR_COOKIE}=${cookie}`);
  return h;
}

/** Open desk + seed inbox resume the founder’s tape. Walks need their own cookie. */
function requireOwnRooms(): void {
  if (testOperatorCookie()) return;
  throw new Error(
    "Runtime walks will not open a desk without TRAVIS_TEST_OPERATOR_COOKIE (own rooms, not the living tape).",
  );
}

export async function doorFetch(
  path: string,
  init: RequestInit = {},
): Promise<{ res: Response; bodyText: string; kind: ReturnType<typeof contentKind> }> {
  const base = runtimeBaseUrl();
  if (!base) throw new Error("RUNTIME_BASE_URL is not set.");
  requireOwnRooms();
  const h = headers();
  const extra = init.headers;
  if (extra) {
    const e = new Headers(extra);
    e.forEach((v, k) => h.set(k, v));
  }
  const res = await fetch(`${base}${path}`, { ...init, headers: h });
  const peek = res.headers.get("content-type") ?? "";
  if (peek.toLowerCase().includes("text/event-stream")) {
    return { res, bodyText: "", kind: "sse" };
  }
  const bodyText = await res.text();
  assertNotHtml({ headers: res.headers, bodyText });
  return { res, bodyText, kind: contentKind(res) };
}

export type Desk = {
  sessionId: string;
};

export async function openRoom(): Promise<Desk> {
  const { res, bodyText, kind } = await doorFetch("/api/session", {
    method: "POST",
  });
  if (kind !== "json") {
    throw new Error(`openRoom expected JSON, got ${kind} (${res.status})`);
  }
  if (!res.ok) {
    throw new Error(`openRoom ${res.status}: ${bodyText.slice(0, 140)}`);
  }
  const data = JSON.parse(bodyText) as { session?: { id?: string }; error?: string };
  const id = data.session?.id;
  if (!id) {
    throw new Error(
      `openRoom had no session.id (${res.status}): ${data.error ?? bodyText.slice(0, 140)}`,
    );
  }
  return { sessionId: id };
}

/** End the live sitting and open a new one. Walks must not share a tape. */
export async function openFreshRoom(): Promise<Desk> {
  const live = await openRoom();
  await endSession(live);
  return openRoom();
}

export async function endSession(desk: Desk): Promise<void> {
  const { res, bodyText, kind } = await doorFetch(
    `/api/session/${desk.sessionId}`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "ended" }),
    },
  );
  if (res.status === 404) return;
  if (kind !== "json") {
    throw new Error(`endSession expected JSON, got ${kind} (${res.status})`);
  }
  if (!res.ok) {
    throw new Error(`endSession ${res.status}: ${bodyText.slice(0, 140)}`);
  }
}

export async function readTurns(desk: Desk, afterSeq?: number): Promise<TapeTurn[]> {
  const payload = await readTurnsPayload(desk, afterSeq);
  return payload.turns;
}

export async function readTurnsPayload(
  desk: Desk,
  afterSeq?: number,
): Promise<{
  turns: TapeTurn[];
  streams: { live: unknown[]; cards: unknown[] };
}> {
  const q = afterSeq != null ? `?afterSeq=${afterSeq}` : "";
  const { res, bodyText, kind } = await doorFetch(
    `/api/session/${desk.sessionId}/turns${q}`,
  );
  if (kind !== "json") {
    throw new Error(`turns expected JSON, got ${kind} (${res.status})`);
  }
  const data = JSON.parse(bodyText) as {
    turns?: {
      text?: string;
      role?: string;
      kind?: string;
      seatKey?: string | null;
      speakable?: boolean;
      seq?: number;
    }[];
    streams?: { live?: unknown[]; cards?: unknown[] };
  };
  const turns = (data.turns ?? []).map((t) => ({
    text: String(t.text ?? ""),
    role: String(t.role ?? ""),
    kind: String(t.kind ?? ""),
    seatKey: t.seatKey ?? null,
    speakable: t.speakable !== false,
    seq: Number(t.seq ?? 0),
  }));
  const streams = data.streams ?? {};
  return {
    turns,
    streams: {
      live: Array.isArray(streams.live) ? streams.live : [],
      cards: Array.isArray(streams.cards) ? streams.cards : [],
    },
  };
}

export type SessionSeat = { id: string; seatKey: string | null; label: string };

export async function readSession(desk: Desk): Promise<{
  id: string;
  seats: SessionSeat[];
} | null> {
  const { res, bodyText, kind } = await doorFetch(
    `/api/session?id=${encodeURIComponent(desk.sessionId)}`,
  );
  if (kind !== "json" || !res.ok) {
    throw new Error(`readSession ${res.status}: ${bodyText.slice(0, 140)}`);
  }
  const data = JSON.parse(bodyText) as {
    session?: { id?: string; seats?: SessionSeat[] } | null;
  };
  const session = data.session;
  if (!session?.id) return null;
  return { id: session.id, seats: session.seats ?? [] };
}

export async function runTravisTool(
  desk: Desk,
  name: string,
  args: Record<string, unknown>,
): Promise<{ ok: boolean; text: string }> {
  const { res, bodyText, kind } = await doorFetch(
    `/api/session/${desk.sessionId}/live/tool`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, args }),
    },
  );
  if (kind !== "json") {
    throw new Error(`runTravisTool expected JSON, got ${kind} (${res.status})`);
  }
  const data = JSON.parse(bodyText) as { ok?: boolean; text?: string; error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `runTravisTool ${res.status}`);
  }
  return { ok: data.ok === true, text: String(data.text ?? "") };
}

export async function readQueue(desk: Desk): Promise<{
  queue: unknown[];
  drainable: unknown[];
  running: { seatKey?: string; label?: string; text?: string; jobId?: string }[];
}> {
  const { res, bodyText, kind } = await doorFetch(
    `/api/session/${desk.sessionId}/queue`,
  );
  if (kind !== "json") {
    throw new Error(`queue expected JSON, got ${kind} (${res.status})`);
  }
  return JSON.parse(bodyText);
}
