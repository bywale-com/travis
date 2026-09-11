/**
 * Outcome of a use. Door headers are not the app.
 * Do not grade reply quality. Unwired on a think-walk is red — unwired glass is its own walk.
 */

export type TapeTurn = {
  text: string;
  role: string;
  kind: string;
  seatKey: string | null;
  speakable: boolean;
  seq: number;
};

export type DoorTrace = {
  events?: string[];
  error?: string;
  status?: number;
  kind?: string;
};

export function isRunErrorTurn(turn: TapeTurn): boolean {
  if (turn.kind !== "status") return false;
  return /error/i.test(turn.text);
}

export function isNamedUnwired(turn: TapeTurn): boolean {
  return turn.kind === "status" && /isn.t wired/i.test(turn.text);
}

export function travisSpoke(turns: TapeTurn[]): boolean {
  return travisSpeakCount(turns) > 0;
}

export function travisSpeakCount(turns: TapeTurn[]): number {
  return turns.filter(
    (t) =>
      t.kind === "agent_post" &&
      t.seatKey === "travis" &&
      t.speakable &&
      t.text.trim().length > 0,
  ).length;
}

export function formatTape(turns: TapeTurn[]): string {
  if (!turns.length) return "(empty tape)";
  return turns
    .map((t) => {
      const text = t.text.replace(/\s+/g, " ").trim().slice(0, 220);
      return `#${t.seq} ${t.kind}/${t.seatKey ?? "-"} speak=${t.speakable} ${text}`;
    })
    .join("\n");
}

export function failUse(
  label: string,
  reason: string,
  turns: TapeTurn[],
  trace?: DoorTrace,
): never {
  const bits = [`${label}: ${reason}`, "tape:", formatTape(turns)];
  if (trace?.kind) bits.push(`door kind=${trace.kind} status=${trace.status ?? "?"}`);
  if (trace?.events?.length) bits.push(`sse events: ${trace.events.join(",")}`);
  if (trace?.error) bits.push(`sse error: ${trace.error}`);
  throw new Error(bits.join("\n"));
}

/** Think-walk miss. Named unwired is red here. Do not grade the sentence. */
export function thinkMissReason(turns: TapeTurn[]): string | null {
  if (turns.some(isNamedUnwired)) {
    return "Travis isn’t wired — think-walk is red (unwired glass is its own walk)";
  }
  const miss = turns.filter(isRunErrorTurn);
  if (miss.length) {
    return `run error on tape: ${miss.map((t) => t.text || "(empty status)").join(" | ")}`;
  }
  if (!travisSpoke(turns)) {
    return "Travis did not speak (no speakable travis agent_post)";
  }
  return null;
}

export function assertThinkWorked(
  turns: TapeTurn[],
  label: string,
  trace?: DoorTrace,
): void {
  const reason = thinkMissReason(turns);
  if (reason) failUse(label, reason, turns, trace);
}

export function destLeaveStarted(queue: {
  queue: unknown;
  drainable?: unknown;
  running?: unknown;
}): boolean {
  const running = Array.isArray(queue.running) ? queue.running : [];
  if (running.length > 0) return true;
  const drainable = Array.isArray(queue.drainable) ? queue.drainable : [];
  if (drainable.length > 0) return true;
  const q = queue.queue;
  if (Array.isArray(q) && q.length > 0) return true;
  if (q && typeof q === "object") {
    const seats = (q as { seats?: unknown[] }).seats;
    if (Array.isArray(seats) && seats.length > 0) return true;
  }
  return false;
}
