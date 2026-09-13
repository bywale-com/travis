import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { parseCallByName } from "@/lib/router";
import { isVocativeOnlyCall, isTravisSeat } from "@/lib/seats";
import { db } from "@/server/db/client";
import { voiceSession } from "@/server/db/schema";
import {
  absorbLiveTravisPost,
  insertUserTurn,
  lastSpeakableTravisText,
  sse,
  sseHeaders,
} from "@/server/seat-pipe";
import { collapseSpeechStutter } from "@/lib/absorb-text";
import { shouldDropHeardAsUser } from "@/lib/thread-truth";
import { destBindingsForSend } from "@/server/dest-resolve";
import { writeAndLeaveDest } from "@/server/dest-leave";
import { AuthError } from "@/server/api-error";
import { requireOwnedSession } from "@/server/operator";
import { runMotionRunner } from "@/server/motion";
import { roomContextFor } from "@/server/room-read";
import { serveInvite } from "@/server/serve";
import { liveShouldPipeTravis } from "@/lib/live-harness";
import { streamIntent } from "@/lib/stream-intent";
import { listOpenDestJobs } from "@/server/dest-job";
import { dispatchStreamIntents } from "@/server/stream-dispatch";

export const maxDuration = 60;

type Body = {
  role?: "user" | "travis";
  text?: string;
  handle?: string | null;
  referenceTurnId?: string | null;
};

function mightCursorDest(params: {
  decided:
    | { kind: "send"; seatKeys: string[]; prompt: string }
    | { kind: "switch"; seatKey: string }
    | { kind: "empty" };
  prompt: string;
  seatKey: string | null;
}): boolean {
  if (!params.prompt) return false;
  if (params.decided.kind === "send") {
    if (params.decided.seatKeys.some((k) => !isTravisSeat(k))) return true;
  }
  return Boolean(params.seatKey && !isTravisSeat(params.seatKey));
}

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
    const here = await roomContextFor(sessionId).catch(() => "");
    return NextResponse.json({ ok: true, turn, here });
  }

  const heard = collapseSpeechStutter(text);
  const hisLast = await lastSpeakableTravisText(sessionId).catch(() => "");
  if (shouldDropHeardAsUser({ heard, hisLast, heIsSpeaking: false })) {
    const here = await roomContextFor(sessionId).catch(() => "");
    return NextResponse.json({ ok: true, dropped: true, here });
  }
  const served = await serveInvite(sessionId, heard).catch(() => null);
  if (served) {
    const here = await roomContextFor(sessionId).catch(() => "");
    return NextResponse.json({
      ok: true,
      serveSpeak: served.speak,
      here,
    });
  }
  const referenceTurnId =
    typeof body.referenceTurnId === "string" && body.referenceTurnId.trim()
      ? body.referenceTurnId.trim()
      : null;
  const userTurn = await insertUserTurn(
    sessionId,
    heard,
    "travis",
    undefined,
    referenceTurnId,
  );
  const { seatKey, remainder } = parseCallByName(text);
  const calledPrompt =
    seatKey && isVocativeOnlyCall(text, remainder, seatKey)
      ? ""
      : seatKey
        ? remainder.trim()
        : heard;
  const decided = seatKey
    ? calledPrompt
      ? { kind: "send" as const, seatKeys: [seatKey], prompt: calledPrompt }
      : { kind: "switch" as const, seatKey }
    : { kind: "send" as const, seatKeys: [], prompt: heard };
  const prompt = decided.kind === "send" ? decided.prompt : "";
  const classifyPhrase = prompt || heard;

  if (mightCursorDest({ decided, prompt, seatKey })) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode(": ping\n\n"));
        const send = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(sse(event, data)));
        };
        try {
          const dests = await destBindingsForSend({
            sessionId,
            decided,
            referenceTurnId,
          });
          const cursorDests = dests.filter((b) => !isTravisSeat(b.seatKey));
          const sticky = dests[dests.length - 1];
          if (sticky) {
            await db
              .update(voiceSession)
              .set({
                activeBindingId: sticky.id,
                bindingId: sticky.id,
              })
              .where(eq(voiceSession.id, sessionId));
          }
          void liveShouldPipeTravis({
            prompt,
            cursorDestCount: cursorDests.length,
          });
          const left = await Promise.allSettled(
            cursorDests.map((binding) =>
              writeAndLeaveDest({ sessionId, binding, prompt }),
            ),
          );
          const destFail = left.find((row) => row.status === "rejected");
          if (destFail && destFail.status === "rejected") {
            throw destFail.reason;
          }
          const openJobs = await listOpenDestJobs(sessionId).catch(() => []);
          await dispatchStreamIntents({
            sessionId,
            phrase: classifyPhrase,
            intents: streamIntent({ phrase: classifyPhrase, openJobs }),
            skip: {
              seatKeys: cursorDests.map((b) => b.seatKey),
              bindingIds: cursorDests.map((b) => b.id),
            },
          });
          send("done", { ok: true, turn: userTurn });
        } catch (err) {
          send("error", {
            error: err instanceof Error ? err.message : String(err),
          });
        } finally {
          await runMotionRunner(sessionId).catch(() => {});
          controller.close();
        }
      },
    });
    return new Response(stream, { headers: sseHeaders() });
  }

  const dests = await destBindingsForSend({
    sessionId,
    decided,
    referenceTurnId,
  });
  const sticky = dests[dests.length - 1];
  if (sticky) {
    await db
      .update(voiceSession)
      .set({
        activeBindingId: sticky.id,
        bindingId: sticky.id,
      })
      .where(eq(voiceSession.id, sessionId));
  }
  if (dests.length && !prompt) {
    await runMotionRunner(sessionId);
    return NextResponse.json({
      ok: true,
      turn: userTurn,
      switched: sticky?.seatKey ?? seatKey,
      stopLive: true,
    });
  }

  const openJobs = await listOpenDestJobs(sessionId).catch(() => []);
  await dispatchStreamIntents({
    sessionId,
    phrase: classifyPhrase,
    intents: streamIntent({ phrase: classifyPhrase, openJobs }),
  }).catch(() => {});

  await runMotionRunner(sessionId);
  const here = await roomContextFor(sessionId).catch(() => "");
  return NextResponse.json({ ok: true, turn: userTurn, here });
}
