/**
 * Hands-free turn conductor (SCP-001).
 * Match done-phrases at the end of accumulated utterance; strip phrase from prompt text.
 */

export type PhraseMatch = {
  matched: boolean;
  cleanedText: string;
  matchedPhrase?: string;
};

function normalizeTail(s: string): string {
  return s
    .trim()
    .replace(/[.?!]+$/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/** Web Speech often expands I'm → I am. Same locked phrase. */
function foldSttContractions(s: string): string {
  return s.replace(/\bi am done\b/gi, "I'm done");
}

/** Prefer longer phrases first (caller should sort). */
export function matchConductorPhrase(
  utterance: string,
  phrases: string[],
): PhraseMatch {
  const trimmed = foldSttContractions(utterance.trim());
  if (!trimmed) {
    return { matched: false, cleanedText: "" };
  }

  const sorted = [...phrases].sort((a, b) => b.length - a.length);

  for (const phrase of sorted) {
    const p = phrase.trim();
    if (!p) continue;

    // Case-insensitive: phrase appears as end of utterance; allow trailing .?!
    const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(?:^|\\s)${escaped}\\s*[.?!]*\\s*$`, "i");
    if (re.test(trimmed)) {
      const cleaned = trimmed.replace(re, "").trim();
      return {
        matched: true,
        cleanedText: cleaned,
        matchedPhrase: p,
      };
    }

    // Also allow exact-normalized equality when utterance is only the phrase
    if (normalizeTail(trimmed) === normalizeTail(p)) {
      return { matched: true, cleanedText: "", matchedPhrase: p };
    }
  }

  return { matched: false, cleanedText: trimmed };
}
