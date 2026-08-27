/**
 * Cursor one-run-per-agent: send fails with agent_busy while a run is live.
 * Product path is enqueue or barge (SCP-003). Race-only retry if listRuns
 * shows no active run.
 */

export const RACE_RETRY_DELAY_MS = 800;

export function isAgentBusyError(err: unknown): boolean {
  if (err && typeof err === "object") {
    const e = err as { name?: string; code?: string };
    if (e.name === "AgentBusyError" || e.code === "agent_busy") return true;
  }
  const msg = err instanceof Error ? err.message : String(err);
  return /\[agent_busy\]/i.test(msg) || /already has an active run/i.test(msg);
}

export function isRunNotCancellable(err: unknown): boolean {
  if (err && typeof err === "object") {
    const e = err as { name?: string; code?: string };
    if (e.code === "run_not_cancellable") return true;
  }
  const msg = err instanceof Error ? err.message : String(err);
  return /run_not_cancellable/i.test(msg) || /not cancellable/i.test(msg);
}

/** Enqueue unless busy fired with no known live run — then one race retry. */
export function busySendDecision(args: {
  storedRunId: string | null;
  discoveredRunId: string | null;
}): "enqueue" | "race-retry" {
  if (args.storedRunId || args.discoveredRunId) return "enqueue";
  return "race-retry";
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
