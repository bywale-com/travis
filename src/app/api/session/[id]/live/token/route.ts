import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { mintLiveToken, travisIsWired } from "@/server/travis-gemini";
import { TRAVIS_SYSTEM, TRAVIS_TOOL_DECLS } from "@/server/travis-tools";
import { db } from "@/server/db/client";
import { voiceSession } from "@/server/db/schema";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await ctx.params;
  const [session] = await db
    .select()
    .from(voiceSession)
    .where(eq(voiceSession.id, sessionId))
    .limit(1);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if (session.status === "ended") {
    return NextResponse.json({ error: "Session ended" }, { status: 400 });
  }

  if (!travisIsWired()) {
    return NextResponse.json({
      wired: false,
      tools: TRAVIS_TOOL_DECLS,
      systemInstruction: TRAVIS_SYSTEM,
    });
  }

  try {
    const minted = await mintLiveToken();
    if (!minted) {
      return NextResponse.json({ wired: false });
    }
    return NextResponse.json({
      wired: true,
      token: minted.token,
      model: minted.model,
      handle: session.travisLiveHandle ?? "",
      tools: TRAVIS_TOOL_DECLS,
      systemInstruction: TRAVIS_SYSTEM,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ wired: false, error: msg }, { status: 500 });
  }
}
