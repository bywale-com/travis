/**
 * SCP-008 — derive Next and stage. No stored pipeline.
 *
 * Next = dest of the latest stamped user row with no agent_post yet;
 * else Travis if open; else none.
 * Lit stage = cursor seats that have a canonical post.
 */

import { isCursorSeat } from "./seats";

export type InitiativeStatus = "open" | "done";

export type InitiativeLeg = {
  id: string;
  seq: number;
  seatKey: string | null;
};

export type InitiativePost = {
  referenceTurnId?: string | null;
  seatKey?: string | null;
};

export function deriveNext(params: {
  status: InitiativeStatus;
  legs: InitiativeLeg[];
  posts: InitiativePost[];
}): "travis" | "pm" | "sa" | "engineer" | null {
  if (params.status !== "open") return null;
  const answered = new Set(
    params.posts
      .map((p) => p.referenceTurnId)
      .filter((id): id is string => Boolean(id)),
  );
  const legs = [...params.legs]
    .filter((leg) => isCursorSeat(leg.seatKey))
    .sort((a, b) => a.seq - b.seq);
  const open = [...legs].reverse().find((leg) => !answered.has(leg.id));
  if (open && isCursorSeat(open.seatKey)) return open.seatKey;
  return "travis";
}

export function litSeatKeys(posts: InitiativePost[]): string[] {
  const seen: string[] = [];
  for (const post of posts) {
    if (!isCursorSeat(post.seatKey)) continue;
    if (seen.includes(post.seatKey)) continue;
    seen.push(post.seatKey);
  }
  return seen;
}

/** Latest agent_post per cursor seat — the ticket's canonical lines. */
export type InitiativeAttachment = {
  id: string;
  turnId: string;
  kind: "image" | "file";
  filename: string;
  sizeBytes: number | null;
  createdAt: Date;
  seatKey: string | null;
};

export function canonicalPosts<T extends InitiativePost & { seq: number }>(
  posts: T[],
): T[] {
  const latest = new Map<string, T>();
  for (const post of posts) {
    if (!isCursorSeat(post.seatKey)) continue;
    const prev = latest.get(post.seatKey);
    if (!prev || post.seq >= prev.seq) latest.set(post.seatKey, post);
  }
  return [...latest.values()].sort((a, b) => a.seq - b.seq);
}
