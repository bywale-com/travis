/**
 * Hotfix 038 — Travis looking at the room.
 *
 * Reads only. Every query is bounded at the database, so nothing here grows
 * with room age.
 */

import { and, desc, eq, sql } from "drizzle-orm";
import { seatKeyToLabel } from "@/lib/router";
import {
  WINDOW_TURNS,
  buildRoomContext,
  type ContextTurn,
} from "@/lib/room-context";
import {
  REQUEST_LOG_LIMIT,
  REQUEST_SCAN,
  clampRequestLimit,
  formatRequestLog,
  requestInWindow,
  requestMatches,
  requestWindowStart,
  type RequestRow,
  type RequestWhen,
} from "@/lib/request-log";
import { db } from "@/server/db/client";
import { voiceSession, voiceTurn } from "@/server/db/schema";
import type { SeatKey } from "@/server/db/schema";
import { liveRunsForSession } from "@/server/queue";
import { glanceOpenInitiatives } from "@/server/initiative";

/** Newest first from the database, oldest first to the caller. */
export async function recentTurns(
  sessionId: string,
  limit = WINDOW_TURNS * 3,
): Promise<Array<ContextTurn & { seatLabel: string }>> {
  const rows = await db
    .select({
      kind: voiceTurn.kind,
      seatKey: voiceTurn.seatKey,
      text: voiceTurn.text,
    })
    .from(voiceTurn)
    .where(eq(voiceTurn.sessionId, sessionId))
    .orderBy(desc(voiceTurn.seq))
    .limit(limit);

  return rows.reverse().map((r) => ({
    kind: r.kind,
    seatKey: r.seatKey,
    text: r.text,
    seatLabel: r.seatKey
      ? seatKeyToLabel(r.seatKey as SeatKey)
      : "Travis",
  }));
}

export async function lastSeatPost(
  sessionId: string,
  seatKey: string,
): Promise<string | null> {
  const [row] = await db
    .select({ text: voiceTurn.text })
    .from(voiceTurn)
    .where(
      and(
        eq(voiceTurn.sessionId, sessionId),
        eq(voiceTurn.seatKey, seatKey),
        eq(voiceTurn.kind, "agent_post"),
      ),
    )
    .orderBy(desc(voiceTurn.seq))
    .limit(1);
  return row?.text ?? null;
}

/**
 * Hotfix 040 — the same line to the same seat, seconds apart, is a mistake.
 * The room log is the record of what already went out, so no new store is
 * needed to notice it. Returns how long ago, or null.
 */
export async function recentDuplicateSend(params: {
  sessionId: string;
  seatKey: string;
  text: string;
  windowMs: number;
}): Promise<number | null> {
  const [row] = await db
    .select({ text: voiceTurn.text, createdAt: voiceTurn.createdAt })
    .from(voiceTurn)
    .where(
      and(
        eq(voiceTurn.sessionId, params.sessionId),
        eq(voiceTurn.seatKey, params.seatKey),
        eq(voiceTurn.kind, "user"),
        eq(voiceTurn.text, params.text),
      ),
    )
    .orderBy(desc(voiceTurn.seq))
    .limit(1);
  if (!row) return null;
  const ageMs = Date.now() - new Date(row.createdAt).getTime();
  return ageMs <= params.windowMs ? Math.max(1, Math.round(ageMs / 1000)) : null;
}

export async function runningNotes(sessionId: string) {
  const runs = await liveRunsForSession(sessionId);
  const now = Date.now();
  return runs.map((r) => ({
    seatLabel:
      r.binding.label ?? seatKeyToLabel((r.binding.seatKey ?? "pm") as SeatKey),
    elapsedMs: Math.max(0, now - new Date(r.live.startedAt).getTime()),
  }));
}

/**
 * The window handed to Travis unasked, on every Talk request and at Live
 * connect. Empty string when there is nothing to say.
 */
export async function countRequests(sessionId: string): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(voiceTurn)
    .where(and(eq(voiceTurn.sessionId, sessionId), eq(voiceTurn.kind, "user")));
  return Number(row?.n ?? 0);
}

/** Newest first. Bounded at the database. Search is a filter, not a new store. */
export async function searchRequests(
  sessionId: string,
  opts: { q?: string; seat?: string; when?: RequestWhen; limit?: number } = {},
): Promise<{ rows: RequestRow[]; total: number }> {
  const scanned = await db
    .select({
      id: voiceTurn.id,
      seq: voiceTurn.seq,
      seatKey: voiceTurn.seatKey,
      text: voiceTurn.text,
      createdAt: voiceTurn.createdAt,
    })
    .from(voiceTurn)
    .where(and(eq(voiceTurn.sessionId, sessionId), eq(voiceTurn.kind, "user")))
    .orderBy(desc(voiceTurn.seq))
    .limit(REQUEST_SCAN);

  const since = requestWindowStart(opts.when ?? "all");
  const matched = scanned.filter(
    (r) =>
      requestMatches(r.text, opts.q ?? "", r.seatKey, opts.seat) &&
      requestInWindow(r.createdAt, since),
  );
  const limit = clampRequestLimit(opts.limit ?? REQUEST_LOG_LIMIT);
  return { rows: matched.slice(0, limit), total: matched.length };
}

export async function searchRoomText(
  sessionId: string,
  opts: { q?: string; seat?: string; when?: RequestWhen; limit?: number } = {},
): Promise<string> {
  const { rows, total } = await searchRequests(sessionId, opts);
  return formatRequestLog({
    rows,
    total,
    q: opts.q,
    seat: opts.seat,
    when: opts.when,
  });
}

export async function roomContextFor(sessionId: string): Promise<string> {
  const [turns, running, requestCount, session, pile] = await Promise.all([
    recentTurns(sessionId),
    runningNotes(sessionId),
    countRequests(sessionId),
    db
      .select({ title: voiceSession.title })
      .from(voiceSession)
      .where(eq(voiceSession.id, sessionId))
      .limit(1)
      .then((rows) => rows[0] ?? null),
    glanceOpenInitiatives(sessionId).catch(() => ({
      titles: [] as string[],
      openCount: 0,
    })),
  ]);
  return buildRoomContext({
    turns,
    running,
    requestCount,
    roomTitle: session?.title,
    openTitles: pile.titles,
    openCount: pile.openCount,
  });
}
