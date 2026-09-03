import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { voiceSession, voiceTurn } from "@/server/db/schema";
import { AuthError } from "@/server/api-error";
import { requireOwnedSession } from "@/server/operator";

/** Faceless dead-man trigger — inserts travis_prompt, awaits user response. */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await ctx.params;
  try {
    await requireOwnedSession(req, sessionId);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  const [session] = await db
    .select()
    .from(voiceSession)
    .where(eq(voiceSession.id, sessionId))
    .limit(1);

  if (!session || session.status === "ended") {
    return NextResponse.json({ error: "Session not available" }, { status: 400 });
  }
  if (session.viewMode === "log" || session.status !== "listening") {
    return NextResponse.json({ ok: true, skipped: true });
  }
  if (session.routerState !== "normal") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const [last] = await db
    .select({ seq: voiceTurn.seq })
    .from(voiceTurn)
    .where(eq(voiceTurn.sessionId, sessionId))
    .orderBy(desc(voiceTurn.seq))
    .limit(1);
  const seq = (last?.seq ?? 0) + 1;

  const promptText = "Are you talking with me?";

  const [turn] = await db
    .insert(voiceTurn)
    .values({
      sessionId,
      seq,
      role: "status",
      kind: "travis_prompt",
      speakable: true,
      text: promptText,
    })
    .returning();

  await db
    .update(voiceSession)
    .set({ routerState: "awaiting_dead_man" })
    .where(eq(voiceSession.id, sessionId));

  return NextResponse.json({ turn, routerState: "awaiting_dead_man" });
}
