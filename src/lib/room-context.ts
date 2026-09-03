import { requestLogPointer } from "@/lib/request-log";

/**
 * Hotfix 038 — the slice of the room Travis is handed without asking.
 *
 * Travis confabulates when it has no sense organ pointed at the room: it said
 * "I don't have the two tasks you're referring to" while both tasks sat four
 * seconds old in `voice_turn`. A tool cannot fix that, because pulling
 * requires knowing you need to pull. So a bounded window is pushed instead.
 *
 * Bounded is the whole point. Seat posts become receipts, thoughts never
 * appear, and the result is trimmed from the oldest end to a hard ceiling —
 * so a room that runs for hours costs the same per turn as one a minute old.
 */

/** Turns considered. Older than this never enters the window. */
export const WINDOW_TURNS = 14;
/** A user or Travis line longer than this is cut. */
export const LINE_CAP = 300;
/** How much of a seat reply the receipt quotes. */
export const RECEIPT_QUOTE = 140;
/** Hard ceiling on the whole window. Oldest lines drop first. */
export const WINDOW_CHAR_CAP = 2600;
/** Longest verbatim seat reply that may cross into Travis. */
export const READ_CAP = 1800;

export type ReadForm = "auto" | "gist" | "full";

/**
 * Nobody wants forty thousand characters read aloud, so a long reply is
 * condensed unless the caller insists on the text.
 */
export function shouldSummarize(length: number, form: ReadForm): boolean {
  if (form === "gist") return true;
  if (form === "full") return false;
  return length > READ_CAP;
}

export type ContextTurn = {
  kind: string;
  seatKey?: string | null;
  text: string;
};

export type RunningNote = { seatLabel: string; elapsedMs: number };

function clip(text: string, cap: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length <= cap ? flat : `${flat.slice(0, cap).trimEnd()}…`;
}

/** Thoughts and routine status are noise Travis should never pay for. */
export function isContextWorthy(turn: ContextTurn): boolean {
  if (turn.kind === "agent_thought") return false;
  if (turn.kind === "status") return /error/i.test(turn.text);
  return Boolean(turn.text.trim());
}

export function describeTurn(turn: ContextTurn, seatLabel: string): string {
  if (turn.kind === "status") return `[${seatLabel} run error]`;
  if (turn.kind === "agent_post") {
    const size = turn.text.replace(/\s+/g, " ").trim().length;
    if (turn.seatKey === "travis") return `You said: ${clip(turn.text, LINE_CAP)}`;
    return `${seatLabel} replied (${size} chars): "${clip(turn.text, RECEIPT_QUOTE)}" — full text is in the room log.`;
  }
  if (turn.seatKey && turn.seatKey !== "travis") {
    return `You sent to ${seatLabel}: ${clip(turn.text, LINE_CAP)}`;
  }
  return `Founder: ${clip(turn.text, LINE_CAP)}`;
}

/**
 * Newest lines are the ones worth keeping, so trim from the oldest end.
 */
export function trimToCap(lines: string[], cap = WINDOW_CHAR_CAP): string[] {
  const kept: string[] = [];
  let total = 0;
  for (let i = lines.length - 1; i >= 0; i--) {
    const cost = lines[i].length + 1;
    if (total + cost > cap) break;
    kept.unshift(lines[i]);
    total += cost;
  }
  return kept;
}

export function buildRoomContext(params: {
  turns: Array<ContextTurn & { seatLabel: string }>;
  running?: RunningNote[];
  requestCount?: number;
  charCap?: number;
}): string {
  const lines = params.turns
    .filter(isContextWorthy)
    .slice(-WINDOW_TURNS)
    .map((t) => describeTurn(t, t.seatLabel));

  const body = trimToCap(lines, params.charCap ?? WINDOW_CHAR_CAP);
  const pointer = requestLogPointer(params.requestCount ?? 0);

  const parts: string[] = [];
  if (params.running?.length) {
    parts.push(
      `Running right now: ${params.running
        .map(
          (r) =>
            `${r.seatLabel} (${Math.max(1, Math.round(r.elapsedMs / 1000))}s so far)`,
        )
        .join(", ")}.`,
    );
  }
  if (pointer) parts.push(pointer);
  if (body.length) {
    parts.push(`Recent room log, oldest first:\n${body.join("\n")}`);
  }
  if (!parts.length) return "";
  return `--- Room state (you are seeing this without asking; it is already true) ---\n${parts.join(
    "\n\n",
  )}\n--- end room state ---`;
}
