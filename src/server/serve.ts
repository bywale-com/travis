/**
 * SCP-026 — Hear / Skip / Log-in-view write heard_at. Offer is spoken, not stored.
 */

import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import {
  gistEmptyFallback,
  offerBeat,
  parseHearInvite,
  type HearInvite,
} from "@/lib/offer";
import { isNewReportTurn } from "@/lib/new-report";
import { READ_CAP } from "@/lib/room-context";
import { isCursorSeat } from "@/lib/seats";
import { db } from "@/server/db/client";
import { agentBinding, initiative, voiceTurn } from "@/server/db/schema";
import { ensureInitiativeStore } from "@/server/initiative";
import { summarizeSeatReply } from "@/server/travis-summarize";

export type UnheardRow = {
  id: string;
  seatKey: string;
  label: string | null;
  text: string;
  title: string | null;
};

export async function listUnheardReports(
  sessionId: string,
): Promise<UnheardRow[]> {
  await ensureInitiativeStore();
  const rows = await db
    .select({
      id: voiceTurn.id,
      seq: voiceTurn.seq,
      kind: voiceTurn.kind,
      seatKey: voiceTurn.seatKey,
      speakable: voiceTurn.speakable,
      heardAt: voiceTurn.heardAt,
      text: voiceTurn.text,
      title: initiative.title,
      label: agentBinding.label,
    })
    .from(voiceTurn)
    .leftJoin(initiative, eq(voiceTurn.initiativeId, initiative.id))
    .leftJoin(agentBinding, eq(voiceTurn.seatKey, agentBinding.seatKey))
    .where(
      and(eq(voiceTurn.sessionId, sessionId), eq(voiceTurn.kind, "agent_post")),
    )
    .orderBy(asc(voiceTurn.seq));
  return rows
    .filter((row) =>
      isNewReportTurn({
        id: row.id,
        kind: row.kind,
        seatKey: row.seatKey,
        speakable: row.speakable,
        heardAt: row.heardAt,
      }),
    )
    .filter((row): row is typeof row & { seatKey: string } =>
      Boolean(row.seatKey && isCursorSeat(row.seatKey)),
    )
    .map((row) => ({
      id: row.id,
      seatKey: row.seatKey,
      label: row.label,
      text: row.text,
      title: row.title,
    }));
}

export async function markTurnsHeard(
  sessionId: string,
  turnIds: string[],
): Promise<void> {
  await ensureInitiativeStore();
  const ids = turnIds.filter(Boolean);
  if (!ids.length) return;
  const now = new Date();
  await db
    .update(voiceTurn)
    .set({ heardAt: now })
    .where(
      and(
        eq(voiceTurn.sessionId, sessionId),
        inArray(voiceTurn.id, ids),
        isNull(voiceTurn.heardAt),
      ),
    );
}

function pickUnheard(
  rows: UnheardRow[],
  seat?: string,
): UnheardRow | null {
  const named = seat?.trim();
  const pool = named
    ? rows.filter((r) => r.seatKey === named)
    : rows;
  return pool[0] ?? null;
}

export async function serveHear(
  sessionId: string,
  opts: { seat?: string; form?: "gist" | "full" } = {},
): Promise<{ speak: string; turnId: string | null }> {
  const rows = await listUnheardReports(sessionId);
  const row = pickUnheard(rows, opts.seat);
  if (!row) return { speak: "", turnId: null };
  const offer = offerBeat([
    { seatKey: row.seatKey, label: row.label, title: row.title },
  ]);
  if (opts.form === "full") {
    await markTurnsHeard(sessionId, [row.id]);
    return {
      speak: row.text.replace(/\s+/g, " ").trim().slice(0, READ_CAP),
      turnId: row.id,
    };
  }
  const gist = await summarizeSeatReply(row.text).catch(() => "");
  await markTurnsHeard(sessionId, [row.id]);
  if (!gist.trim()) {
    return { speak: gistEmptyFallback(offer), turnId: row.id };
  }
  return { speak: gist, turnId: row.id };
}

export async function serveSkip(
  sessionId: string,
  opts: { seat?: string } = {},
): Promise<{ speak: string; turnId: string | null }> {
  const rows = await listUnheardReports(sessionId);
  const row = pickUnheard(rows, opts.seat);
  if (!row) return { speak: "", turnId: null };
  await markTurnsHeard(sessionId, [row.id]);
  return { speak: "", turnId: row.id };
}

export async function serveInvite(
  sessionId: string,
  text: string,
): Promise<{ invite: HearInvite; speak: string } | null> {
  const invite = parseHearInvite(text);
  if (!invite) return null;
  const unheard = await listUnheardReports(sessionId);
  if (!unheard.length) return null;
  if (invite === "skip") {
    const skip = await serveSkip(sessionId);
    return { invite, speak: skip.speak };
  }
  const hear = await serveHear(sessionId, {
    form: invite === "verbatim" ? "full" : "gist",
  });
  return { invite, speak: hear.speak };
}

export function offerForUnheard(rows: UnheardRow[]): string {
  return offerBeat(
    rows.map((r) => ({
      seatKey: r.seatKey,
      label: r.label,
      title: r.title,
    })),
  );
}
