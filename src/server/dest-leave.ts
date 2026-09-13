/**
 * Hotfix 091 — write-and-leave with a queue-visible dest_job.
 * Role dests spin on busy via dispatchToRoleDest; person dests use dispatchToSeat.
 * File dest_job first. Cursor send may hang; the leave must already show on /queue.
 */

import { isSitProtocolRole, type SitProtocolRole } from "@/lib/protocol-path";
import { delay } from "@/lib/cursor-busy";
import { dispatchToSeat, type DispatchOutcome } from "@/server/dispatch";
import { insertDestJob, markDestJob } from "@/server/dest-job";
import { dispatchToRoleDest } from "@/server/sit";
import type { AgentBinding } from "@/server/db/schema";

/** Wait this long for Cursor run_started. After that the leave is already filed. */
export const LEAVE_HANDOFF_MS = 8_000;

export function isFounderOpsDestError(message: string): boolean {
  return /hard limit|upgrade to ultra|reached the limit for your current plan/i.test(
    message,
  );
}

async function handoff(params: {
  sessionId: string;
  binding: AgentBinding;
  prompt: string;
}): Promise<{ binding: AgentBinding; outcome: DispatchOutcome }> {
  let binding = params.binding;
  let outcome: DispatchOutcome;
  const role = binding.seatKey;
  if (role && isSitProtocolRole(role)) {
    const row = await dispatchToRoleDest({
      sessionId: params.sessionId,
      role: role as SitProtocolRole,
      text: params.prompt,
    });
    binding = row.binding;
    outcome = row.outcome;
  } else {
    outcome = await dispatchToSeat({
      sessionId: params.sessionId,
      binding,
      prompt: params.prompt,
    });
  }
  return { binding, outcome };
}

export async function writeAndLeaveDest(params: {
  sessionId: string;
  binding: AgentBinding;
  prompt: string;
}): Promise<DispatchOutcome> {
  const job = await insertDestJob({
    sessionId: params.sessionId,
    binding: params.binding,
    text: params.prompt,
    status: "dispatched",
  });
  await markDestJob(job.id, { status: "dispatched", heartbeat: true });

  const work = handoff(params);
  const raced = await Promise.race([
    work.then((row) => ({ tag: "done" as const, ...row })),
    delay(LEAVE_HANDOFF_MS).then(() => ({ tag: "timeout" as const })),
  ]);

  if (raced.tag === "timeout") {
    void work.catch(() => {});
    return {
      status: "started",
      runId: job.id,
      seatLabel: params.binding.label ?? "that seat",
    };
  }

  if (raced.outcome.status === "error") {
    await markDestJob(job.id, { status: "failed", done: raced.outcome.error });
    if (isFounderOpsDestError(raced.outcome.error)) {
      throw new Error(raced.outcome.error);
    }
    return raced.outcome;
  }

  if (raced.outcome.status === "busy") {
    await markDestJob(job.id, { status: "failed", done: "busy" });
    return raced.outcome;
  }

  return raced.outcome;
}
