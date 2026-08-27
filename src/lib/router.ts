/**
 * SCP-002 addressee router — call-by-name, dead-man, clarification parsers.
 */

import type { SeatKey } from "@/server/db/schema";

const SEAT_ALIASES: Record<string, SeatKey> = {
  pm: "pm",
  sa: "sa",
  "systems analyst": "sa",
  engineer: "engineer",
  eng: "engineer",
};

export function seatKeyToLabel(key: SeatKey): string {
  if (key === "pm") return "PM";
  if (key === "sa") return "SA";
  return "Engineer";
}

/** Plate chips use Eng, not the full table label. */
export function seatKeyToShort(key: string | null | undefined): string {
  if (key === "sa") return "SA";
  if (key === "engineer") return "Eng";
  if (key === "pm") return "PM";
  return "Travis";
}

/**
 * Utterance starts with {PM|SA|Engineer|Eng} plus separator or whitespace.
 * Bare name (no remainder) is a switch-only call.
 */
export function parseCallByName(utterance: string): {
  seatKey: SeatKey | null;
  remainder: string;
} {
  const trimmed = utterance.trim();
  const re =
    /^(PM|SA|Systems Analyst|Engineer|Eng)(?:\s*[—\-:,]\s*|\s+)([\s\S]*)$/i;
  const punct = trimmed.match(re);
  if (punct) {
    const alias = punct[1].trim().toLowerCase();
    const seatKey = SEAT_ALIASES[alias] ?? null;
    return { seatKey, remainder: (punct[2] ?? "").trim() };
  }

  const bare = trimmed.match(/^(PM|SA|Systems Analyst|Engineer|Eng)\s*[.?!]*$/i);
  if (bare) {
    const alias = bare[1].trim().toLowerCase();
    return { seatKey: SEAT_ALIASES[alias] ?? null, remainder: "" };
  }

  return { seatKey: null, remainder: trimmed };
}

export function parseDeadManResponse(utterance: string): {
  action: "default" | "seat";
  seatKey?: SeatKey;
} {
  const t = utterance.trim().toLowerCase();
  if (t === "no" || t === "no.") return { action: "default" };

  const m = t.match(/^no[,.\s]+(.+)$/);
  if (m) {
    const alias = m[1].trim();
    const seatKey = SEAT_ALIASES[alias] ?? SEAT_ALIASES[alias.replace(/\s+/g, " ")];
    if (seatKey) return { action: "seat", seatKey };
  }

  return { action: "default" };
}

export function parseClarificationResponse(utterance: string): SeatKey | null {
  const t = utterance.trim().toLowerCase();
  for (const [alias, key] of Object.entries(SEAT_ALIASES)) {
    if (t === alias || t.startsWith(`${alias} `)) return key;
  }
  return null;
}
