/**
 * SCP-027 — glass dest. Catalog pm is hidden. Person label wins.
 */

export function isCatalogPm(seatKey: string | null | undefined): boolean {
  return seatKey === "pm";
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
