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
  return `${a} ${b}`.trim();
}

/** Collapse consecutive duplicate words and repeated n-grams from Web Speech. */
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
  for (let n = Math.min(5, Math.floor(result.length / 2)); n >= 2; n--) {
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

  return result.join(" ");
}
