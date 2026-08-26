import { desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { agentBinding, voiceSession } from "@/server/db/schema";

/** Open a voice session: bind active PM row, status listening. */
export async function POST() {
  const [binding] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.active, true))
    .orderBy(desc(agentBinding.createdAt))
    .limit(1);

  if (!binding) {
    return NextResponse.json(
      { error: "No active agent_binding. Run db:seed." },
      { status: 500 },
    );
  }

  const [session] = await db
    .insert(voiceSession)
    .values({
      bindingId: binding.id,
      status: "listening",
    })
    .returning();

  return NextResponse.json({
    session: {
      id: session.id,
      status: session.status,
      bindingLabel: binding.label,
      createdAt: session.createdAt,
    },
  });
}

/** List recent open/listening sessions or fetch by id via query. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const [row] = await db
      .select({
        id: voiceSession.id,
        status: voiceSession.status,
        bindingId: voiceSession.bindingId,
        createdAt: voiceSession.createdAt,
        endedAt: voiceSession.endedAt,
        bindingLabel: agentBinding.label,
      })
      .from(voiceSession)
      .innerJoin(agentBinding, eq(voiceSession.bindingId, agentBinding.id))
      .where(eq(voiceSession.id, id))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    return NextResponse.json({ session: row });
  }

  const rows = await db
    .select({
      id: voiceSession.id,
      status: voiceSession.status,
      createdAt: voiceSession.createdAt,
      bindingLabel: agentBinding.label,
    })
    .from(voiceSession)
    .innerJoin(agentBinding, eq(voiceSession.bindingId, agentBinding.id))
    .where(sql`${voiceSession.status} <> 'ended'`)
    .orderBy(desc(voiceSession.createdAt))
    .limit(5);

  return NextResponse.json({ sessions: rows });
}
