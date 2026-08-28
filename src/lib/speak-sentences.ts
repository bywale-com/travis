/**
 * Pull closed speak units from a growing assistant post.
 * A unit ends at .!? (with following space) or a blank line. Remainder stays
 * buffered until the next boundary or flush (run done).
 */

const SENTENCE_END = /[.!?…]["”')\]]*(?=\s)/;
const PARA_BREAK = /\n\n/;

export function pullClosedSentences(buffer: string): {
  closed: string[];
  rest: string;
} {
  const closed: string[] = [];
  let cur = buffer;
  for (;;) {
    const para = cur.search(PARA_BREAK);
    const sent = cur.search(SENTENCE_END);
    const paraHit = para >= 0;
    const sentHit = sent >= 0;
    if (!paraHit && !sentHit) break;

    const takePara = paraHit && (!sentHit || para <= sent);
    let cut: number;
    let skip: number;
    if (takePara) {
      cut = para;
      skip = 2;
    } else {
      const m = cur.slice(sent).match(/^[.!?…]["”')\]]*/);
      cut = sent + (m ? m[0].length : 1);
      skip = 0;
    }
    const piece = cur.slice(0, cut).trim();
    if (piece) closed.push(piece);
    cur = cur.slice(cut + skip).replace(/^\s+/, "");
  }
  return { closed, rest: cur };
}

export function flushSpeakBuffer(buffer: string): string[] {
  const { closed, rest } = pullClosedSentences(buffer);
  const tail = rest.trim();
  return tail ? [...closed, tail] : closed;
}
