import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { jsonRoute } from "@/server/api-error";
import { db } from "@/server/db/client";
import { agentBinding, voiceSession } from "@/server/db/schema";
import { endRoom, renameRoom, sessionJson } from "@/server/room-membership";
import { requireOwnedSession } from "@/server/operator";

type PatchBody = {
  status?: "listening" | "paused" | "ending" | "ended" | "speaking";
  viewMode?: "voice" | "log";
  logSubmode?: "talk" | "type";
  title?: string;
};

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  return jsonRoute(async () => {
    const { id } = await ctx.params;
  const body = (await req.json()) as PatchBody;

    await requireOwnedSession(req, id);

  if (
    !body.status &&
    !body.viewMode &&
    !body.logSubmode &&
    typeof body.title !== "string"
  ) {
    return NextResponse.json(
      { error: "status, viewMode, logSubmode, or title required" },
      { status: 400 },
    );
  }

  if (typeof body.title === "string") {
    const renamed = await renameRoom(id, body.title);
    if (!renamed) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (!body.status && !body.viewMode && !body.logSubmode) {
      const payload = await sessionJson(renamed);
      return NextResponse.json({ session: payload ?? renamed });
    }
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
  });
}
