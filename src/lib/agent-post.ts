/**
 * Agent-post display subset — heading, list, inline code, paragraphs.
 * Store stays voice_turn.text; this is render + speak hygiene only.
 */

export type PostInline =
  | { type: "text"; text: string }
  | { type: "code"; text: string };

export type PostBlock =
  | { type: "heading"; inlines: PostInline[] }
  | { type: "paragraph"; inlines: PostInline[] }
  | { type: "list"; ordered: boolean; items: PostInline[][] };

const HEADING = /^(#{1,3})\s+(.+)$/;
const UL = /^[-*]\s+(.+)$/;
const OL = /^\d+\.\s+(.+)$/;
const BOLD_LINE = /^\*\*(.+)\*\*$/;

export function parseInline(src: string): PostInline[] {
  const out: PostInline[] = [];
  const re = /`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m.index > last) {
      out.push({ type: "text", text: src.slice(last, m.index) });
    }
    out.push({ type: "code", text: m[1] });
    last = m.index + m[0].length;
  }
  if (last < src.length) out.push({ type: "text", text: src.slice(last) });
  return out.length ? out : [{ type: "text", text: "" }];
}

function isBlockStart(line: string): boolean {
  return HEADING.test(line) || UL.test(line) || OL.test(line);
}

export function parseAgentPost(src: string): PostBlock[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: PostBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    if (!raw.trim()) {
      i += 1;
      continue;
    }

    const heading = raw.match(HEADING);
    if (heading) {
      blocks.push({ type: "heading", inlines: parseInline(heading[2].trim()) });
      i += 1;
      continue;
    }

    const boldLine = raw.trim().match(BOLD_LINE);
    if (boldLine && !raw.includes("`")) {
      blocks.push({ type: "heading", inlines: parseInline(boldLine[1].trim()) });
      i += 1;
      continue;
    }

    const ul = raw.match(UL);
    const ol = raw.match(OL);
    if (ul || ol) {
      const ordered = Boolean(ol);
      const items: PostInline[][] = [];
      while (i < lines.length) {
        const line = lines[i];
        if (!line.trim()) {
          const next = lines[i + 1];
          if (next && (ordered ? OL.test(next) : UL.test(next))) {
            i += 1;
            continue;
          }
          break;
        }
        const nextUl = line.match(UL);
        const nextOl = line.match(OL);
        if (ordered && nextOl) {
          items.push(parseInline(nextOl[1].trim()));
          i += 1;
          continue;
        }
        if (!ordered && nextUl) {
          items.push(parseInline(nextUl[1].trim()));
          i += 1;
          continue;
        }
        break;
      }
      if (items.length) blocks.push({ type: "list", ordered, items });
      continue;
    }

    const para: string[] = [];
    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim() || isBlockStart(line)) break;
      const boldOnly = line.trim().match(BOLD_LINE);
      if (boldOnly && !line.includes("`") && para.length === 0) break;
      para.push(line);
      i += 1;
    }
    if (para.length) {
      blocks.push({
        type: "paragraph",
        inlines: parseInline(para.join(" ").replace(/\s+/g, " ").trim()),
      });
    }
  }

  return blocks.length
    ? blocks
    : [{ type: "paragraph", inlines: parseInline(src) }];
}

function inlinesToSpeak(inlines: PostInline[]): string {
  return inlines.map((piece) => piece.text).join("");
}

/** Strip markup punctuation so TTS does not read hashes, ticks, or list marks. */
export function speakableAgentPost(src: string): string {
  const parts: string[] = [];
  for (const block of parseAgentPost(src)) {
    if (block.type === "list") {
      for (const item of block.items) {
        const line = inlinesToSpeak(item).trim();
        if (line) parts.push(line);
      }
      continue;
    }
    const line = inlinesToSpeak(block.inlines).trim();
    if (line) parts.push(line);
  }
  return parts.join(". ").replace(/\s+/g, " ").trim();
}
