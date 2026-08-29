import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { parseCallByName } from "@/lib/router";
import { isCursorSeat, isVocativeOnlyCall } from "@/lib/seats";
import { db } from "@/server/db/client";
import { agentBinding, voiceSession } from "@/server/db/schema";
import {
  insertAgentPostTurn,
  insertUserTurn,
  sendOrEnqueue,
  sse,
  sseHeaders,
} from "@/server/seat-pipe";

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
    const turn = await insertAgentPostTurn(sessionId, text, "travis");
    return NextResponse.json({ ok: true, turn });
  }

  const userTurn = await insertUserTurn(sessionId, text, "travis");
  const { seatKey, remainder } = parseCallByName(text);
  if (seatKey && isCursorSeat(seatKey)) {
    const [binding] = await db
      .select()
      .from(agentBinding)
      .where(eq(agentBinding.seatKey, seatKey))
      .limit(1);
    if (binding) {
      await db
        .update(voiceSession)
        .set({
          activeBindingId: binding.id,
          bindingId: binding.id,
        })
        .where(eq(voiceSession.id, sessionId));
    }
    const prompt = isVocativeOnlyCall(text, remainder, seatKey)
      ? ""
      : remainder.trim();
    if (prompt && binding) {
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
    return NextResponse.json({
      ok: true,
      turn: userTurn,
      switched: seatKey,
      stopLive: true,
    });
  }

  return NextResponse.json({ ok: true, turn: userTurn });
}
