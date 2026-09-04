/**
 * SCP-010 — catalog title. Harness clip, not a model name.
 */

export const INITIATIVE_TITLE_CAP = 40;

/** Flatten, first sentence, 40 chars, word-break after char 12. */
export function clipInitiativeTitle(raw: string): string {
  const flat = String(raw ?? "").replace(/\s+/g, " ").trim();
  if (!flat) return "";
  const stop = flat.search(/[.?!]/);
  const sentence = (stop >= 0 ? flat.slice(0, stop + 1) : flat).trim();
  if (sentence.length <= INITIATIVE_TITLE_CAP) return sentence;
  const window = sentence.slice(0, INITIATIVE_TITLE_CAP);
  const lastSpace = window.lastIndexOf(" ");
  if (lastSpace > 12) return window.slice(0, lastSpace).trimEnd();
  return window.trimEnd();
}

/** Lived 20:17 — STT said “SAE” for SA. */
const NEEDLE_ALIASES: Record<string, string> = {
  sae: "sa",
  essay: "sa",
  "the sae": "sa",
  "the sa": "sa",
  "the essay": "sa",
  "systems analyst": "sa",
  "the systems analyst": "sa",
};

export function normalizeCatalogNeedle(needle: string): string {
  const q = needle.trim().toLowerCase().replace(/\s+/g, " ");
  if (!q) return "";
  return NEEDLE_ALIASES[q] ?? q;
}

export function catalogNeedleHits(needle: string, parts: string[]): boolean {
  const q = normalizeCatalogNeedle(needle);
  if (!q) return true;
  return parts.some((part) => {
    const hay = String(part ?? "").toLowerCase();
    if (hay.includes(q)) return true;
    if (q === "sa" && /systems\s+analyst|\bsa\b/.test(hay)) return true;
    return false;
  });
}

export function pathBasename(path: string): string {
  const trimmed = String(path ?? "").trim().replace(/\\/g, "/");
  return trimmed.split("/").filter(Boolean).pop() ?? trimmed;
}

/**
 * Lived 20:38 — “bundle That’s fine.” minted from “Yes, that’s the exact
 * one.” because send forgot id. A title already in the send or in
 * Travis’s last speech is that ticket. Last mention wins. Short titles
 * stay out so “SA” / “Okay.” do not steal the hang.
 */
export const NAMED_TITLE_MIN = 8;

export function namedTicketFromSpeech(
  tickets: Array<{ id: string; title: string }>,
  speeches: string[],
): string | null {
  const hay = speeches
    .map((s) => String(s ?? "").toLowerCase())
    .join("\n");
  if (!hay.trim()) return null;
  let best: { id: string; at: number; len: number } | null = null;
  for (const ticket of tickets) {
    const title = ticket.title.replace(/\s+/g, " ").trim();
    if (title.length < NAMED_TITLE_MIN) continue;
    const at = hay.lastIndexOf(title.toLowerCase());
    if (at < 0) continue;
    if (
      !best ||
      at > best.at ||
      (at === best.at && title.length > best.len)
    ) {
      best = { id: ticket.id, at, len: title.length };
    }
  }
  return best?.id ?? null;
}
