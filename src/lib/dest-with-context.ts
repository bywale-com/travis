/**
 * SCP-030 — dest-with-context grain.
 * Here stays clipped. Dest / filesystem read unclipped tape.
 */

import {
  WINDOW_TURNS,
  isContextWorthy,
  type ContextTurn,
} from "./room-context";

const MARKERS = [
  "as context",
  "printed chat",
  "send that list",
  "including what we just",
  "including the one we just",
] as const;

export type PrintTurn = ContextTurn & { seatLabel?: string };

export function isDestWithContextAsk(text: string): boolean {
  const t = text.toLowerCase();
  return MARKERS.some((m) => t.includes(m));
}

export function lastTravisSpeakablePost(turns: PrintTurn[]): PrintTurn | null {
  for (let i = turns.length - 1; i >= 0; i--) {
    const turn = turns[i];
    if (
      turn.kind === "agent_post" &&
      turn.seatKey === "travis" &&
      turn.speakable !== false &&
      turn.text.trim()
    ) {
      return turn;
    }
  }
  return null;
}

/** Labels on print lines — not describeTurn. */
export function formatPrintLine(turn: PrintTurn): string {
  const text = turn.text;
  if (turn.kind === "agent_post" && turn.seatKey === "travis") {
    return `Travis: ${text}`;
  }
  if (turn.kind === "user" && (!turn.seatKey || turn.seatKey === "travis")) {
    return `Founder: ${text}`;
  }
  const label = (turn.seatLabel ?? "").trim() || "Seat";
  return `${label}: ${text}`;
}

/**
 * Last Travis speakable post, full, then other worthy turns in the last
 * WINDOW_TURNS, raw text, no LINE_CAP. Does not duplicate that Travis post.
 */
export function unclippedPrint(turns: PrintTurn[]): string {
  const travis = lastTravisSpeakablePost(turns);
  if (!travis) return "";

  const window = turns.filter(isContextWorthy).slice(-WINDOW_TURNS);
  const lines: string[] = [formatPrintLine(travis)];
  let skippedTravis = false;
  for (const turn of window) {
    if (
      !skippedTravis &&
      turn.kind === "agent_post" &&
      turn.seatKey === "travis" &&
      turn.text === travis.text
    ) {
      skippedTravis = true;
      continue;
    }
    if (!turn.text.trim()) continue;
    lines.push(formatPrintLine(turn));
  }
  return lines.join("\n");
}

export function assembleDestWithContext(params: {
  ask: string;
  print: string;
}): string {
  return `${params.ask.trim()}\n\n${params.print}`;
}
