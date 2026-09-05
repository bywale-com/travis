/**
 * SCP-015 — sit a person on a house protocol. Role dest reuses idle or spins.
 * Role dest never enqueues.
 */
import { eq } from "drizzle-orm";
import {
  formatSeatRosterLine,
  isSitProtocolRole,
  parseSitProtocol,
  SIT_ROLE_LABEL,
  type SitProtocolRole,
} from "@/lib/protocol-path";
import { dispatchToSeat, type DispatchOutcome } from "@/server/dispatch";
import { isTravisSeat } from "@/lib/seats";
import { createAgentBinding } from "@/server/create-agent";
import { db } from "@/server/db/client";
import { agentBinding, type AgentBinding } from "@/server/db/schema";
import { OsHouseError, readOs } from "@/server/os-house";
import { getLiveRun } from "@/server/queue";
import {
  addMember,
  MembershipError,
  openMembers,
  requireOpenMember,
} from "@/server/room-membership";
import { sendOrEnqueue, seatHasActiveRun } from "@/server/seat-pipe";
import { ensureSitStore } from "@/server/sit-store";

export class SitError extends Error {
  constructor(
    message: string,
    public status: 400 | 404 | 409,
  ) {
    super(message);
    this.name = "SitError";
  }
}

export { ensureSitStore } from "@/server/sit-store";

export async function bindingBySeatKey(
  seatKey: string,
): Promise<AgentBinding | null> {
  await ensureSitStore();
  const [row] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.seatKey, seatKey))
    .limit(1);
  return row ?? null;
}

export async function openMemberByWho(
  sessionId: string,
  who: string,
): Promise<AgentBinding | null> {
  const slug = who.trim();
  if (!slug) return null;
  const members = await openMembers(sessionId);
  return members.find((m) => m.seatKey === slug)?.binding ?? null;
}

export async function findIdleSeated(
  sessionId: string,
  protocolPath: string,
): Promise<AgentBinding | null> {
  await ensureSitStore();
  const members = await openMembers(sessionId);
  for (const member of members) {
    if (isTravisSeat(member.seatKey)) continue;
    if (member.binding.protocolPath !== protocolPath) continue;
    const live = await getLiveRun(member.binding.id);
    if (live) continue;
    return member.binding;
  }
  return null;
}

function harnessText(parts: Array<{ path: string; body: string }>): string {
  return parts
    .map((p) => `${p.path}\n\n${p.body.trim()}`)
    .join("\n\n")
    .trim();
}

async function readSitFiles(protocolPath: string) {
  try {
    const [where, logging, protocol] = await Promise.all([
      readOs("/protocols/WHERE.md"),
      readOs("/protocols/logging.md"),
      readOs(protocolPath),
    ]);
    return [where, logging, protocol];
  } catch (err) {
    if (err instanceof OsHouseError) {
      throw new SitError(err.message, err.status);
    }
    throw err;
  }
}

async function handProtocol(
  sessionId: string,
  binding: AgentBinding,
  protocolPath: string,
): Promise<void> {
  const files = await readSitFiles(protocolPath);
  const prompt = harnessText(files);
  await sendOrEnqueue({
    sessionId,
    binding,
    prompt,
    send: () => {},
  });
}

export async function sitBinding(params: {
  sessionId: string;
  binding: AgentBinding;
  protocol: unknown;
}): Promise<{ binding: AgentBinding; protocolPath: string; role: SitProtocolRole }> {
  await ensureSitStore();
  const parsed = parseSitProtocol(params.protocol);
  if (!parsed.ok) throw new SitError(parsed.reason, 400);
  if (isTravisSeat(params.binding.seatKey)) {
    throw new SitError("Travis is the facilitator, not a Cursor seat.", 400);
  }
  await requireOpenMember(params.sessionId, params.binding.id);

  await db
    .update(agentBinding)
    .set({ protocolPath: parsed.path })
    .where(eq(agentBinding.id, params.binding.id));

  const [updated] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.id, params.binding.id))
    .limit(1);
  const seated = updated ?? { ...params.binding, protocolPath: parsed.path };

  await handProtocol(params.sessionId, seated, parsed.path);
  return { binding: seated, protocolPath: parsed.path, role: parsed.role };
}

