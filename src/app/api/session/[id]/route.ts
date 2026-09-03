import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { agentBinding, voiceSession } from "@/server/db/schema";
import { endRoom, sessionJson } from "@/server/room-membership";

type PatchBody = {
  status?: "listening" | "paused" | "ending" | "ended" | "speaking";
  viewMode?: "voice" | "log";
  logSubmode?: "talk" | "type";
};

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = (await req.json()) as PatchBody;

  if (!body.status && !body.viewMode && !body.logSubmode) {
    return NextResponse.json(
      { error: "status, viewMode, or logSubmode required" },
      { status: 400 },
    );
  }

  if (body.status === "ended") {
    const session = await endRoom(id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    const payload = await sessionJson(session);
    return NextResponse.json({ session: payload ?? session });
  }

  const logSubmode =
    body.logSubmode === "type" || body.logSubmode === "talk"
      ? body.logSubmode
      : undefined;

  const [session] = await db
    .update(voiceSession)
    .set({
      ...(body.status ? { status: body.status } : {}),
      ...(body.viewMode ? { viewMode: body.viewMode } : {}),
      ...(logSubmode ? { logSubmode } : {}),
    })
    .where(eq(voiceSession.id, id))
    .returning();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const [active] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.id, session.activeBindingId))
    .limit(1);

  return NextResponse.json({
    session: {
      ...session,
      activeLabel: active?.label,
      activeSeatKey: active?.seatKey,
      logSubmode: session.logSubmode === "type" ? "type" : "talk",
    },
  });
}
