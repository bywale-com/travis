import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { simplifySeatPost, travisIsWired } from "@/server/travis-gemini";
import { insertAgentPostTurn, insertStatusTurn } from "@/server/seat-pipe";
import { db } from "@/server/db/client";
import { voiceSession } from "@/server/db/schema";

type Body = {
  text?: string;
  referenceTurnId?: string | null;
};

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await ctx.params;
  const [session] = await db
    .select()
    .from(voiceSession)
    .where(eq(voiceSession.id, sessionId))
    .limit(1);
  if (!session || session.status === "ended") {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const body = (await req.json()) as Body;
  const source = String(body.text ?? "").trim();
  if (!source) {
    return NextResponse.json({ error: "Nothing to simplify" }, { status: 400 });
  }

  if (!travisIsWired()) {
    await insertStatusTurn(sessionId, "Travis isn’t wired");
    return NextResponse.json({ wired: false, text: "" });
  }

  const simplified = (await simplifySeatPost(source)).trim();
  if (!simplified) {
    return NextResponse.json({ wired: true, text: "" });
  }

  const turn = await insertAgentPostTurn(
    sessionId,
    simplified,
    "travis",
    body.referenceTurnId ?? null,
  );
  return NextResponse.json({ wired: true, text: simplified, turn });
}
