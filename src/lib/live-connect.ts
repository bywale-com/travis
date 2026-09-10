/**
 * Voice Live connect rules. Kept out of Room so the three lies fail in npm test.
 * 019 / 020 — in-flight is wait, not down. Unwired keeps its own line.
 */

export type LiveConnectDecision = "already-up" | "wait" | "start";

export type LiveConnectMiss = "unwired" | "miss";

export const UNWIRED_LINE = "Travis isn’t wired";

export const LIVE_DOWN_SHIRT =
  "Travis Live is down — phone ear. Say “I’m done”.";

export function decideLiveConnect(state: {
  alreadyUp: boolean;
  connecting: boolean;
}): LiveConnectDecision {
  if (state.alreadyUp) return "already-up";
  if (state.connecting) return "wait";
  return "start";
}

/** After connect returns false: do not paint the phone-ear shirt over unwired. */
export function liveMissSubtitle(reason: LiveConnectMiss): string {
  return reason === "unwired" ? UNWIRED_LINE : LIVE_DOWN_SHIRT;
}

export async function waitForLiveConnect(opts: {
  isConnecting: () => boolean;
  isUp: () => boolean;
  pollMs?: number;
  timeoutMs?: number;
}): Promise<boolean> {
  const pollMs = opts.pollMs ?? 40;
  const timeoutMs = opts.timeoutMs ?? 15_000;
  const started = Date.now();
  while (opts.isConnecting()) {
    if (Date.now() - started >= timeoutMs) return opts.isUp();
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
  return opts.isUp();
}
