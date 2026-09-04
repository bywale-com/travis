/**
 * SCP-014 — dest-seat beat closer. Same insert/update law as Live Travis.
 *
 * Stream events are snapshots or suffix tokens of one message, or a new
 * message. absorbText's concatenate branch is the growing-bubble glue.
 * When that branch would fire, nextLiveTravisText decides insert vs update.
 */

import { absorbText, nextLiveTravisText } from "@/lib/absorb-text";

/**
 * Conversation is the finished run. Do not append its beats onto streamed
 * ones with fold — that replays b1 after b3. Align by index instead.
 */
export function alignStreamedBeats(
  streamed: string[],
  completed: string[],
): { beats: string[]; growLast: string | null; extra: string[] } {
  if (!completed.length) {
    return { beats: streamed, growLast: null, extra: [] };
  }
  if (!streamed.length) {
    return { beats: completed, growLast: null, extra: completed };
  }
  const beats = [...streamed];
  let growLast: string | null = null;
  const n = Math.min(beats.length, completed.length);
  for (let i = 0; i < n; i++) {
    const next = nextLiveTravisText(beats[i], completed[i]);
    if (next.mode === "update") {
      beats[i] = next.text;
      if (i === beats.length - 1 && next.text !== streamed[i]) {
        growLast = next.text;
      }
    }
  }
  const extra = completed.slice(beats.length);
  return { beats: [...beats, ...extra], growLast, extra };
}

export function foldAssistantBeats(parts: string[]): string[] {
  const beats: string[] = [];
  for (const raw of parts) {
    const part = raw.trim();
    if (!part) continue;
    if (!beats.length) {
      beats.push(part);
      continue;
    }
    const next = nextLiveTravisText(beats[beats.length - 1], part);
    if (next.mode === "update") beats[beats.length - 1] = next.text;
    else beats.push(next.text);
  }
  return beats;
}

function looksLikeTokenSuffix(prev: string, incoming: string): boolean {
  if (!prev || !incoming) return false;
  if (/\s/.test(incoming)) return false;
  if (incoming.length > 32) return false;
  return /[A-Za-z0-9]$/.test(prev);
}

export function nextDestSeatText(
  prev: string,
  incoming: string,
): { mode: "update" | "insert"; text: string; delta: string } {
  const a = prev.trim();
  const b = incoming.trim();
  if (!b) return { mode: "update", text: a, delta: "" };
  if (!a) return { mode: "insert", text: b, delta: b };

  const absorbed = absorbText(a, b);
  const snapshotOrDup =
    b.startsWith(a) || a.startsWith(b) || a.endsWith(b);
  if (snapshotOrDup) {
    return { mode: "update", text: absorbed.acc, delta: absorbed.delta };
  }
  if (looksLikeTokenSuffix(a, b) && absorbed.acc === a + b) {
    return { mode: "update", text: absorbed.acc, delta: absorbed.delta };
  }

  const next = nextLiveTravisText(a, b);
  if (next.mode === "update") {
    const d = absorbText(a, next.text);
    return { mode: "update", text: next.text, delta: d.delta };
  }
  return { mode: "insert", text: next.text, delta: next.text };
}

export function nextSeatBeat(params: {
  current: { id: string; text: string } | null;
  incoming: string;
  userTurnId: string;
}): { mode: "update" | "insert"; text: string; referenceTurnId: string } {
  const incoming = params.incoming.trim();
  if (!params.current) {
    return {
      mode: "insert",
      text: incoming,
      referenceTurnId: params.userTurnId,
    };
  }
  const next = nextLiveTravisText(params.current.text, incoming);
  if (next.mode === "update") {
    return {
      mode: "update",
      text: next.text,
      referenceTurnId: params.current.id,
    };
  }
  return {
    mode: "insert",
    text: next.text,
    referenceTurnId: params.current.id,
  };
}

export function postIsInRunChain(
  post: { id: string; referenceTurnId: string | null },
  userTurnId: string,
  parentOf: (
    id: string,
  ) => { id: string; referenceTurnId: string | null } | null,
): boolean {
  let ref = post.referenceTurnId;
  const seen = new Set<string>([post.id]);
  while (ref) {
    if (ref === userTurnId) return true;
    if (seen.has(ref)) return false;
    seen.add(ref);
    const parent = parentOf(ref);
    if (!parent) return false;
    ref = parent.referenceTurnId;
  }
  return false;
}

/** Hide only the open beat while it streams — earlier beats in the run stay. */
export function isOpenStreamingPost(params: {
  turnId: string;
  seatKey: string | null | undefined;
  streamingPostIds: Record<string, string>;
}): boolean {
  return params.streamingPostIds[params.seatKey ?? "_"] === params.turnId;
}
