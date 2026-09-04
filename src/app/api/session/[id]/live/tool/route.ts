import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { runTravisTool } from "@/server/travis-tools";
import { runMotionRunner } from "@/server/motion";
import { roomContextFor } from "@/server/room-read";
import { db } from "@/server/db/client";
import { voiceSession } from "@/server/db/schema";
import { AuthError } from "@/server/api-error";
import { requireOwnedSession } from "@/server/operator";

type Body = { name?: string; args?: Record<string, unknown> };

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
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const body = (await req.json()) as Body;
  const name = String(body.name ?? "");
  const result = await runTravisTool({
    sessionId,
    name,
    args: body.args ?? {},
  });

  await runMotionRunner(sessionId);
  const here = await roomContextFor(sessionId).catch(() => "");
  return NextResponse.json({ ok: result.ok, text: result.text, here });
}
