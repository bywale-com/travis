/**
 * Hotfix 037 — what a tool tells Travis about what actually happened.
 *
 * Travis has no other sense of elapsed time, of being blocked, or of queue
 * depth. A tool that returns "Sent to SA." after blocking for 26 seconds
 * leaves it to guess, and it guesses wrong out loud. These strings are the
 * only proprioception it gets, so they carry the cost-relevant facts and
 * nothing else — no reply bodies, no thoughts.
 */

export type SendOutcome = {
  seatLabel: string;
  queued: boolean;
  waitingAhead?: number;
  elapsedMs: number;
  errored?: boolean;
  replyChars?: number;
};

export function elapsedPhrase(ms: number): string {
  if (ms < 1000) return "under a second";
  const s = Math.round(ms / 1000);
  if (s < 90) return `${s}s`;
  return `${Math.round(s / 60)}m`;
}

export function sendReceipt(o: SendOutcome): string {
  if (o.queued) {
    const ahead = o.waitingAhead ?? 0;
    return ahead > 0
      ? `Queued for ${o.seatLabel} — ${ahead} waiting ahead of it. Not sent yet.`
      : `Queued for ${o.seatLabel} — that seat is busy. Not sent yet.`;
  }
  const waited = `This call blocked for ${elapsedPhrase(o.elapsedMs)}.`;
  if (o.errored) return `Sent to ${o.seatLabel}. The run errored. ${waited}`;
  if (!o.replyChars) {
    return `Sent to ${o.seatLabel}. The run finished with no reply text. ${waited}`;
  }
  return `Sent to ${o.seatLabel}. The run finished and the reply is in the room log (${o.replyChars} characters). ${waited}`;
}

/**
 * Hotfix 039 — dispatch leaves the work running, so the receipt must not
 * imply an answer came back.
 */
export function dispatchReceipt(
  o:
    | { status: "started"; seatLabel: string }
    | { status: "queued"; seatLabel: string; waitingAhead: number }
    | { status: "stand-in"; seatLabel: string }
    | { status: "busy"; seatLabel: string }
    | { status: "error"; seatLabel: string; error: string },
): string {
  if (o.status === "started") {
    return `${o.seatLabel} is now running it. Nothing came back yet — read_seat_reply once it lands.`;
  }
  if (o.status === "queued") {
    return o.waitingAhead > 0
      ? `Queued for ${o.seatLabel} behind ${o.waitingAhead} already waiting. It will go when that seat frees up.`
      : `Queued for ${o.seatLabel} — that seat is busy right now. It will go when the seat frees up.`;
  }
  if (o.status === "stand-in") {
    return `${o.seatLabel} is not wired to a Cursor agent, so nothing ran.`;
  }
  if (o.status === "busy") {
    return `${o.seatLabel} is busy. Role dest does not queue — spin a next seat.`;
  }
  return `Could not start ${o.seatLabel}: ${o.error}`;
}

export type RunningSeat = { seatLabel: string; elapsedMs: number };
export type WaitingSeat = { seatLabel: string; count: number };

export function inFlightReport(
  running: RunningSeat[],
  waiting: WaitingSeat[],
): string {
  const parts: string[] = [];
  parts.push(
    running.length
      ? `Running now: ${running
          .map((r) => `${r.seatLabel} (${elapsedPhrase(r.elapsedMs)} so far)`)
          .join(", ")}.`
      : "Nothing running.",
  );
  const real = waiting.filter((w) => w.count > 0);
  parts.push(
    real.length
      ? `Waiting: ${real.map((w) => `${w.seatLabel} ${w.count}`).join(", ")}.`
      : "Nothing waiting.",
  );
  return parts.join(" ");
}
