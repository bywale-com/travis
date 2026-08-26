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

/** Utterance starts with {PM|SA|Engineer|Eng} + separator → switch seat, return remainder. */
export function parseCallByName(utterance: string): {
  seatKey: SeatKey | null;
  remainder: string;
} {
  const trimmed = utterance.trim();
  const re =
    /^(PM|SA|Systems Analyst|Engineer|Eng)\s*[—\-:,]\s*([\s\S]*)$/i;
  const m = trimmed.match(re);
  if (!m) return { seatKey: null, remainder: trimmed };

  const alias = m[1].trim().toLowerCase();
  const seatKey = SEAT_ALIASES[alias] ?? null;
  return { seatKey, remainder: (m[2] ?? "").trim() };
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
