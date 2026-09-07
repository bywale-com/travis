/**
 * SCP-027 — glass dest. Catalog pm is hidden. Person label wins.
 */

export function isCatalogPm(seatKey: string | null | undefined): boolean {
  return seatKey === "pm";
}

export function isLivingCursorId(id: string | null | undefined): boolean {
  return /^bc-[a-f0-9-]+$/i.test((id ?? "").trim());
}

/** SCP-033 — spin only when nobody living. Idle in this room wins. */
export function roleDestPick(params: {
  idleInRoomId: string | null;
  livingId: string | null;
}): "idle" | "living" | "spin" {
  if (params.idleInRoomId) return "idle";
  if (params.livingId) return "living";
  return "spin";
}

export function hideCatalogPm<T extends { seatKey?: string | null }>(
  rows: T[],
): T[] {
  return rows.filter((row) => !isCatalogPm(row.seatKey));
}

/** Dest / New name. Never print catalog PM. */
export function destGlassName(
  seatKey: string | null | undefined,
  label?: string | null,
): string {
  const named = label?.trim();
  if (named && named !== "PM") return named;
  if (seatKey === "engineer") return "Engineer";
  if (seatKey === "sa") return "SA";
  if (seatKey === "travis") return "Travis";
  if (seatKey === "pm") return "Technical PM";
  return named || "that seat";
}

/** Quote staple — who wrote the referenced bubble. */
export function quoteAuthorLabel(params: {
  kind?: string | null;
  seatKey?: string | null;
  label?: string | null;
}): string {
  if (params.kind === "user") return "You";
  const glass = destGlassName(params.seatKey, params.label);
  if (glass !== "that seat") return glass;
  return params.seatKey?.trim() || "that seat";
}

export function quoteRailText(params: {
  authorLabel: string;
  text: string;
  max?: number;
}): string {
  const max = params.max ?? 120;
  const clipped = params.text.slice(0, max);
  const more = params.text.length > max ? "…" : "";
  return `${params.authorLabel} — ${clipped}${more}`;
}

export function replyToLabel(authorLabel: string): string {
  return `Reply to ${authorLabel}`;
}
