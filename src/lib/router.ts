/**
 * SCP-002 addressee router — call-by-name, dead-man, clarification parsers.
 */

import type { SeatKey } from "@/server/db/schema";
import { seatShortLabel } from "./seat-mark";

const SEAT_ALIASES: Record<string, SeatKey> = {
  pm: "pm",
  sa: "sa",
  "systems analyst": "sa",
  engineer: "engineer",
  eng: "engineer",
  travis: "travis",
};

/** Spoken / STT forms. Engineer before Eng; Travis last. */
const SEAT_NAME = "Systems Analyst|Engineer|Eng|P\\.M\\.?|PM|SA|Travis";

export function seatKeyToLabel(key: SeatKey): string {
  if (key === "pm") return "PM";
  if (key === "sa") return "SA";
  if (key === "travis") return "Travis";
  return "Engineer";
}

/** Plate chips use Eng, not the full table label. Unknown seats use the label. */
export function seatKeyToShort(
  key: string | null | undefined,
  label?: string | null,
): string {
  return seatShortLabel(key, label);
}

function seatFromToken(token: string): SeatKey | null {
  const alias = token
    .trim()
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ");
  return SEAT_ALIASES[alias] ?? null;
}

/**
 * Call-by-name: leading seat, greeting vocative ("hey engineer"),
 * trailing vocative ("… engineer"), or a bare name.
 * "the engineer" as a noun does not switch.
 */
export function parseCallByName(utterance: string): {
  seatKey: SeatKey | null;
  remainder: string;
} {
  const trimmed = utterance.trim();

  const leading = trimmed.match(
    new RegExp(`^(${SEAT_NAME})(?:\\s*[—\\-:,]\\s*|\\s+)([\\s\\S]*)$`, "i"),
  );
  if (leading) {
    const seatKey = seatFromToken(leading[1]);
    if (seatKey) return { seatKey, remainder: (leading[2] ?? "").trim() };
  }

  const greet = trimmed.match(
    new RegExp(
      `^(hey|hi|hello|okay|ok|yo)\\s*[,:]?\\s+(${SEAT_NAME})\\b[\\s,:\\-—]*(.*)$`,
      "i",
    ),
  );
  if (greet) {
    const seatKey = seatFromToken(greet[2]);
    if (seatKey) {
      const rest = (greet[3] ?? "").trim();
      return { seatKey, remainder: rest || trimmed };
    }
  }

  const bare = trimmed.match(new RegExp(`^(${SEAT_NAME})\\s*[.?!]*$`, "i"));
  if (bare) {
    const seatKey = seatFromToken(bare[1]);
    if (seatKey) return { seatKey, remainder: "" };
  }

  const trail = trimmed.match(
    new RegExp(
      `^(.*?)(?:\\s+|[\\s,;—\\-:]\\s*)(${SEAT_NAME})\\s*[.?!]*$`,
      "i",
    ),
  );
  if (trail) {
    const before = (trail[1] ?? "").trim();
    const seatKey = seatFromToken(trail[2]);
    if (
      seatKey &&
      before &&
      !/(?:^|\s)(the|a|an|our|your)$/i.test(before)
    ) {
      return { seatKey, remainder: trimmed };
    }
  }

  return { seatKey: null, remainder: trimmed };
}

export function parseDeadManResponse(utterance: string): {
  action: "default" | "seat" | "stay" | "ignore";
  seatKey?: SeatKey;
} {
  const t = utterance
    .trim()
    .toLowerCase()
    .replace(/[.?!]+$/g, "")
    .replace(/\s+/g, " ");

  if (t === "no" || t === "nope") return { action: "default" };
  if (t === "yes" || t === "yeah" || t === "yep") return { action: "stay" };

  const m = t.match(/^no[,.\s]+(.+)$/);
  if (m) {
    const alias = m[1].trim();
    const seatKey =
      seatFromToken(alias) ?? SEAT_ALIASES[alias.replace(/\s+/g, " ")];
    if (seatKey) return { action: "seat", seatKey };
  }

  return { action: "ignore" };
}

export function parseClarificationResponse(utterance: string): SeatKey | null {
  const t = utterance.trim().toLowerCase();
  for (const [alias, key] of Object.entries(SEAT_ALIASES)) {
    if (t === alias || t.startsWith(`${alias} `)) return key;
  }
  return null;
}
