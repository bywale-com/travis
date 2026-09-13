/**
 * Hotfix 091 — write-and-leave with a queue-visible dest_job.
 * Role dests spin on busy via dispatchToRoleDest; person dests use dispatchToSeat.
 * File dest_job first — before role resolve / Cursor create. Cursor send may hang
 * or miss; the leave must already show on /queue.
 */

import { isCatalogPm, isLivingCursorId } from "@/lib/dest-glass";
import { isSitProtocolRole, type SitProtocolRole } from "@/lib/protocol-path";
import { isTravisSeat } from "@/lib/seats";
import { delay } from "@/lib/cursor-busy";
import { dispatchToSeat, type DispatchOutcome } from "@/server/dispatch";
import { insertDestJob, markDestJob } from "@/server/dest-job";
import { bindingBySeatKey, dispatchToRoleDest } from "@/server/sit";
import {
  addMember,
  isOpenMember,
  MembershipError,
  openBindingForSeat,
} from "@/server/room-membership";
import type { AgentBinding } from "@/server/db/schema";

/** Wait this long for Cursor run_started. After that the leave is already filed. */
export const LEAVE_HANDOFF_MS = 8_000;

export function isFounderOpsDestError(message: string): boolean {
  return /hard limit|upgrade to ultra|reached the limit for your current plan/i.test(
    message,
  );
}

async function ensureOpenDestMember(
  sessionId: string,
  binding: AgentBinding,
): Promise<void> {
  if (await isOpenMember(sessionId, binding.id)) return;
  try {
    await addMember(sessionId, binding.id);
  } catch (err) {
    if (err instanceof MembershipError && err.status === 409) return;
    throw err;
  }
}

/** Catalog / room bind for a dest key. Never catalog pm. No Cursor create. */
export async function destBindingForSeatKey(
  sessionId: string,
  seatKey: string,
): Promise<AgentBinding | null> {
  if (!seatKey || isTravisSeat(seatKey)) return null;
  const inRoom = await openBindingForSeat(sessionId, seatKey);
  if (inRoom && !isCatalogPm(inRoom.seatKey)) return inRoom;
  const catalog = await bindingBySeatKey(seatKey);
  if (
    catalog &&
    isLivingCursorId(catalog.cursorAgentId) &&
    !isCatalogPm(catalog.seatKey)
  ) {
    return catalog;
  }
  return null;
}

/** File dest_job on known binds before role resolve can spin Cursor create. */
export async function fileDestJobsForSeatKeys(params: {
  sessionId: string;
  seatKeys: string[];
  prompt: string;
}): Promise<AgentBinding[]> {
  const filed: AgentBinding[] = [];
  for (const key of params.seatKeys) {
    const binding = await destBindingForSeatKey(params.sessionId, key);
    if (!binding) continue;
    await ensureOpenDestMember(params.sessionId, binding);
    await insertDestJob({
      sessionId: params.sessionId,
      binding,
      text: params.prompt,
      status: "dispatched",
    });
    if (!filed.some((row) => row.id === binding.id)) filed.push(binding);
  }
  return filed;
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
  await ensureOpenDestMember(params.sessionId, params.binding);
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

  // Leave stays dispatched. Cursor miss / busy / hard limit is not an empty queue.
  if (raced.outcome.status === "error") {
    if (isFounderOpsDestError(raced.outcome.error)) {
      return {
        status: "started",
        runId: job.id,
        seatLabel: params.binding.label ?? "that seat",
      };
    }
    return raced.outcome;
  }

  if (raced.outcome.status === "busy") {
    return raced.outcome;
  }

  return raced.outcome;
}
