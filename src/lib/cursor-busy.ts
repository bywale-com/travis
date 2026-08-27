/**
 * Cursor one-run-per-agent: send fails with agent_busy while a run is live.
 * Retry is pipe hygiene (do not drop the utterance). Not a durable queue store.
 */

export const BUSY_RETRY_DELAYS_MS = [2500, 5000, 10000] as const;

export function isAgentBusyError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /\[agent_busy\]/i.test(msg) || /already has an active run/i.test(msg);
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
