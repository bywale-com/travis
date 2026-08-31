import { and, desc, eq, ne, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { sortRoomSeats } from "@/lib/seats";
import { jsonRoute } from "@/server/api-error";
import { clientIpFromHeaders } from "@/server/client-ip";
import { db } from "@/server/db/client";
import { ensureSeatBindings } from "@/server/db/ensure-bindings";
import { agentBinding, voiceSession } from "@/server/db/schema";

async function getPmBinding() {
  const [pm] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.seatKey, "pm"))
    .limit(1);
  if (pm) return pm;

  const [fallback] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.active, true))
    .limit(1);
  return fallback;
}

function sessionPayload(
  session: typeof voiceSession.$inferSelect,
  active: typeof agentBinding.$inferSelect,
  defaultBinding: typeof agentBinding.$inferSelect,
  seats: Array<{ seatKey: string | null; label: string }>,
) {
  return {
    id: session.id,
    status: session.status,
    viewMode: session.viewMode,
    logSubmode: session.logSubmode === "type" ? "type" : "talk",
    routerState: session.routerState,
    activeBindingId: session.activeBindingId,
    defaultBindingId: session.defaultBindingId,
    activeSeatKey: active.seatKey,
    activeLabel: active.label,
    defaultLabel: defaultBinding.label,
    createdAt: session.createdAt,
    seats,
  };
}

async function roomSeats() {
  const rows = await db
    .select({
      seatKey: agentBinding.seatKey,
      label: agentBinding.label,
    })
    .from(agentBinding)
    .where(eq(agentBinding.active, true));
  return sortRoomSeats(rows);
}

async function ensureClientIpColumn() {
  await db.execute(
    sql`ALTER TABLE travis.voice_session ADD COLUMN IF NOT EXISTS client_ip text NOT NULL DEFAULT ''`,
  );
}

async function ensureTravisLiveColumn() {
  await db.execute(
    sql`ALTER TABLE travis.voice_session ADD COLUMN IF NOT EXISTS travis_live_handle text`,
  );
}

async function payloadFor(session: typeof voiceSession.$inferSelect) {
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
  return sessionPayload(
    session,
    active,
    defaultBinding ?? active,
    await roomSeats(),
  );
}

async function liveSessionForIp(ip: string) {
  if (ip) {
    const [row] = await db
      .select()
      .from(voiceSession)
      .where(and(eq(voiceSession.clientIp, ip), ne(voiceSession.status, "ended")))
      .orderBy(desc(voiceSession.createdAt))
      .limit(1);
    if (row) return row;
  }

  const empties = await db
    .select()
    .from(voiceSession)
    .where(and(eq(voiceSession.clientIp, ""), ne(voiceSession.status, "ended")))
    .orderBy(desc(voiceSession.createdAt))
    .limit(2);
  if (empties.length === 1 && ip) {
    const [stamped] = await db
      .update(voiceSession)
      .set({ clientIp: ip })
      .where(eq(voiceSession.id, empties[0].id))
      .returning();
    return stamped ?? empties[0];
  }
  return null;
}

/** Open or resume the live room for this IP. */
export async function POST(req: Request) {
  return jsonRoute(() => openOrResume(req));
}

async function openOrResume(req: Request) {
  await ensureSeatBindings();
  await ensureClientIpColumn();
  await ensureTravisLiveColumn();
  const ip = clientIpFromHeaders(req.headers);

  const existing = await liveSessionForIp(ip);
  if (existing) {
    const payload = await payloadFor(existing);
    if (payload) return NextResponse.json({ session: payload, resumed: true });
  }

  const binding = await getPmBinding();
  if (!binding) {
    return NextResponse.json(
      { error: "No agent_binding rows. Run db:seed." },
      { status: 500 },
    );
  }

  const [session] = await db
    .insert(voiceSession)
    .values({
      bindingId: binding.id,
      defaultBindingId: binding.id,
      activeBindingId: binding.id,
      viewMode: "voice",
      routerState: "normal",
      status: "listening",
      clientIp: ip,
    })
    .returning();

  return NextResponse.json({
    session: sessionPayload(session, binding, binding, await roomSeats()),
    resumed: false,
  });
}

export async function GET(req: Request) {
  return jsonRoute(() => readSession(req));
}

async function readSession(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const [row] = await db
      .select({
        session: voiceSession,
        active: agentBinding,
      })
      .from(voiceSession)
      .innerJoin(agentBinding, eq(voiceSession.activeBindingId, agentBinding.id))
      .where(eq(voiceSession.id, id))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const [defaultBinding] = await db
      .select()
      .from(agentBinding)
      .where(eq(agentBinding.id, row.session.defaultBindingId))
      .limit(1);

    return NextResponse.json({
      session: sessionPayload(
        row.session,
        row.active,
        defaultBinding ?? row.active,
        await roomSeats(),
      ),
    });
  }

  await ensureSeatBindings();
  await ensureClientIpColumn();
  await ensureTravisLiveColumn();
  const ip = clientIpFromHeaders(req.headers);
  const existing = await liveSessionForIp(ip);
  if (!existing) {
    return NextResponse.json({ session: null });
  }
  const payload = await payloadFor(existing);
  return NextResponse.json({ session: payload });
}
