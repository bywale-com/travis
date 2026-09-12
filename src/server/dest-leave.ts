/**
 * Hotfix 091 — write-and-leave with a queue-visible dest_job.
 * Role dests spin on busy via dispatchToRoleDest; person dests use dispatchToSeat.
 */

import { isSitProtocolRole, type SitProtocolRole } from "@/lib/protocol-path";
import { dispatchToSeat, type DispatchOutcome } from "@/server/dispatch";
import { insertDestJob, markDestJob } from "@/server/dest-job";
import { dispatchToRoleDest } from "@/server/sit";
import type { AgentBinding } from "@/server/db/schema";

export async function writeAndLeaveDest(params: {
  sessionId: string;
  binding: AgentBinding;
  prompt: string;
}): Promise<DispatchOutcome> {
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
  if (outcome.status === "started" || outcome.status === "queued") {
    const job = await insertDestJob({
      sessionId: params.sessionId,
      binding,
      text: params.prompt,
    });
    await markDestJob(job.id, { status: "dispatched", heartbeat: true });
  }
  return outcome;
}
