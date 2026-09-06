import { parseCallByName } from "@/lib/router";
import type { SeatKey } from "@/server/db/schema";

export type DestKey = string;

export type TypedDest =
  | { kind: "empty" }
  | { kind: "switch"; seatKey: DestKey }
  | { kind: "send"; seatKeys: DestKey[]; prompt: string };

const SEATS: readonly SeatKey[] = ["pm", "sa", "engineer", "travis"];

export function isSeatKey(value: string): value is SeatKey {
  return (SEATS as readonly string[]).includes(value);
}

/** Open-member dest keys, including person dests outside the SeatKey union. */
export function uniqueSeatKeys(keys: Array<string | null | undefined>): DestKey[] {
  const out: DestKey[] = [];
  for (const key of keys) {
    if (!key || out.includes(key)) continue;
    out.push(key);
  }
  return out;
}

/**
 * Type-composer dest. @ chips win and skip call-by-name.
 * No chips → Hotfix 010 parse. No name → sticky (seatKeys empty).
 * Several chips → fan-out to each tagged seat (Type @ only).
 */
export function resolveTypedSend(opts: {
  chipSeatKeys?: DestKey[] | null;
  chipSeatKey?: DestKey | null;
  text: string;
}): TypedDest {
  const chips = uniqueSeatKeys([
    ...(opts.chipSeatKeys ?? []),
    opts.chipSeatKey ?? null,
  ]);
  const text = opts.text.trim();
  if (chips.length) {
    if (!text) return { kind: "switch", seatKey: chips[chips.length - 1] };
    return { kind: "send", seatKeys: chips, prompt: text };
  }
  const { seatKey, remainder } = parseCallByName(text);
  if (seatKey) {
    const prompt = remainder.trim();
    if (!prompt) return { kind: "switch", seatKey };
    return { kind: "send", seatKeys: [seatKey], prompt };
  }
  if (!text) return { kind: "empty" };
  return { kind: "send", seatKeys: [], prompt: text };
}
