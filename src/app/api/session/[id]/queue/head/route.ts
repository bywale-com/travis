import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { agentBinding, voiceSession } from "@/server/db/schema";
import type { SeatKey } from "@/server/db/schema";
import { deleteQueuedItem, getQueueHead, queueSnapshot } from "@/server/queue";
import {
  bargeQueuedItem,
  sse,
  sseHeaders,
} from "@/server/seat-pipe";

type Body = { seatKey: SeatKey; action: "send" | "delete" };

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await ctx.params;
  const body = (await req.json()) as Body;
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
  if (!body.seatKey || !body.action) {
    return Response.json(
      { error: "seatKey and action required" },
      { status: 400 },
    );
  }

  const [binding] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.seatKey, body.seatKey))
    .limit(1);
  if (!binding) {
    return Response.json({ error: "Unknown seat" }, { status: 400 });
  }

  const head = await getQueueHead(sessionId, binding.id);
  if (!head) {
    return Response.json({ queue: await queueSnapshot(sessionId) });
  }

  if (body.action === "delete") {
    await deleteQueuedItem(sessionId, head.id);
    return Response.json({ queue: await queueSnapshot(sessionId) });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sse(event, data)));
      };
      try {
        await bargeQueuedItem({ sessionId, itemId: head.id, send });
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
