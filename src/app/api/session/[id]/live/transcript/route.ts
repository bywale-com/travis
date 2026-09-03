import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { parseCallByName } from "@/lib/router";
import { isCursorSeat, isVocativeOnlyCall } from "@/lib/seats";
import { db } from "@/server/db/client";
import { voiceSession } from "@/server/db/schema";
import {
  absorbLiveTravisPost,
  insertUserTurn,
  sendOrEnqueue,
  sse,
  sseHeaders,
} from "@/server/seat-pipe";
import { collapseSpeechStutter } from "@/lib/absorb-text";
import { openBindingForSeat } from "@/server/room-membership";
import { AuthError } from "@/server/api-error";
import { requireOwnedSession } from "@/server/operator";
import { runMotionRunner } from "@/server/motion";

type Body = {
  role?: "user" | "travis";
  text?: string;
  handle?: string | null;
};

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
  const body = (await req.json()) as Body;
  const text = String(body.text ?? "").trim();
  const [session] = await db
    .select()
    .from(voiceSession)
    .where(eq(voiceSession.id, sessionId))
    .limit(1);
  if (!session || session.status === "ended") {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (typeof body.handle === "string") {
    await db
      .update(voiceSession)
      .set({ travisLiveHandle: body.handle || null })
      .where(eq(voiceSession.id, sessionId));
  }

  if (!text) {
    return NextResponse.json({ ok: true });
  }

  if (body.role === "travis") {
    const turn = await absorbLiveTravisPost(sessionId, text);
    await runMotionRunner(sessionId);
    return NextResponse.json({ ok: true, turn });
  }

  const userTurn = await insertUserTurn(
    sessionId,
    collapseSpeechStutter(text),
    "travis",
  );
  const { seatKey, remainder } = parseCallByName(text);
  if (seatKey && isCursorSeat(seatKey)) {
    const binding = await openBindingForSeat(sessionId, seatKey);
    if (!binding) {
      return NextResponse.json(
        { error: "Dest is not an open member of this room" },
        { status: 400 },
      );
    }
    await db
      .update(voiceSession)
      .set({
        activeBindingId: binding.id,
        bindingId: binding.id,
      })
      .where(eq(voiceSession.id, sessionId));
    const prompt = isVocativeOnlyCall(text, remainder, seatKey)
      ? ""
      : remainder.trim();
    if (prompt && binding) {
      await runMotionRunner(sessionId);
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const send = (event: string, data: unknown) => {
            controller.enqueue(encoder.encode(sse(event, data)));
          };
          try {
            await sendOrEnqueue({
              sessionId,
              binding,
              prompt,
              send,
              userTurn,
            });
          } catch (err) {
            send("error", {
              error: err instanceof Error ? err.message : String(err),
            });
          } finally {
            controller.close();
          }
        },
      });
      return new Response(stream, { headers: sseHeaders() });
    }
    await runMotionRunner(sessionId);
    return NextResponse.json({
      ok: true,
      turn: userTurn,
      switched: seatKey,
      stopLive: true,
    });
  }

  await runMotionRunner(sessionId);
  return NextResponse.json({ ok: true, turn: userTurn });
}
