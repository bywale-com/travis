import { eq } from "drizzle-orm";
import { collapseSpeechStutter } from "@/lib/absorb-text";
import { resolveTypedSend, uniqueSeatKeys } from "@/lib/typed-dest";
import { seatKeyToLabel } from "@/lib/router";
import { db } from "@/server/db/client";
import { agentBinding, voiceSession } from "@/server/db/schema";
import type { AgentBinding, SeatKey } from "@/server/db/schema";
import { sendOrEnqueueMany, sse, sseHeaders } from "@/server/seat-pipe";

type Body = {
  text?: string;
  chipSeatKey?: SeatKey | null;
  chipSeatKeys?: SeatKey[] | null;
};

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

/** Type-composer send — no done-phrase. Same pipe as voice. */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await ctx.params;
  const body = (await req.json()) as Body;
  const decided = resolveTypedSend({
    chipSeatKeys: uniqueSeatKeys(body.chipSeatKeys ?? []),
    chipSeatKey: body.chipSeatKey ?? null,
    text: body.text ?? "",
  });

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

  if (decided.kind === "empty") {
    return Response.json({ empty: true });
  }

  const destBindings: AgentBinding[] = [];
  if (decided.kind === "switch" || decided.kind === "send") {
    const keys =
      decided.kind === "switch" ? [decided.seatKey] : decided.seatKeys;
    for (const key of keys) {
      const dest = await bindingForSeat(key);
      if (dest) destBindings.push(dest);
    }
  }

  const sticky = destBindings[destBindings.length - 1];
  if (sticky) {
    await setActiveBinding(sessionId, sticky.id);
    [session] = await db
      .select()
      .from(voiceSession)
      .where(eq(voiceSession.id, sessionId))
      .limit(1);
  }

  const [active] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.id, session!.activeBindingId))
    .limit(1);

  if (!active) {
    return Response.json({ error: "No active binding" }, { status: 400 });
  }

  const seatKey = (active.seatKey ?? "pm") as SeatKey;
  const seatLabel = active.label ?? seatKeyToLabel(seatKey);

  if (decided.kind === "switch") {
    return Response.json({
      matched: false,
      routerHandled: true,
      activeSeatKey: seatKey,
      activeLabel: seatLabel,
    });
  }

  const prompt = collapseSpeechStutter(decided.prompt);
  const bindings = destBindings.length ? destBindings : [active];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sse(event, data)));
      };
      try {
        await sendOrEnqueueMany({
          sessionId,
          bindings,
          prompt,
          send,
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
