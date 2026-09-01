import type { SeatKey } from "@/server/db/schema";

/** Cursor cloud seats — thought strip, queue, resume. */
export const CURSOR_SEATS = ["pm", "sa", "engineer"] as const;

/** Room addressee order: seats then Travis. */
export const ROOM_SEAT_ORDER = ["pm", "sa", "engineer", "travis"] as const;

export function isTravisSeat(
  key: string | null | undefined,
): key is "travis" {
  return key === "travis";
}

export function isCursorSeat(
  key: string | null | undefined,
): key is "pm" | "sa" | "engineer" {
  return key === "pm" || key === "sa" || key === "engineer";
}

export function sortRoomSeats<T extends { seatKey: string | null }>(
  rows: T[],
): T[] {
  return [...rows].sort((a, b) => {
    const ia = ROOM_SEAT_ORDER.indexOf(
      a.seatKey as (typeof ROOM_SEAT_ORDER)[number],
    );
    const ib = ROOM_SEAT_ORDER.indexOf(
      b.seatKey as (typeof ROOM_SEAT_ORDER)[number],
    );
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

/** "hey travis" / remainder equals the vocative — switch only, do not send. */
export function isVocativeOnlyCall(
  _utterance: string,
  remainder: string,
  seatKey: SeatKey,
): boolean {
  const rest = remainder.trim();
  if (!rest) return true;
  const names: Record<SeatKey, string> = {
    pm: "pm|p\\.m\\.?",
    sa: "sa|systems analyst",
    engineer: "engineer|eng",
    travis: "travis",
  };
  const name = names[seatKey];
  if (new RegExp(`^(${name})\\s*[.?!]*$`, "i").test(rest)) return true;
  return new RegExp(
    `^(hey|hi|hello|okay|ok|yo)\\s+${name}\\s*[.?!]*$`,
    "i",
  ).test(rest);
}

/**
 * Work to keep in the Talk draft after a Travis dest switch.
 * Vocative-only → empty. Trailing "… travis" keeps the words before the name.
 */
export function keepWorkAfterTravisCall(
  utterance: string,
  remainder: string,
): string {
  if (isVocativeOnlyCall(utterance, remainder, "travis")) return "";
  const u = utterance.trim();
  const r = remainder.trim();
  if (r && r.toLowerCase() !== u.toLowerCase()) return r;
  return u.replace(/[\s,;:—-]*travis\s*[.?!]*$/i, "").trim();
}
