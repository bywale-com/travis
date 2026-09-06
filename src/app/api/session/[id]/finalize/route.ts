import { eq } from "drizzle-orm";
import { collapseSpeechStutter } from "@/lib/absorb-text";
import { matchConductorPhrase } from "@/lib/conductor";
import {
  parseCallByName,
  parseClarificationResponse,
  parseDeadManResponse,
  seatKeyToLabel,
} from "@/lib/router";
import { isTravisSeat, isVocativeOnlyCall } from "@/lib/seats";
import { db } from "@/server/db/client";
import {
  agentBinding,
  turnConductorPhrase,
  voiceSession,
} from "@/server/db/schema";
import type { SeatKey } from "@/server/db/schema";
import { noteTravisUnwired } from "@/server/travis-dest";
import { MembershipError, requireOpenMember } from "@/server/room-membership";
import { destBindingsForSend, resolveDestBinding } from "@/server/dest-resolve";
import { pipeTravisText } from "@/server/travis-reply";
import { AuthError } from "@/server/api-error";
import { requireOwnedSession } from "@/server/operator";
import {
  enqueueOnSeat,
  seatHasActiveRun,
  sendOrEnqueueMany,
  sse,
  sseHeaders,
} from "@/server/seat-pipe";
import { serveInvite } from "@/server/serve";

type Body = { utterance: string; referenceTurnId?: string | null };

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
  try {
    await requireOwnedSession(req, sessionId);
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
  const body = (await req.json()) as Body;
  const utterance = body.utterance ?? "";
  const referenceTurnId =
    typeof body.referenceTurnId === "string" && body.referenceTurnId.trim()
      ? body.referenceTurnId.trim()
      : null;

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

  const served = await serveInvite(sessionId, utterance).catch(() => null);
  if (served) {
    return Response.json({
      matched: false,
      routerHandled: true,
      serve: served,
    });
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
      const binding = await resolveDestBinding(sessionId, targetKey);
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
    const binding = await resolveDestBinding(sessionId, seatKey);
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
    const binding = await resolveDestBinding(sessionId, calledSeat);
    if (!binding) {
      return Response.json(
        { error: "Dest is not an open member of this room" },
        { status: 400 },
      );
    }
    await setActiveBinding(sessionId, binding.id);
    [session] = await db
      .select()
      .from(voiceSession)
      .where(eq(voiceSession.id, sessionId))
      .limit(1);
    prompt = collapseSpeechStutter(remainder.trim());
  }

  if (!prompt) {
    if (calledSeat) {
      const binding = await bindingForSeat(calledSeat);
      if (isTravisSeat(calledSeat)) await noteTravisUnwired(sessionId);
      return Response.json({
        matched: false,
        routerHandled: true,
        destTravis: isTravisSeat(calledSeat),
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

  const decided = calledSeat
    ? { kind: "send" as const, seatKeys: [calledSeat], prompt }
    : { kind: "send" as const, seatKeys: [], prompt };
  const dests = await destBindingsForSend({
    sessionId,
    decided,
    referenceTurnId,
  });
  const [stickyRow] = dests.length
    ? [dests[dests.length - 1]]
    : await db
        .select()
        .from(agentBinding)
        .where(eq(agentBinding.id, session!.activeBindingId))
        .limit(1);
  const binding = stickyRow;
  if (!binding) {
    return Response.json({ error: "No active binding" }, { status: 400 });
  }
  const bindings = dests.length ? dests : [binding];
  if (dests.length) {
    await setActiveBinding(sessionId, dests[dests.length - 1].id);
  }

  const seatKey = (binding.seatKey ?? "pm") as SeatKey;
  const seatLabel = binding.label ?? seatKeyToLabel(seatKey);

  try {
    for (const dest of bindings) {
      if (!isTravisSeat(dest.seatKey)) {
        await requireOpenMember(sessionId, dest.id);
      }
    }
  } catch (err) {
    if (err instanceof MembershipError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  const travisBinds = bindings.filter((b) => isTravisSeat(b.seatKey));
  const cursorBinds = bindings.filter((b) => !isTravisSeat(b.seatKey));

  if (travisBinds.length) {
    await noteTravisUnwired(sessionId);
    const fromCall = calledSeat
      ? isVocativeOnlyCall(match.cleanedText, remainder.trim(), calledSeat)
      : false;
    const travisPrompt = fromCall || !prompt ? "" : prompt;
    if (!travisPrompt && !cursorBinds.length) {
      return Response.json({
        matched: false,
        routerHandled: true,
        destTravis: true,
        activeSeatKey: seatKey,
        activeLabel: seatLabel,
      });
    }
    if (travisPrompt && !cursorBinds.length) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const send = (event: string, data: unknown) => {
            controller.enqueue(encoder.encode(sse(event, data)));
          };
          try {
            await pipeTravisText({
              sessionId,
              prompt: travisPrompt,
              send,
              referenceTurnId,
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
  }

  if (cursorBinds.length === 1 && (await seatHasActiveRun(cursorBinds[0]))) {
    const queue = await enqueueOnSeat({
      sessionId,
      binding: cursorBinds[0],
      text: prompt,
    });
    return Response.json({
      matched: true,
      queued: true,
      queue,
      matchedPhrase: match.matchedPhrase,
      activeSeatKey: (cursorBinds[0].seatKey ?? "pm") as SeatKey,
      activeLabel: cursorBinds[0].label ?? seatKeyToLabel(
        (cursorBinds[0].seatKey ?? "pm") as SeatKey,
      ),
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sse(event, data)));
      };
      try {
        if (travisBinds.length) {
          await pipeTravisText({
            sessionId,
            prompt,
            send,
            referenceTurnId,
          });
        }
        if (cursorBinds.length) {
          await sendOrEnqueueMany({
            sessionId,
            bindings: cursorBinds,
            prompt,
            send,
            referenceTurnId,
          });
        }
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
