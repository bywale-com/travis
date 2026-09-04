/**
 * Hotfix 038 — Travis looking at the room.
 *
 * Reads only. Every query is bounded at the database, so nothing here grows
 * with room age.
 */

import { and, desc, eq, sql } from "drizzle-orm";
import { isTravisSeat } from "@/lib/seats";
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
import { countOpenMotions } from "@/server/motion";
import { openMembers } from "@/server/room-membership";
import { agentBinding } from "@/server/db/schema";

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
  const look = await lastSeatReplyLook(sessionId, seatKey);
  return look.post;
}

/** Last post and last send for a slug — ticket-scoped when id is set. */
export async function lastSeatReplyLook(
  sessionId: string,
  seatKey: string,
  initiativeId?: string,
): Promise<{
  post: string | null;
  postInitiativeId: string | null;
  lastPostSeq: number | null;
  lastSendSeq: number | null;
}> {
  const postWhere = [
    eq(voiceTurn.sessionId, sessionId),
    eq(voiceTurn.seatKey, seatKey),
    eq(voiceTurn.kind, "agent_post"),
  ];
  if (initiativeId) postWhere.push(eq(voiceTurn.initiativeId, initiativeId));
  const [post] = await db
    .select({
      text: voiceTurn.text,
      seq: voiceTurn.seq,
      initiativeId: voiceTurn.initiativeId,
    })
    .from(voiceTurn)
    .where(and(...postWhere))
    .orderBy(desc(voiceTurn.seq))
    .limit(1);
  const [sent] = await db
    .select({ seq: voiceTurn.seq })
    .from(voiceTurn)
    .where(
      and(
        eq(voiceTurn.sessionId, sessionId),
        eq(voiceTurn.seatKey, seatKey),
        eq(voiceTurn.kind, "user"),
      ),
    )
    .orderBy(desc(voiceTurn.seq))
    .limit(1);
  return {
    post: post?.text ?? null,
    postInitiativeId: post?.initiativeId ?? null,
    lastPostSeq: post?.seq ?? null,
    lastSendSeq: sent?.seq ?? null,
  };
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
  const [turns, runs, requestCount, session, pile, members, motionCount] =
    await Promise.all([
      recentTurns(sessionId),
      liveRunsForSession(sessionId).catch(() => []),
      countRequests(sessionId),
      db
        .select({
          title: voiceSession.title,
          activeBindingId: voiceSession.activeBindingId,
        })
        .from(voiceSession)
        .where(eq(voiceSession.id, sessionId))
        .limit(1)
        .then((rows) => rows[0] ?? null),
      glanceOpenInitiatives(sessionId).catch(() => ({
        titles: [] as string[],
        openCount: 0,
        items: [] as Array<{ title: string; posted: boolean }>,
      })),
      openMembers(sessionId).catch(() => []),
      countOpenMotions(sessionId).catch(() => 0),
    ]);
  const now = Date.now();
  const running = runs.map((r) => ({
    seatLabel:
      r.binding.label ?? seatKeyToLabel((r.binding.seatKey ?? "pm") as SeatKey),
    elapsedMs: Math.max(0, now - new Date(r.live.startedAt).getTime()),
  }));
  const busyIds = new Set(runs.map((r) => r.binding.id));
  const destLabel =
    members.find((m) => m.binding.id === session?.activeBindingId)?.label ??
    (session
      ? await db
          .select({ label: agentBinding.label })
          .from(agentBinding)
          .where(eq(agentBinding.id, session.activeBindingId))
          .limit(1)
          .then((rows) => rows[0]?.label)
      : undefined);
  return buildRoomContext({
    turns,
    running,
    requestCount,
    roomTitle: session?.title,
    destLabel,
    members: members.map((m) => ({
      label: m.label,
      busy: busyIds.has(m.binding.id),
      seated: isTravisSeat(m.seatKey)
        ? undefined
        : Boolean((m.binding.protocolPath ?? "").trim()),
    })),
    motionCount,
    openTitles: pile.titles,
    openItems: pile.items,
    openCount: pile.openCount,
  });
}
