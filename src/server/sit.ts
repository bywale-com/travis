/**
 * SCP-015 — sit a person on a house protocol. Role dest reuses idle or spins.
 * Role dest never enqueues.
 */
import { eq } from "drizzle-orm";
import { isCatalogPm, isLivingCursorId, roleDestPick } from "@/lib/dest-glass";
import {
  formatSeatRosterLine,
  isSitProtocolRole,
  parseSitProtocol,
  SIT_PROTOCOL_BY_ROLE,
  SIT_ROLE_LABEL,
  type SitProtocolRole,
} from "@/lib/protocol-path";
import { dispatchToSeat, type DispatchOutcome } from "@/server/dispatch";
import { isTravisSeat } from "@/lib/seats";
import { createAgentBinding } from "@/server/create-agent";
import { db } from "@/server/db/client";
import { agentBinding, type AgentBinding } from "@/server/db/schema";
import { livingSeated } from "@/server/living-seated";
import { OsHouseError, readOs } from "@/server/os-house";
import { getLiveRun } from "@/server/queue";
import {
  addMember,
  isOpenMember,
  MembershipError,
  openMembers,
  requireOpenMember,
} from "@/server/room-membership";
import { seatHasActiveRun } from "@/server/seat-pipe";
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
  const living = await livingSeated(protocolPath);
  const members = await openMembers(sessionId);
  const seated = members.filter((member) => {
    if (isTravisSeat(member.seatKey)) return false;
    if (member.binding.protocolPath !== protocolPath) return false;
    if (isCatalogPm(member.seatKey)) return false;
    if (!isLivingCursorId(member.binding.cursorAgentId)) return false;
    return true;
  });
  let prefer: AgentBinding | null = null;
  if (living && seated.some((m) => m.binding.id === living.id)) {
    prefer = living;
  } else if (!living) {
    prefer =
      seated
        .map((m) => m.binding)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ??
      null;
  }
  if (!prefer) return null;
  const live = await getLiveRun(prefer.id);
  if (live) return null;
  return prefer;
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
  await dispatchToSeat({
    sessionId,
    binding,
    prompt,
    enqueueIfBusy: false,
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
  void sitBinding({
    sessionId: params.sessionId,
    binding,
    protocol: params.role,
  }).catch(() => {});
  return binding;
}

/**
 * Role dest: idle living in this room, else add the global living bind,
 * else spin. Never dest a prior bind when a newer living one exists.
 */
export async function resolveRoleDest(params: {
  sessionId: string;
  role: SitProtocolRole;
}): Promise<AgentBinding> {
  await ensureSitStore();
  const parsed = parseSitProtocol(params.role);
  if (!parsed.ok) throw new SitError(parsed.reason, 400);
  const living = await livingSeated(parsed.path);
  const idle = await findIdleSeated(params.sessionId, parsed.path);
  const pick = roleDestPick({
    idleInRoomId: idle?.id ?? null,
    livingId: living?.id ?? null,
  });
  if (pick === "idle" && idle) return idle;
  if (pick === "living" && living) {
    if (!(await isOpenMember(params.sessionId, living.id))) {
      try {
        await addMember(params.sessionId, living.id);
      } catch (err) {
        if (err instanceof MembershipError) {
          throw new SitError(err.message, err.status);
        }
        throw err;
      }
    }
    if (!(living.protocolPath ?? "").trim()) {
      void sitBinding({
        sessionId: params.sessionId,
        binding: living,
        protocol: parsed.role,
      }).catch(() => {});
    }
    return living;
  }
  const catalog = await bindingBySeatKey(params.role);
  if (
    catalog &&
    isLivingCursorId(catalog.cursorAgentId) &&
    !isCatalogPm(catalog.seatKey)
  ) {
    if (!(await isOpenMember(params.sessionId, catalog.id))) {
      try {
        await addMember(params.sessionId, catalog.id);
      } catch (err) {
        if (err instanceof MembershipError) {
          throw new SitError(err.message, err.status);
        }
        throw err;
      }
    }
    if (!(catalog.protocolPath ?? "").trim()) {
      void sitBinding({
        sessionId: params.sessionId,
        binding: catalog,
        protocol: parsed.role,
      }).catch(() => {});
    }
    return catalog;
  }
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
  const living = await livingSeated(SIT_PROTOCOL_BY_ROLE[params.role]);
  if (
    (outcome.status === "busy" || outcome.status === "queued") &&
    !living
  ) {
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
