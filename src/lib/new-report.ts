/**
 * Hotfix 051 — New is the report queue.
 *
 * A seat post landing is not a read. It is New until the founder opens
 * the log. Travis names the seat. Google TTS is not that mouth.
 */

import { isCursorSeat } from "./seats";
import { seatShortLabel } from "./seat-mark";

export type NewReportTurn = {
  id: string;
  seq?: number;
  kind: string;
  seatKey?: string | null;
  speakable?: boolean;
};

export type NewSeat = {
  seatKey: string;
  label?: string | null;
};

export function isNewReportTurn(turn: NewReportTurn): boolean {
  if (turn.kind !== "agent_post") return false;
  if (turn.speakable === false) return false;
  return isCursorSeat(turn.seatKey);
}

export function collectNewReports<T extends NewReportTurn>(
  turns: T[],
  afterSeq: number,
): T[] {
  return turns.filter(
    (turn) => isNewReportTurn(turn) && (turn.seq ?? 0) > afterSeq,
  );
}

export function newReportSeats(turns: NewReportTurn[]): NewSeat[] {
  const seen: string[] = [];
  const out: NewSeat[] = [];
  for (const turn of turns) {
    const key = turn.seatKey;
    if (!key || seen.includes(key)) continue;
    seen.push(key);
    out.push({ seatKey: key });
  }
  return out;
}

export function newReportChip(seats: NewSeat[]): string {
  if (!seats.length) return "";
  const names = seats.map((s) => seatShortLabel(s.seatKey, s.label));
  if (seats.length === 1) return `1 new · ${names[0]}`;
  return `${seats.length} new · ${names.join(", ")}`;
}

export function newReportBeat(seats: NewSeat[]): string {
  if (!seats.length) return "";
  const names = seats.map((s) => {
    if (s.seatKey === "pm") return "PM";
    if (s.seatKey === "sa") return "SA";
    if (s.seatKey === "engineer") return "Engineer";
    return seatShortLabel(s.seatKey, s.label);
  });
  if (names.length === 1) return `${names[0]} has something new.`;
  if (names.length === 2) return `${names[0]} and ${names[1]} have something new.`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]} have something new.`;
}

/** First unseen report in display order — the New hairline sits above it. */
export function newCutTurnId(
  visibleIds: string[],
  newIds: ReadonlySet<string>,
): string | null {
  return visibleIds.find((id) => newIds.has(id)) ?? null;
}