export async function sitAgent(params: {
  sessionId: string;
  who: string;
  protocol: unknown;
}): Promise<{ binding: AgentBinding; protocolPath: string; role: SitProtocolRole }> {
  const who = String(params.who ?? "").trim();
  if (!who) throw new SitError("Need who — a person in this room.", 400);
  const binding = await openMemberByWho(params.sessionId, who);
  if (!binding) {
    throw new SitError(`${who} is not an open member of this room.`, 400);
  }
  return sitBinding({
    sessionId: params.sessionId,
    binding,
    protocol: params.protocol,
  });
}

async function spinSeatedRole(params: {
  sessionId: string;
  role: SitProtocolRole;
}): Promise<AgentBinding> {
  const agent = await createAgentBinding({
    label: SIT_ROLE_LABEL[params.role],
  });
  try {
    await addMember(params.sessionId, agent.id);
  } catch (err) {
    if (err instanceof MembershipError) throw new SitError(err.message, err.status);
    throw err;
  }
  const binding = await bindingBySeatKey(agent.seatKey);
  if (!binding) throw new SitError("Spin created a person we cannot sit.", 400);
  const sat = await sitBinding({
    sessionId: params.sessionId,
    binding,
    protocol: params.role,
  });
  return sat.binding;
}

/**
 * Role dest: oldest idle seated of that path, else spin + sit.
 * Never returns a binding that already has a live-run row.
 */
export async function resolveRoleDest(params: {
  sessionId: string;
  role: SitProtocolRole;
}): Promise<AgentBinding> {
  await ensureSitStore();
  const parsed = parseSitProtocol(params.role);
  if (!parsed.ok) throw new SitError(parsed.reason, 400);
  const idle = await findIdleSeated(params.sessionId, parsed.path);
  if (idle) return idle;
  return spinSeatedRole({ sessionId: params.sessionId, role: parsed.role });
}


export async function listSeatRoster(sessionId: string): Promise<string> {
  await ensureSitStore();
  const members = await openMembers(sessionId);
  if (!members.length) return "No seats.";
  const lines = [];
  for (const member of members) {
    const live = member.seatKey
      ? await getLiveRun(member.binding.id)
      : null;
    lines.push(
      formatSeatRosterLine({
        label: member.label,
        seatKey: member.seatKey ?? "",
        protocolPath: member.binding.protocolPath ?? "",
        busy: Boolean(live),
      }),
    );
  }
  return lines.join("\n");
}

export function roleFromSeatArg(seat: string): SitProtocolRole | null {
  return isSitProtocolRole(seat) ? seat : null;
}

export { destKind } from "@/lib/protocol-path";

export async function isBindingBusy(binding: AgentBinding): Promise<boolean> {
  if (await getLiveRun(binding.id)) return true;
  return seatHasActiveRun(binding);
}

export async function dispatchToRoleDest(params: {
  sessionId: string;
  role: SitProtocolRole;
  text: string;
  initiativeId?: string | null;
}): Promise<{
  binding: AgentBinding;
  outcome: DispatchOutcome;
}> {
  let dest = await resolveRoleDest({
    sessionId: params.sessionId,
    role: params.role,
  });
  let outcome = await dispatchToSeat({
    sessionId: params.sessionId,
    binding: dest,
    prompt: params.text,
    initiativeId: params.initiativeId,
    enqueueIfBusy: false,
  });
  if (outcome.status === "busy" || outcome.status === "queued") {
    dest = await spinSeatedRole({
      sessionId: params.sessionId,
      role: params.role,
    });
    outcome = await dispatchToSeat({
      sessionId: params.sessionId,
      binding: dest,
      prompt: params.text,
      initiativeId: params.initiativeId,
      enqueueIfBusy: false,
    });
  }
  return { binding: dest, outcome };
}
