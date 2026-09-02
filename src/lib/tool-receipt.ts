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
