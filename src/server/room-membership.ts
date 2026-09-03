/**
 * SCP-007 — room membership writes and reads. Packet grain only.
 */
import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";
import {
  destAfterRemove,
  destOnCreate,
  membershipRoleFor,
} from "@/lib/room-membership";
import { clipRoomTitle } from "@/lib/room-title";
import { db } from "@/server/db/client";
import {
  agentBinding,
  roomMembership,
  voiceSession,
  type AgentBinding,
  type VoiceSession,
} from "@/server/db/schema";

export class MembershipError extends Error {
  constructor(
    message: string,
    public status: 400 | 404 | 409,
  ) {
    super(message);
    this.name = "MembershipError";
  }
}

export type OpenMember = {
  binding: AgentBinding;
  seatKey: string | null;
  label: string;
  role: string;
  joinedAt: Date;
};

let membershipStoreReady = false;

export async function ensureMembershipStore(): Promise<void> {
  if (membershipStoreReady) return;
  await db.execute(sql`
    ALTER TABLE travis.voice_session
      ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT ''
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS travis.room_membership (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id uuid NOT NULL REFERENCES travis.voice_session(id),
      binding_id uuid NOT NULL REFERENCES travis.agent_binding(id),
      role text NOT NULL DEFAULT 'member',
      joined_at timestamptz NOT NULL DEFAULT now(),
      left_at timestamptz,
      CONSTRAINT room_membership_role_chk
        CHECK (role IN ('member', 'facilitator')),
      CONSTRAINT room_membership_left_after_join_chk
        CHECK (left_at IS NULL OR left_at >= joined_at)
    )
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS room_membership_open_uniq
      ON travis.room_membership (session_id, binding_id)
      WHERE left_at IS NULL
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS room_membership_one_open_facilitator
      ON travis.room_membership (session_id)
      WHERE left_at IS NULL AND role = 'facilitator'
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS room_membership_open_by_session
      ON travis.room_membership (session_id)
      WHERE left_at IS NULL
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS room_membership_open_by_binding
      ON travis.room_membership (binding_id)
      WHERE left_at IS NULL
  `);
  // Legacy rooms only — a session that already has members keeps the
  // chosen cast. Do not refill the catalog on every GET.
  await db.execute(sql`
    INSERT INTO travis.room_membership (
      session_id,
      binding_id,
      role,
      joined_at,
      left_at
    )
    SELECT
      s.id,
      b.id,
      CASE
        WHEN b.seat_key = 'travis' THEN 'facilitator'
        ELSE 'member'
      END,
      s.created_at,
      s.ended_at
    FROM travis.voice_session s
    CROSS JOIN travis.agent_binding b
    WHERE b.active = true
      AND NOT EXISTS (
        SELECT 1
        FROM travis.room_membership m
        WHERE m.session_id = s.id
      )
  `);
  membershipStoreReady = true;
}

export async function openMembers(sessionId: string): Promise<OpenMember[]> {
  const rows = await db
    .select({
      binding: agentBinding,
      role: roomMembership.role,
      joinedAt: roomMembership.joinedAt,
    })
    .from(roomMembership)
    .innerJoin(agentBinding, eq(roomMembership.bindingId, agentBinding.id))
    .where(
      and(
        eq(roomMembership.sessionId, sessionId),
        isNull(roomMembership.leftAt),
      ),
    )
    .orderBy(asc(roomMembership.joinedAt), asc(agentBinding.seatKey));

  return rows.map((r) => ({
    binding: r.binding,
    seatKey: r.binding.seatKey,
    label: r.binding.label,
    role: r.role,
    joinedAt: r.joinedAt,
  }));
}

export async function roomSeats(
  sessionId: string,
): Promise<Array<{ id: string; seatKey: string | null; label: string }>> {
  const members = await openMembers(sessionId);
  return members.map((m) => ({
    id: m.binding.id,
    seatKey: m.seatKey,
    label: m.label,
  }));
}

export async function isOpenMember(
  sessionId: string,
  bindingId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: roomMembership.id })
    .from(roomMembership)
    .where(
      and(
        eq(roomMembership.sessionId, sessionId),
        eq(roomMembership.bindingId, bindingId),
        isNull(roomMembership.leftAt),
      ),
    )
    .limit(1);
  return Boolean(row);
}

export async function requireOpenMember(
  sessionId: string,
  bindingId: string,
): Promise<void> {
  if (await isOpenMember(sessionId, bindingId)) return;
  throw new MembershipError("Dest is not an open member of this room", 400);
}

export async function openBindingForSeat(
  sessionId: string,
  seatKey: string,
): Promise<AgentBinding | null> {
  const members = await openMembers(sessionId);
  return members.find((m) => m.seatKey === seatKey)?.binding ?? null;
}

