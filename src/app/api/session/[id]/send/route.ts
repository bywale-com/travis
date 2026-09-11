import { eq } from "drizzle-orm";
import { destLeaveMiss } from "@/lib/travis-miss";
import { collapseSpeechStutter } from "@/lib/absorb-text";
import { isSitProtocolRole } from "@/lib/protocol-path";
import { resolveTypedSend, uniqueSeatKeys } from "@/lib/typed-dest";
import { seatKeyToLabel } from "@/lib/router";
import { isTravisSeat } from "@/lib/seats";
import { db } from "@/server/db/client";
import { agentBinding, voiceSession } from "@/server/db/schema";
import type { AgentBinding, SeatKey } from "@/server/db/schema";
import { noteTravisUnwired } from "@/server/travis-dest";
import { AuthError, jsonRoute } from "@/server/api-error";
import { MembershipError, requireOpenMember } from "@/server/room-membership";
import { requireOwnedSession } from "@/server/operator";
import { destBindingsForSend } from "@/server/dest-resolve";
import { listOpenDestJobs } from "@/server/dest-job";
import { dispatchToSeat } from "@/server/dispatch";
import { streamIntent } from "@/lib/stream-intent";
import { dispatchStreamIntents } from "@/server/stream-dispatch";
import { pipeTravisText } from "@/server/travis-reply";
import { insertStatusTurn, insertUserTurn, sse, sseHeaders } from "@/server/seat-pipe";

type Body = {
  text?: string;
  chipSeatKey?: string | null;
  chipSeatKeys?: string[] | null;
  referenceTurnId?: string | null;
};

async function setActiveBinding(sessionId: string, bindingId: string) {
  await db
    .update(voiceSession)
    .set({ activeBindingId: bindingId, bindingId })
    .where(eq(voiceSession.id, sessionId));
}

/** Hobby cap. Same as the room wire. Deep Agents invoke can outlast the default. */
export const maxDuration = 60;

/** Type-composer send — no done-phrase. Same pipe as voice. */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  return jsonRoute(async () => {
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
  const decided = resolveTypedSend({
    chipSeatKeys: uniqueSeatKeys(body.chipSeatKeys ?? []),
    chipSeatKey: body.chipSeatKey ?? null,
    text: body.text ?? "",
  });

  const [session] = await db
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

  if (decided.kind === "empty") {
    return Response.json({ empty: true });
  }

  const referenceTurnId =
    typeof body.referenceTurnId === "string" && body.referenceTurnId.trim()
      ? body.referenceTurnId.trim()
      : null;

  const [active] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.id, session.activeBindingId))
    .limit(1);

  if (!active) {
    return Response.json({ error: "No active binding" }, { status: 400 });
  }

  // Switch is JSON. Resolve dest here. Send must not — role dest can spin.
  if (decided.kind === "switch") {
    const destBindings: AgentBinding[] = await destBindingsForSend({
      sessionId,
      decided,
      referenceTurnId,
    });
    try {
      for (const dest of destBindings) {
        await requireOpenMember(sessionId, dest.id);
      }
    } catch (err) {
      if (err instanceof MembershipError) {
        return Response.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }
    const sticky = destBindings[destBindings.length - 1];
    if (sticky) await setActiveBinding(sessionId, sticky.id);
    const bound = sticky ?? active;
    const seatKey = (bound.seatKey ?? "pm") as SeatKey;
    return Response.json({
      matched: false,
      routerHandled: true,
      activeSeatKey: seatKey,
      activeLabel: bound.label ?? seatKeyToLabel(seatKey),
    });
  }

  if (!decided.seatKeys.length && !referenceTurnId) {
    try {
      await requireOpenMember(sessionId, active.id);
    } catch (err) {
      if (err instanceof MembershipError) {
        return Response.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }
  }

  const prompt = collapseSpeechStutter(decided.prompt);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(": ping\n\n"));
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sse(event, data)));
      };
      try {
        const userTurn = await insertUserTurn(
          sessionId,
          prompt,
          "travis",
          undefined,
          referenceTurnId,
        );
        const destBindings: AgentBinding[] = await destBindingsForSend({
          sessionId,
          decided,
          referenceTurnId,
        });
        for (const dest of destBindings) {
          await requireOpenMember(sessionId, dest.id);
        }
        const sticky = destBindings[destBindings.length - 1];
        if (sticky) await setActiveBinding(sessionId, sticky.id);
        if (destBindings.some((b) => isTravisSeat(b.seatKey))) {
          await noteTravisUnwired(sessionId);
        }
        const cursorBinds = destBindings.filter((b) => !isTravisSeat(b.seatKey));
        const dispatchResults = await Promise.allSettled(
          cursorBinds.map((binding) =>
            dispatchToSeat({
              sessionId,
              binding,
              prompt,
              enqueueIfBusy: isSitProtocolRole(binding.seatKey) ? false : undefined,
            }),
          ),
        );
        for (let i = 0; i < cursorBinds.length; i++) {
          const row = dispatchResults[i];
          if (row.status !== "fulfilled" || row.value.status !== "error") continue;
          const seatKey = (cursorBinds[i].seatKey ?? "pm") as SeatKey;
          await insertStatusTurn(
            sessionId,
            destLeaveMiss(row.value.error),
            seatKey,
          ).catch(() => {});
        }
        const openJobs = await listOpenDestJobs(sessionId).catch(() => []);
        await dispatchStreamIntents({
          sessionId,
          phrase: prompt,
          intents: streamIntent({ phrase: prompt, openJobs }),
          skip: {
            seatKeys: cursorBinds.map((b) => b.seatKey),
            bindingIds: cursorBinds.map((b) => b.id),
          },
        });
        await pipeTravisText({
          sessionId,
          prompt,
          send,
          userTurn,
          referenceTurnId,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const destSeat = (decided.seatKeys.find((k) => !isTravisSeat(k)) ??
          decided.seatKeys[0] ??
          "travis") as SeatKey;
        await insertStatusTurn(sessionId, destLeaveMiss(msg), destSeat).catch(
          () => {},
        );
        send("error", { error: msg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: sseHeaders() });
  });
}
