/**
 * Plant — a seat mark for an agent that is not one of the original three.
 *
 * The kit locked `PM · SA · ENG · TRV` and then said marks must read as
 * unbounded, which is a contradiction someone has to resolve while drawing.
 * Resolved here instead: initials are derived from the label, and the tint is
 * a deterministic index into the theme's seat palette, so a fifth agent gets a
 * stable mark and colour without anyone assigning one.
 */

const KNOWN: Record<string, string> = {
  pm: "PM",
  sa: "SA",
  engineer: "ENG",
  travis: "TRV",
};

/** Two or three letters, derived from the label when the seat is not known. */
export function seatInitials(
  seatKey: string | null | undefined,
  label?: string | null,
): string {
  const key = (seatKey ?? "").trim().toLowerCase();
  if (KNOWN[key]) return KNOWN[key];

  const words = (label ?? seatKey ?? "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/[\s-]+/)
    .filter(Boolean);

  if (!words.length) return "??";
  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/**
 * Stable per identity, so the same agent keeps its colour across rooms and
 * reloads without anything being stored.
 */
export function seatTintIndex(
  seatKey: string | null | undefined,
  paletteSize: number,
): number {
  if (paletteSize <= 0) return 0;
  const key = (seatKey ?? "").trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash % paletteSize;
}

/**
 * What the waiting chip says. A new agent has no hardcoded short code, so the
 * label is used and clipped rather than coming out blank.
 */
export function seatShortLabel(
  seatKey: string | null | undefined,
  label?: string | null,
  cap = 10,
): string {
  const key = (seatKey ?? "").trim().toLowerCase();
  if (key === "pm") return "PM";
  if (key === "sa") return "SA";
  if (key === "engineer") return "Eng";
  if (key === "travis") return "Travis";
  const text = (label ?? "").trim();
  if (!text) return seatInitials(seatKey, label);
  return text.length <= cap ? text : `${text.slice(0, cap).trimEnd()}…`;
}
