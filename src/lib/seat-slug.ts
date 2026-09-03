/** Unique worldwide seat_key from a free-text label. */

export function seatSlugFromLabel(label: string): string {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "agent";
}

export function nextUniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  for (let n = 2; n < 1000; n++) {
    const slug = `${base}-${n}`;
    if (!taken.has(slug)) return slug;
  }
  return `${base}-${Date.now()}`;
}
