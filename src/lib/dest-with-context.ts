/**
 * SCP-031 — dest-with-context grain.
 * Here stays clipped. Dest / kit file is this session’s worthy tape.
 */

import { isContextWorthy, type ContextTurn } from "./room-context";

export type PrintTurn = ContextTurn & { seatLabel?: string };

export const ROSTER_DEST_LINES = [
  "Named dest to Technical PM, SA, or Engineer is send_to_seat or dispatch_to_seat with seat=pm|sa|engineer and no who.",
  "Do not create_agent for that dest. Catalog pm is not this bind.",
  "New PM is create_agent then sit_agent — only when they asked for a new person.",
] as const;

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
 * Worthy turns in the look, chronological, raw text, no LINE_CAP,
 * no WINDOW_CHAR_CAP, no last-Travis-required. Empty tape → "".
 */
export function unclippedPrint(turns: PrintTurn[]): string {
  const seen = new Set<string>();
  const lines: string[] = [];
  for (const turn of turns) {
    if (!isContextWorthy(turn)) continue;
    const text = turn.text.trim();
    if (!text) continue;
    const line = formatPrintLine(turn);
    if (seen.has(line)) continue;
    seen.add(line);
    lines.push(line);
  }
  return lines.join("\n");
}

export function assembleDestWithContext(params: {
  ask: string;
  print: string;
}): string {
  const ask = params.ask.trim();
  if (!params.print.trim()) return ask;
  return `${ask}\n\n${params.print}`;
}

/** Kit `/roster.md` — roster plus named-dest fact. Not a classifier. */
export function formatRosterFact(roster: string): string {
  const body = roster.trim();
  const fact = ROSTER_DEST_LINES.join("\n");
  return body ? `${body}\n\n${fact}` : fact;
}
