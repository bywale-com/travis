/**
 * SCP-026 — Travis offers a landing. Not the body. Not “New message from engineer.”
 */

export type OfferSeat = {
  seatKey: string;
  label?: string | null;
  title?: string | null;
};

export type HearInvite = "hear" | "skip" | "verbatim" | null;

export function offerSeatWord(
  seatKey: string,
  label?: string | null,
): string {
  if (seatKey === "engineer") return "Engineer";
  if (seatKey === "pm") return "PM";
  if (seatKey === "sa") return "SA";
  const named = label?.trim();
  return named || "that seat";
}

export function offerContext(title?: string | null): string {
  const clipped = title?.replace(/\s+/g, " ").trim();
  return clipped || "that other thing";
}

function joinList(words: string[]): string {
  if (words.length <= 1) return words[0] ?? "";
  if (words.length === 2) return `${words[0]} and ${words[1]}`;
  return `${words.slice(0, -1).join(", ")}, and ${words[words.length - 1]}`;
}

function uniqueInOrder(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    if (seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  return out;
}

/** Locked offer copy. Not stored. Not the post body. */
export function offerBeat(items: OfferSeat[]): string {
  if (!items.length) return "";
  const contexts = uniqueInOrder(items.map((i) => offerContext(i.title)));
  const seats = uniqueInOrder(
    items.map((i) => offerSeatWord(i.seatKey, i.label)),
  );
  const about = joinList(contexts);
  if (seats.length === 1) {
    return `About ${about}, this is what the ${seats[0]} has to say. Hear it?`;
  }
  const who = seats.map((s) => `the ${s}`).join(" and ");
  return `About ${about}, this is what ${who} have to say. Hear it?`;
}

export function parseHearInvite(text: string): HearInvite {
  const t = text
    .trim()
    .toLowerCase()
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ");
  if (!t) return null;
  if (/^(skip|skip it|skip that)$/.test(t)) return "skip";
  if (/^(hear|hear it|hear that|next)$/.test(t)) return "hear";
  if (
    /^(read it|read the (full )?text|verbatim|full|form full)$/.test(t)
  ) {
    return "verbatim";
  }
  return null;
}

export function gistEmptyFallback(offer: string): string {
  const lead = offer.trim() || "Hear it?";
  return `${lead} The full text is in the Log.`;
}
