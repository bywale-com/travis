/**
 * Hotfix 050 — one seat, two at most.
 *
 * Travis kicking the same beat to PM, SA, and Engineer makes silos.
 * Founder law: one person at a time; two only when two different jobs
 * were named. Same line to a second seat is refused even under the cap.
 */

export const MAX_SEATS_PER_BEAT = 2;

export type BeatSend = {
  seat: string;
  text: string;
};

/** Newest-first room rows used to rebuild this beat's dests. */
export type BeatTurn = {
  kind: string;
  seatKey: string | null;
  text: string;
  createdAt?: Date | string | null;
};

/** When Live tools fire before the founder line is persisted. */
export const BEAT_FALLBACK_MS = 120_000;

export type DispatchCapVerdict =
  | { allow: true }
  | { allow: false; reason: string };

export function normalizeDispatchText(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

export function beatSeats(already: BeatSend[]): string[] {
  const seen: string[] = [];
  for (const row of already) {
    if (!seen.includes(row.seat)) seen.push(row.seat);
  }
  return seen;
}

export function siloCopyOf(
  already: BeatSend[],
  next: BeatSend,
): BeatSend | null {
  const needle = normalizeDispatchText(next.text);
  if (!needle) return null;
  return (
    already.find(
      (row) =>
        row.seat !== next.seat &&
        normalizeDispatchText(row.text) === needle,
    ) ?? null
  );
}

function label(seat: string): string {
  if (seat === "pm") return "PM";
  if (seat === "sa") return "SA";
  if (seat === "engineer") return "Engineer";
  return seat;
}

function createdAtMs(at: BeatTurn["createdAt"]): number | null {
  if (!at) return null;
  const ms = new Date(at).getTime();
  return Number.isFinite(ms) ? ms : null;
}

/**
 * Walk newest-first. Dest user turns after the last founder→Travis line
 * are this beat. If that line is not in the scan yet, keep dests from
 * the last two minutes so Live still sees the first kick.
 */
export function collectBeatSends(
  newestFirst: BeatTurn[],
  now = Date.now(),
): BeatSend[] {
  const dests: Array<BeatSend & { at: number | null }> = [];
  let hitFounder = false;
  for (const row of newestFirst) {
    if (row.kind === "user" && row.seatKey === "travis") {
      hitFounder = true;
      break;
    }
    if (
      row.kind === "user" &&
      (row.seatKey === "pm" ||
        row.seatKey === "sa" ||
        row.seatKey === "engineer")
    ) {
      dests.push({
        seat: row.seatKey,
        text: row.text,
        at: createdAtMs(row.createdAt),
      });
    }
  }
  const kept = hitFounder
    ? dests
    : dests.filter((row) => row.at != null && now - row.at <= BEAT_FALLBACK_MS);
  return kept.map(({ seat, text }) => ({ seat, text }));
}

export function guardBeatDispatch(
  already: BeatSend[],
  next: BeatSend,
): DispatchCapVerdict {
  const copy = siloCopyOf(already, next);
  if (copy) {
    return {
      allow: false,
      reason: `I already sent that to ${label(copy.seat)} this beat. Not kicking the same ask to ${label(next.seat)} — that makes silos. Say if you want ${label(next.seat)} next, with their own job.`,
    };
  }
  const seats = beatSeats(already);
  if (!seats.includes(next.seat) && seats.length >= MAX_SEATS_PER_BEAT) {
    const named = seats.map(label).join(" and ");
    return {
      allow: false,
      reason: `${named} already have work from this beat. I will not kick a third. One seat at a time, two at most.`,
    };
  }
  return { allow: true };
}
