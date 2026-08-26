import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { matchConductorPhrase } from "@/lib/conductor";
import { sendToCursor } from "@/server/cursor-port";
import { db } from "@/server/db/client";
import {
  agentBinding,
  turnConductorPhrase,
  voiceSession,
  voiceTurn,
} from "@/server/db/schema";

type Body = {
  utterance: string;
};

/**
 * Finalize utterance when conductor phrase matches (or client already detected).
 * Writes user turn, invokes Cursor send port, writes assistant/status turns.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await ctx.params;
  const body = (await req.json()) as Body;
  const utterance = body.utterance ?? "";

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

  const phrases = await db
    .select()
    .from(turnConductorPhrase)
    .where(eq(turnConductorPhrase.active, true));

  const match = matchConductorPhrase(
    utterance,
    phrases.map((p) => p.phrase),
  );

  if (!match.matched) {
    return NextResponse.json({
      matched: false,
      cleanedText: match.cleanedText,
    });
  }

  const prompt = match.cleanedText.trim();
  if (!prompt) {
    return NextResponse.json(
      {
        matched: true,
        error: "Conductor matched but no prompt text left after stripping phrase.",
      },
      { status: 400 },
    );
  }

  const [last] = await db
    .select({ seq: voiceTurn.seq })
    .from(voiceTurn)
    .where(eq(voiceTurn.sessionId, sessionId))
    .orderBy(desc(voiceTurn.seq))
    .limit(1);
  let seq = (last?.seq ?? 0) + 1;

  const [userTurn] = await db
    .insert(voiceTurn)
    .values({
      sessionId,
      seq,
      role: "user",
      text: prompt,
    })
    .returning();
  seq += 1;

  const [binding] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.id, session.bindingId))
    .limit(1);

  const sendResult = await sendToCursor({
    cursorAgentId: binding?.cursorAgentId ?? "",
    prompt,
  });

  const [assistantTurn] = await db
    .insert(voiceTurn)
    .values({
      sessionId,
      seq,
      role: "assistant",
      text: sendResult.assistantText,
    })
    .returning();
  seq += 1;

  let statusTurn = null;
  if (sendResult.statusText) {
    [statusTurn] = await db
      .insert(voiceTurn)
      .values({
        sessionId,
        seq,
        role: "status",
        text: sendResult.statusText,
      })
      .returning();
  }

  return NextResponse.json({
    matched: true,
    matchedPhrase: match.matchedPhrase,
    mode: sendResult.mode,
    turns: [userTurn, assistantTurn, statusTurn].filter(Boolean),
  });
}