export async function travisBinding(): Promise<AgentBinding | null> {
  const [row] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.seatKey, "travis"))
    .limit(1);
  return row ?? null;
}

async function activeBindings(): Promise<AgentBinding[]> {
  return db.select().from(agentBinding).where(eq(agentBinding.active, true));
}

export async function createStandInRoom(opts: {
  clientIp: string;
  operatorId: string;
  preferBinding: AgentBinding;
}): Promise<VoiceSession> {
  const catalog = await activeBindings();
  if (!catalog.length) {
    throw new MembershipError("No agent_binding rows. Run db:seed.", 400);
  }
  const destId =
    destOnCreate({
      chosen: catalog.map((b) => ({ id: b.id, seatKey: b.seatKey })),
      standInPmId: opts.preferBinding.id,
    }) ?? opts.preferBinding.id;
  const dest = catalog.find((b) => b.id === destId) ?? opts.preferBinding;

  return db.transaction(async (tx) => {
    const [session] = await tx
      .insert(voiceSession)
      .values({
        title: "",
        bindingId: dest.id,
        defaultBindingId: dest.id,
        activeBindingId: dest.id,
        viewMode: "voice",
        routerState: "normal",
        status: "listening",
        clientIp: opts.clientIp,
        operatorId: opts.operatorId,
      })
      .returning();
    await tx.insert(roomMembership).values(
      catalog.map((b) => ({
        sessionId: session.id,
        bindingId: b.id,
        role: membershipRoleFor(b.seatKey),
      })),
    );
    return session;
  });
}

export async function createExplicitRoom(opts: {
  title?: string;
  clientIp: string;
  operatorId: string;
  bindingIds: string[];
}): Promise<VoiceSession> {
  const travis = await travisBinding();
  if (!travis) {
    throw new MembershipError("Travis binding is missing", 400);
  }

  const chosen: AgentBinding[] = [];
  for (const id of opts.bindingIds) {
    const [row] = await db
      .select()
      .from(agentBinding)
      .where(eq(agentBinding.id, id))
      .limit(1);
    if (!row || !row.active) {
      throw new MembershipError("Unknown or inactive binding", 400);
    }
    chosen.push(row);
  }

  const members = [travis, ...chosen.filter((b) => b.id !== travis.id)];
  const destId =
    destOnCreate({
      chosen: members.map((b) => ({ id: b.id, seatKey: b.seatKey })),
    }) ?? travis.id;
  const dest = members.find((b) => b.id === destId) ?? travis;

  return db.transaction(async (tx) => {
    const [session] = await tx
      .insert(voiceSession)
      .values({
        title: clipRoomTitle(opts.title ?? ""),
        bindingId: dest.id,
        defaultBindingId: dest.id,
        activeBindingId: dest.id,
        viewMode: "voice",
        routerState: "normal",
        status: "listening",
        clientIp: opts.clientIp,
        operatorId: opts.operatorId,
      })
      .returning();
    await tx.insert(roomMembership).values(
      members.map((b) => ({
        sessionId: session.id,
        bindingId: b.id,
        role: membershipRoleFor(b.seatKey),
      })),
    );
    return session;
  });
}

export async function addMember(
  sessionId: string,
  bindingId: string,
): Promise<void> {
  const [session] = await db
    .select()
    .from(voiceSession)
    .where(eq(voiceSession.id, sessionId))
    .limit(1);
  if (!session) throw new MembershipError("Session not found", 404);
  if (session.status === "ended") {
    throw new MembershipError("Session ended", 400);
  }

  const [binding] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.id, bindingId))
    .limit(1);
  if (!binding || !binding.active) {
    throw new MembershipError("Unknown or inactive binding", 400);
  }

  if (await isOpenMember(sessionId, bindingId)) {
    throw new MembershipError("Already an open member of this room", 409);
  }

  const role =
    binding.seatKey === "travis"
      ? (await openMembers(sessionId)).some((m) => m.role === "facilitator")
        ? null
        : "facilitator"
      : "member";
  if (binding.seatKey === "travis" && role === null) {
    throw new MembershipError("Room already has an open facilitator", 409);
  }

  await db.insert(roomMembership).values({
    sessionId,
    bindingId,
    role: role ?? "member",
  });
}

