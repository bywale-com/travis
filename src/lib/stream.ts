/**
 * SCP-024 — Stream grain. Live vs completed is one object.
 * Process order is actual tool events, not a MotionCard receipt.
 */

import { nextDestSeatText } from "./beats";
import { nextLiveTravisText } from "./absorb-text";

export const STREAM_STATUSES = ["live", "completed", "failed"] as const;
export type StreamStatus = (typeof STREAM_STATUSES)[number];

export const STREAM_EVENT_KINDS = ["message", "process", "thought"] as const;
export type StreamEventKind = (typeof STREAM_EVENT_KINDS)[number];

export type StreamEventGrain = {
  id: string;
  seq: number;
  kind: StreamEventKind;
  body: string;
  tool: string;
};

export type StreamGrain = {
  id: string;
  bindingId: string;
  seatKey: string | null;
  triggerTurnId: string;
  triggerText: string;
  closeTurnId: string | null;
  destJobId: string | null;
  motionId: string | null;
  cursorRunId: string;
  status: StreamStatus;
  events: StreamEventGrain[];
};

/** Card hangs only when the episode landed a completed post. */
export function streamShowsCard(stream: {
  status: StreamStatus;
  closeTurnId: string | null;
}): boolean {
  return (
    (stream.status === "completed" || stream.status === "failed") &&
    Boolean(stream.closeTurnId)
  );
}

export function glowFromLive(
  live: { bindingId: string; seatKey: string | null } | null,
  destLiveRun: boolean,
): boolean {
  return Boolean(live) || destLiveRun;
}

/**
 * 014 insert/update on the last message event.
 * Dest seats use dest-seat closer; Travis uses Live closer.
 */
export function nextStreamMessage(
  last: StreamEventGrain | null,
  incoming: string,
  closer: "dest" | "travis",
): { mode: "update" | "insert"; text: string } {
  const text = incoming.trim();
  if (!text) {
    return { mode: last?.kind === "message" ? "update" : "insert", text: last?.body ?? "" };
  }
  if (!last || last.kind !== "message") {
    return { mode: "insert", text };
  }
  if (closer === "travis") {
    const next = nextLiveTravisText(last.body, text);
    return { mode: next.mode, text: next.text };
  }
  const next = nextDestSeatText(last.body, text);
  return { mode: next.mode, text: next.text };
}

export function lastEventOfKind(
  events: StreamEventGrain[],
  kind: StreamEventKind,
): StreamEventGrain | null {
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].kind === kind) return events[i];
  }
  return null;
}

/** Empty tool is forbidden on process. */
export function processEventValues(params: {
  tool: string;
  body?: string;
}): { tool: string; body: string } | null {
  const tool = params.tool.trim();
  if (!tool) return null;
  return { tool, body: params.body ?? "" };
}

/**
 * Yield process from a Cursor tool_call / tool_use payload.
 * Use fields the event actually has. Do not invent a name.
 */
export function processFromCursorEvent(raw: unknown): {
  tool: string;
  body: string;
} | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const e = raw as Record<string, unknown>;
  const tool = toolNameFromCursorEvent(e);
  if (!tool) return null;
  return { tool, body: bodyFromCursorEvent(e, tool) };
}

function toolNameFromCursorEvent(e: Record<string, unknown>): string {
  if (typeof e.tool === "string" && e.tool.trim()) return e.tool.trim();
  if (typeof e.name === "string" && e.name.trim()) return e.name.trim();
  if (e.tool && typeof e.tool === "object" && !Array.isArray(e.tool)) {
    const name = (e.tool as { name?: unknown }).name;
    if (typeof name === "string" && name.trim()) return name.trim();
  }
  if (e.message && typeof e.message === "object" && !Array.isArray(e.message)) {
    const name = (e.message as { name?: unknown; tool?: unknown }).name;
    if (typeof name === "string" && name.trim()) return name.trim();
    const nested = (e.message as { tool?: unknown }).tool;
    if (typeof nested === "string" && nested.trim()) return nested.trim();
  }
  return "";
}

function bodyFromCursorEvent(e: Record<string, unknown>, tool: string): string {
  if (typeof e.text === "string" && e.text.trim()) return e.text;
  if (typeof e.result === "string") return e.result;
  const leftover: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(e)) {
    if (key === "type") continue;
    leftover[key] = value;
  }
  if (!Object.keys(leftover).length) return tool;
  try {
    return JSON.stringify(leftover);
  } catch {
    return tool;
  }
}

export function boxProcessBody(result: {
  exit: number;
  stdout: string;
  stderr: string;
}): string {
  return JSON.stringify({
    exit: result.exit,
    stdout: result.stdout,
    stderr: result.stderr,
  });
}

export function argsBody(args: Record<string, unknown>): string {
  try {
    return JSON.stringify(args);
  } catch {
    return "";
  }
}

/** Phone poll: 1–3s jitter. No new bus. */
export function streamPollMs(random = Math.random()): number {
  return 1000 + Math.floor(random * 2000);
}

/** SCP-025 — hang on this episode’s answering post, not session-latest. */
export type TravisCloseCandidate = {
  id: string;
  seq: number;
  createdAt: Date | string | number;
};

export function processFloorAt(
  lastProcessCreatedAt: Date | string | number | null | undefined,
  streamCreatedAt: Date | string | number,
): Date {
  if (lastProcessCreatedAt != null) return new Date(lastProcessCreatedAt);
  return new Date(streamCreatedAt);
}

export function isAnsweringPost(params: {
  post: TravisCloseCandidate;
  triggerSeq: number;
  processFloor: Date | string | number;
}): boolean {
  if (params.post.seq <= params.triggerSeq) return false;
  return (
    new Date(params.post.createdAt).getTime() >=
    new Date(params.processFloor).getTime()
  );
}

export function pickAnsweringPost(
  posts: TravisCloseCandidate[],
  triggerSeq: number,
  processFloor: Date | string | number,
): TravisCloseCandidate | null {
  let picked: TravisCloseCandidate | null = null;
  for (const post of posts) {
    if (!isAnsweringPost({ post, triggerSeq, processFloor })) continue;
    if (!picked || post.seq > picked.seq) picked = post;
  }
  return picked;
}

/** Founding-only: he never spoke after tools. Still after this trigger. */
export function pickFoundingFallbackPost(
  posts: TravisCloseCandidate[],
  triggerSeq: number,
): TravisCloseCandidate | null {
  let picked: TravisCloseCandidate | null = null;
  for (const post of posts) {
    if (post.seq <= triggerSeq) continue;
    if (!picked || post.seq > picked.seq) picked = post;
  }
  return picked;
}

export type TravisCloseDecision =
  | { action: "stay" }
  | { action: "close"; closeTurnId: string }
  | { action: "fail-without-card" };

export function decideTravisStreamClose(params: {
  laborOpen: boolean;
  failed?: boolean;
  foundingFallback?: boolean;
  answeringPostId: string | null;
  foundingFallbackPostId: string | null;
}): TravisCloseDecision {
  if (params.laborOpen) return { action: "stay" };
  if (params.answeringPostId) {
    return { action: "close", closeTurnId: params.answeringPostId };
  }
  if (params.failed) return { action: "fail-without-card" };
  if (params.foundingFallback && params.foundingFallbackPostId) {
    return { action: "close", closeTurnId: params.foundingFallbackPostId };
  }
  return { action: "stay" };
}
