import { desc, eq, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
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
) {
  return {
    id: session.id,
    status: session.status,
    viewMode: session.viewMode,
    routerState: session.routerState,
    activeBindingId: session.activeBindingId,
    defaultBindingId: session.defaultBindingId,
    activeSeatKey: active.seatKey,
    activeLabel: active.label,
    defaultLabel: defaultBinding.label,
    createdAt: session.createdAt,
  };
}

/** Open room session: default + active = PM binding, view voice, router normal. */
export async function POST() {
  await ensureSeatBindings();
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
    })
    .returning();

  return NextResponse.json({
    session: sessionPayload(session, binding, binding),
  });
}

export async function GET(req: Request) {
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
      ),
    });
  }

  const rows = await db
    .select({
      id: voiceSession.id,
      status: voiceSession.status,
      viewMode: voiceSession.viewMode,
      createdAt: voiceSession.createdAt,
      activeLabel: agentBinding.label,
      activeSeatKey: agentBinding.seatKey,
    })
    .from(voiceSession)
    .innerJoin(agentBinding, eq(voiceSession.activeBindingId, agentBinding.id))
    .where(ne(voiceSession.status, "ended"))
    .orderBy(desc(voiceSession.createdAt))
    .limit(5);

  return NextResponse.json({ sessions: rows });
}
