/**
 * Hotfix 038 — Travis looking at the room.
 *
 * Reads only. Every query is bounded at the database, so nothing here grows
 * with room age.
 */

import { and, desc, eq } from "drizzle-orm";
import { seatKeyToLabel } from "@/lib/router";
import {
  WINDOW_TURNS,
  buildRoomContext,
  type ContextTurn,
} from "@/lib/room-context";
import { db } from "@/server/db/client";
import { voiceTurn } from "@/server/db/schema";
import type { SeatKey } from "@/server/db/schema";
import { liveRunsForSession } from "@/server/queue";

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
export async function roomContextFor(sessionId: string): Promise<string> {
  const [turns, running] = await Promise.all([
    recentTurns(sessionId),
    runningNotes(sessionId),
  ]);
  return buildRoomContext({ turns, running });
}
