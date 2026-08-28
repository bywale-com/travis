/**
 * Stream + STT assembly — snapshots vs deltas, speech stutter.
 */

export function absorbText(
  acc: string,
  incoming: string,
): { acc: string; delta: string } {
  if (!incoming) return { acc, delta: "" };
  if (!acc) return { acc: incoming, delta: incoming };
  if (incoming === acc) return { acc, delta: "" };
  if (incoming.startsWith(acc)) {
    return { acc: incoming, delta: incoming.slice(acc.length) };
  }
  if (acc.startsWith(incoming)) return { acc, delta: "" };
  if (acc.endsWith(incoming)) return { acc, delta: "" };
  return { acc: acc + incoming, delta: incoming };
}

export function absorbFinalTranscript(committed: string, incoming: string): string {
  const a = committed.trim();
  const b = incoming.trim();
  if (!b) return a;
  if (!a) return b;
  const al = a.toLowerCase();
  const bl = b.toLowerCase();
  if (bl === al) return b;
  if (bl.startsWith(al) || bl.startsWith(`${al} `)) return b;
  if (al.startsWith(bl) || al.startsWith(`${bl} `)) return a;
  if (al.endsWith(bl) || al.endsWith(` ${bl}`)) return a;

  const aw = a.split(/\s+/).filter(Boolean);
  const bw = b.split(/\s+/).filter(Boolean);
  for (let k = Math.min(aw.length, bw.length); k >= 3; k--) {
    const tail = aw.slice(-k).join(" ").toLowerCase();
    const head = bw.slice(0, k).join(" ").toLowerCase();
    if (tail === head || bl.startsWith(tail)) {
      return [...aw.slice(0, -k), ...bw].join(" ");
    }
  }

  return `${a} ${b}`.trim();
}

/** Drop a leading phrase when the rest starts with the same phrase (growing concat). */
function foldGrowingConcat(words: string[]): string[] {
  const w = [...words];
  let i = 0;
  let guard = 0;
  while (i < w.length && guard++ < 80) {
    let folded = false;
    const maxN = Math.min(24, w.length - i - 1);
    for (let n = maxN; n >= 2; n--) {
      const head = w.slice(i, i + n).join(" ").toLowerCase();
      const rest = w.slice(i + n).join(" ").toLowerCase();
      if (rest.startsWith(head)) {
        w.splice(i, n);
        folded = true;
        break;
      }
    }
    if (!folded) i += 1;
  }
  return w;
}

/** Collapse consecutive duplicate words, repeated n-grams, and growing concatenations. */
export function collapseSpeechStutter(text: string): string {
  const words = text.split(/\s+/).filter(Boolean);
  const dedup: string[] = [];
  for (const w of words) {
    if (
      dedup.length &&
      dedup[dedup.length - 1].toLowerCase() === w.toLowerCase()
    ) {
      continue;
    }
    dedup.push(w);
  }

  let result = dedup;
  for (let n = Math.min(12, Math.floor(result.length / 2)); n >= 2; n--) {
    const next: string[] = [];
    let i = 0;
    while (i < result.length) {
      if (i + 2 * n <= result.length) {
        const gram = result.slice(i, i + n).join(" ").toLowerCase();
        const follow = result.slice(i + n, i + 2 * n).join(" ").toLowerCase();
        if (gram === follow) {
          next.push(...result.slice(i, i + n));
          i += 2 * n;
          while (
            i + n <= result.length &&
            result.slice(i, i + n).join(" ").toLowerCase() === gram
          ) {
            i += n;
          }
          continue;
        }
      }
      next.push(result[i]);
      i += 1;
    }
    result = next;
  }

  return foldRestartedPassage(foldGrowingConcat(result)).join(" ");
}

/**
 * Web Speech often restarts after a hitch and dumps the same long
 * passage again, with a few junk words in between ("exit again").
 * Phrase n-grams (2–5) miss that. Keep the later copy.
 */
function foldRestartedPassage(words: string[]): string[] {
  const lower = words.map((w) => w.toLowerCase());
  const minN = 6;
  const maxJunk = 8;
  const maxN = Math.min(40, Math.floor(words.length / 2));
  for (let n = maxN; n >= minN; n--) {
    const head = lower.slice(0, n).join(" ");
    for (let junk = 0; junk <= maxJunk; junk++) {
      const at = n + junk;
      if (at + n > lower.length) break;
      if (lower.slice(at, at + n).join(" ") === head) {
        return foldRestartedPassage(words.slice(at));
      }
    }
  }
  return words;
}

/**
 * Live draft = committed finals + current interim, without gluing a copy
 * of the same sentence onto itself (Android often re-sends the committed
 * prefix as interim).
 */
export function mergeLiveTranscript(committed: string, interim: string): string {
  const a = committed.trim();
  const b = interim.trim();
  if (!b) return collapseSpeechStutter(a);
  if (!a) return collapseSpeechStutter(b);
  return collapseSpeechStutter(absorbFinalTranscript(a, b));
}

/**
 * Web Speech starts a new recognizer after silence. That session's result
 * list is empty, so callers must keep prior finals and absorb the new ones.
 */
export function carryDraftAcrossRestart(
  held: string,
  sessionFinals: string,
): string {
  return collapseSpeechStutter(absorbFinalTranscript(held, sessionFinals));
}
