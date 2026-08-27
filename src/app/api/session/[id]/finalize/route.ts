import { eq } from "drizzle-orm";
import { collapseSpeechStutter } from "@/lib/absorb-text";
import { matchConductorPhrase } from "@/lib/conductor";
import {
  parseCallByName,
  parseClarificationResponse,
  parseDeadManResponse,
  seatKeyToLabel,
} from "@/lib/router";
import { db } from "@/server/db/client";
import {
  agentBinding,
  turnConductorPhrase,
  voiceSession,
} from "@/server/db/schema";
import type { SeatKey } from "@/server/db/schema";
import {
  enqueueOnSeat,
  seatHasActiveRun,
  sendOrEnqueue,
  sse,
  sseHeaders,
} from "@/server/seat-pipe";

type Body = { utterance: string };

async function bindingForSeat(seatKey: SeatKey) {
  const [row] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.seatKey, seatKey))
    .limit(1);
  return row;
}

async function setActiveBinding(sessionId: string, bindingId: string) {
  await db
    .update(voiceSession)
    .set({ activeBindingId: bindingId, bindingId })
    .where(eq(voiceSession.id, sessionId));
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await ctx.params;
  const body = (await req.json()) as Body;
  const utterance = body.utterance ?? "";

  let [session] = await db
    .select()
    .from(voiceSession)
    .where(eq(voiceSession.id, sessionId))
    .limit(1);

  if (!session) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }
  if (session.status === "ended") {
    return Response.json({ error: "Session ended" }, { status: 400 });
  }

  const phrases = await db
    .select()
    .from(turnConductorPhrase)
    .where(eq(turnConductorPhrase.active, true));

  const match = matchConductorPhrase(
    utterance,
    phrases.map((p) => p.phrase),
  );

  // Dead-man: only short no / no X / yes. A real turn falls through and sends.
  if (session.routerState === "awaiting_dead_man") {
    const forRouter = match.matched ? match.cleanedText : utterance;
    const parsed = parseDeadManResponse(forRouter);
    if (parsed.action !== "ignore") {
      const targetKey =
        parsed.action === "seat" && parsed.seatKey
          ? parsed.seatKey
          : parsed.action === "stay"
            ? ((
                await db
                  .select()
                  .from(agentBinding)
                  .where(eq(agentBinding.id, session.activeBindingId))
                  .limit(1)
              )[0]?.seatKey as SeatKey | undefined) ?? "pm"
            : "pm";
      const binding = await bindingForSeat(targetKey);
      if (parsed.action !== "stay" && binding) {
        await setActiveBinding(sessionId, binding.id);
        [session] = await db
          .select()
          .from(voiceSession)
          .where(eq(voiceSession.id, sessionId))
          .limit(1);
      }
      await db
        .update(voiceSession)
        .set({ routerState: "normal" })
        .where(eq(voiceSession.id, sessionId));

      return Response.json({
        matched: false,
        routerHandled: true,
        activeSeatKey: targetKey,
        activeLabel: binding?.label ?? seatKeyToLabel(targetKey),
      });
    }
    await db
      .update(voiceSession)
      .set({ routerState: "normal" })
      .where(eq(voiceSession.id, sessionId));
    [session] = await db
      .select()
      .from(voiceSession)
      .where(eq(voiceSession.id, sessionId))
      .limit(1);
  }

  // Router: clarification
  if (session.routerState === "awaiting_clarification") {
    const seatKey = parseClarificationResponse(
      match.matched ? match.cleanedText : utterance,
    );
    if (!seatKey) {
      return Response.json({
        matched: false,
        routerHandled: false,
        needClarification: true,
      });
    }
    const binding = await bindingForSeat(seatKey);
    if (binding) await setActiveBinding(sessionId, binding.id);
    await db
      .update(voiceSession)
      .set({ routerState: "normal" })
      .where(eq(voiceSession.id, sessionId));

    return Response.json({
      matched: false,
      routerHandled: true,
      activeSeatKey: seatKey,
      activeLabel: binding?.label ?? seatKeyToLabel(seatKey),
    });
  }

  if (!match.matched) {
    return Response.json({
      matched: false,
      cleanedText: match.cleanedText,
    });
  }

  let prompt = collapseSpeechStutter(match.cleanedText.trim());
  const { seatKey: calledSeat, remainder } = parseCallByName(prompt);
  if (calledSeat) {
    const binding = await bindingForSeat(calledSeat);
    if (binding) {
      await setActiveBinding(sessionId, binding.id);
      [session] = await db
        .select()
        .from(voiceSession)
        .where(eq(voiceSession.id, sessionId))
        .limit(1);
    }
    prompt = collapseSpeechStutter(remainder.trim());
  }

  if (!prompt) {
    if (calledSeat) {
      const binding = await bindingForSeat(calledSeat);
      return Response.json({
        matched: false,
        routerHandled: true,
        activeSeatKey: calledSeat,
        activeLabel: binding?.label ?? seatKeyToLabel(calledSeat),
      });
    }
    return Response.json(
      {
        matched: true,
        error: "Conductor matched but no prompt text left after routing strip.",
      },
      { status: 400 },
    );
  }

  const [binding] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.id, session!.activeBindingId))
    .limit(1);

  if (!binding) {
    return Response.json({ error: "No active binding" }, { status: 400 });
  }

  const seatKey = (binding.seatKey ?? "pm") as SeatKey;
  const seatLabel = binding.label ?? seatKeyToLabel(seatKey);

  if (await seatHasActiveRun(binding)) {
    const queue = await enqueueOnSeat({
      sessionId,
      binding,
      text: prompt,
    });
    return Response.json({
      matched: true,
      queued: true,
      queue,
      matchedPhrase: match.matchedPhrase,
      activeSeatKey: seatKey,
      activeLabel: seatLabel,
    });
  }

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
          matchedPhrase: match.matchedPhrase,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        send("error", { error: msg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: sseHeaders() });
}