export async function removeMember(
  sessionId: string,
  bindingId: string,
): Promise<void> {
  const [session] = await db
    .select()
    .from(voiceSession)
    .where(eq(voiceSession.id, sessionId))
    .limit(1);
  if (!session) throw new MembershipError("Session not found", 404);
  if (session.status === "ended") {
    throw new MembershipError("Session ended", 400);
  }

  const [open] = await db
    .select()
    .from(roomMembership)
    .where(
      and(
        eq(roomMembership.sessionId, sessionId),
        eq(roomMembership.bindingId, bindingId),
        isNull(roomMembership.leftAt),
      ),
    )
    .limit(1);
  if (!open) throw new MembershipError("No open membership", 404);
  if (open.role === "facilitator") {
    throw new MembershipError("Cannot remove the open facilitator", 409);
  }

  const now = new Date();
  await db
    .update(roomMembership)
    .set({ leftAt: now })
    .where(eq(roomMembership.id, open.id));

  const remaining = await openMembers(sessionId);
  const next = destAfterRemove({
    removedId: bindingId,
    current: {
      activeId: session.activeBindingId,
      defaultId: session.defaultBindingId,
      bindingId: session.bindingId,
    },
    remaining: remaining.map((m) => ({
      id: m.binding.id,
      seatKey: m.seatKey,
    })),
  });
  if (
    next.activeId !== session.activeBindingId ||
    next.defaultId !== session.defaultBindingId ||
    next.bindingId !== session.bindingId
  ) {
    await db
      .update(voiceSession)
      .set({
        activeBindingId: next.activeId,
        defaultBindingId: next.defaultId,
        bindingId: next.bindingId,
      })
      .where(eq(voiceSession.id, sessionId));
  }
}

export async function endRoom(sessionId: string): Promise<VoiceSession | null> {
  const now = new Date();
  const [session] = await db
    .update(voiceSession)
    .set({
      status: "ended",
      endedAt: now,
      travisLiveHandle: null,
    })
    .where(eq(voiceSession.id, sessionId))
    .returning();
  if (!session) return null;
  await db
    .update(roomMembership)
    .set({ leftAt: now })
    .where(
      and(eq(roomMembership.sessionId, sessionId), isNull(roomMembership.leftAt)),
    );
  return session;
}

export async function renameRoom(
  sessionId: string,
  rawTitle: string,
): Promise<VoiceSession | null> {
  const title = clipRoomTitle(rawTitle);
  const [updated] = await db
    .update(voiceSession)
    .set({ title })
    .where(eq(voiceSession.id, sessionId))
    .returning();
  return updated ?? null;
}

export async function listRoomsForIp(ip: string): Promise<
  Array<{
    id: string;
    title: string;
    status: string;
    createdAt: Date;
    endedAt: Date | null;
    members: Array<{ seatKey: string | null; label: string }>;
  }>
> {
  const sessions = await db
    .select()
    .from(voiceSession)
    .where(eq(voiceSession.clientIp, ip))
    .orderBy(sql`${voiceSession.createdAt} desc`);

  const out = [];
  for (const s of sessions) {
    const members = await openMembers(s.id);
    out.push({
      id: s.id,
      title: s.title,
      status: s.status,
      createdAt: s.createdAt,
      endedAt: s.endedAt,
      members: members.map((m) => ({ seatKey: m.seatKey, label: m.label })),
    });
  }
  return out;
}

export async function listRoomsForOperator(
  operatorId: string | string[],
): Promise<
  Array<{
    id: string;
    title: string;
    status: string;
    createdAt: Date;
    endedAt: Date | null;
    members: Array<{ seatKey: string | null; label: string }>;
  }>
> {
  const ids = Array.isArray(operatorId) ? operatorId : [operatorId];
  if (!ids.length) return [];
  const sessions = await db
    .select()
    .from(voiceSession)
    .where(inArray(voiceSession.operatorId, ids))
    .orderBy(sql`${voiceSession.createdAt} desc`);

  const out = [];
  for (const s of sessions) {
    const members = await openMembers(s.id);
    out.push({
      id: s.id,
      title: s.title,
      status: s.status,
      createdAt: s.createdAt,
      endedAt: s.endedAt,
      members: members.map((m) => ({ seatKey: m.seatKey, label: m.label })),
    });
  }
  return out;
}

export async function sessionJson(session: VoiceSession) {
  const [active] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.id, session.activeBindingId))
    .limit(1);
  const [defaultBinding] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.id, session.defaultBindingId))
    .limit(1);
  if (!active) return null;
  return {
    id: session.id,
    title: session.title,
    status: session.status,
    viewMode: session.viewMode,
    logSubmode: session.logSubmode === "type" ? "type" : "talk",
    routerState: session.routerState,
    activeBindingId: session.activeBindingId,
    defaultBindingId: session.defaultBindingId,
    activeSeatKey: active.seatKey,
    activeLabel: active.label,
    defaultLabel: (defaultBinding ?? active).label,
    createdAt: session.createdAt,
    seats: await roomSeats(session.id),
  };
}
