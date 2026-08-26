import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { voiceSession } from "@/server/db/schema";

type PatchBody = {
  status: "listening" | "paused" | "ending" | "ended" | "speaking";
};

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = (await req.json()) as PatchBody;

  if (!body.status) {
    return NextResponse.json({ error: "status required" }, { status: 400 });
  }

  const endedAt = body.status === "ended" ? new Date() : null;

  const [session] = await db
    .update(voiceSession)
    .set({
      status: body.status,
      ...(endedAt ? { endedAt } : {}),
    })
    .where(eq(voiceSession.id, id))
    .returning();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ session });
}
