import { parseCallByName } from "@/lib/router";
import type { SeatKey } from "@/server/db/schema";

export type TypedDest =
  | { kind: "empty" }
  | { kind: "switch"; seatKey: SeatKey }
  | { kind: "send"; seatKey: SeatKey | null; prompt: string };

/**
 * Type-composer dest. Chip wins and skips call-by-name.
 * No chip → Hotfix 010 parse. No name → sticky (seatKey null).
 */
export function resolveTypedSend(opts: {
  chipSeatKey: SeatKey | null;
  text: string;
}): TypedDest {
  const text = opts.text.trim();
  if (opts.chipSeatKey) {
    if (!text) return { kind: "switch", seatKey: opts.chipSeatKey };
    return { kind: "send", seatKey: opts.chipSeatKey, prompt: text };
  }
  const { seatKey, remainder } = parseCallByName(text);
  if (seatKey) {
    const prompt = remainder.trim();
    if (!prompt) return { kind: "switch", seatKey };
    return { kind: "send", seatKey, prompt };
  }
  if (!text) return { kind: "empty" };
  return { kind: "send", seatKey: null, prompt: text };
}
