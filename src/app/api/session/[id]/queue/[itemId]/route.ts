import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { voiceSession } from "@/server/db/schema";
import { deleteQueuedItem, queueSnapshot } from "@/server/queue";
import { bargeQueuedItem, sse, sseHeaders } from "@/server/seat-pipe";
import { AuthError } from "@/server/api-error";
import { requireOwnedSession } from "@/server/operator";

type Body = { action: "send" | "delete" };

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string; itemId: string }> },
) {
  const { id: sessionId, itemId } = await ctx.params;
  const body = (await req.json()) as Body;
  try {
    await requireOwnedSession(req, sessionId);
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
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
  if (body.action !== "send" && body.action !== "delete") {
    return Response.json({ error: "action send|delete required" }, { status: 400 });
  }

  if (body.action === "delete") {
    await deleteQueuedItem(sessionId, itemId);
    return Response.json({ queue: await queueSnapshot(sessionId) });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sse(event, data)));
      };
      try {
        await bargeQueuedItem({ sessionId, itemId, send });
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
