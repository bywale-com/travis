import postgres from "postgres";
import { resumeAfterSeq } from "@/lib/list-live";
import { jsonRoute } from "@/server/api-error";
import { readInitiative } from "@/server/initiative";
import { listBacklog, listMotionCards } from "@/server/motion";
import { requireOwnedSession } from "@/server/operator";
import { postgresPoolOptions } from "@/server/db/pool";
import {
  drainReadySeats,
  inspectAndNudgeQueue,
  sse,
  sseHeaders,
} from "@/server/seat-pipe";
import { listSessionStreams } from "@/server/stream";
import { turnsAfterSeq } from "@/server/turns-read";

/** Hobby cap. Resume from last seq when this function ends. */
export const maxDuration = 60;

const HEARTBEAT_MS = 15_000;
const REAP_MS = 2_000;

function listStamp(items: unknown[]): string {
  return JSON.stringify(
    (items as Array<Record<string, unknown>>).map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      next: row.next,
      litSeatKeys: row.litSeatKeys,
      kind: row.kind,
    })),
  );
}

function streamStamp(streams: {
  live?: unknown;
  cards?: unknown;
  motion?: unknown;
}): string {
  return JSON.stringify({
    live: streams.live ?? [],
    cards: streams.cards ?? [],
    motion: streams.motion ?? [],
  });
}

/** SCP-029 — one room wire. Resume from seq, then LISTEN travis_room. */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  return jsonRoute(async () => {
    const { id } = await ctx.params;
    await requireOwnedSession(req, id);

    const url = new URL(req.url);
    const afterSeq = resumeAfterSeq(
      req.headers.get("Last-Event-ID"),
      url.searchParams.get("afterSeq"),
    );
    const ticketId = url.searchParams.get("ticketId")?.trim() || null;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let lastSentSeq = afterSeq ?? -1;
        let lastList = "";
        let lastStream = "";
        let closed = false;
        let listenSql: ReturnType<typeof postgres> | null = null;
        let unlisten: (() => Promise<unknown>) | null = null;
        let heartbeat: ReturnType<typeof setInterval> | null = null;
        let reap: ReturnType<typeof setInterval> | null = null;
        let emitTail = Promise.resolve();

        const emit = (event: string, data: unknown, eventId?: number) => {
          if (closed) return;
          let chunk = "";
          if (eventId != null) chunk += `id: ${eventId}\n`;
          chunk += sse(event, data);
          controller.enqueue(encoder.encode(chunk));
        };

        const enqueue = (fn: () => Promise<void>) => {
          emitTail = emitTail.then(fn).catch(() => {});
        };

        const emitCatchUp = async (fromSeq: number) => {
          const turns = await turnsAfterSeq(id, fromSeq < 0 ? null : fromSeq);
          for (const turn of turns) {
            emit("turn", turn, turn.seq);
            if (turn.seq > lastSentSeq) lastSentSeq = turn.seq;
          }
          const pile = await listBacklog(id, { view: "all", status: "all" }).catch(
            () => null,
          );
          if (pile && Array.isArray(pile.items)) {
            const stamp = listStamp(pile.items);
            if (stamp !== lastList) {
              lastList = stamp;
              emit("backlog", {
                items: pile.items,
                motionCount: pile.motionCount,
                listAt: new Date().toISOString(),
              });
            }
          }
          if (ticketId) {
            try {
              const initiative = await readInitiative(id, ticketId);
              emit("ticket", { initiative });
            } catch {
              /* ticket gone */
            }
          }
          const streams = await listSessionStreams(id).catch(() => ({
            live: [],
            cards: [],
          }));
          const cards = await listMotionCards(id).catch(() => []);
          const stamp = streamStamp({ ...streams, motion: cards });
          if (stamp !== lastStream) {
            lastStream = stamp;
            emit("stream", { cards, streams });
          }
        };

        const cleanup = async () => {
          if (closed) return;
          closed = true;
          if (heartbeat) clearInterval(heartbeat);
          if (reap) clearInterval(reap);
          try {
            if (unlisten) await unlisten();
          } catch {
            /* ignore */
          }
          try {
            if (listenSql) await listenSql.end({ timeout: 2 });
          } catch {
            /* ignore */
          }
          try {
            controller.close();
          } catch {
            /* already closed */
          }
        };

        try {
          await emitCatchUp(afterSeq ?? -1);
          const dbUrl = process.env.DATABASE_URL;
          if (!dbUrl) throw new Error("DATABASE_URL is not set");
          listenSql = postgres(dbUrl, {
            ...postgresPoolOptions(),
            idle_timeout: 0,
            max_lifetime: 0,
          });
          const handle = await listenSql.listen("travis_room", (payload) => {
            if (payload !== id) return;
            enqueue(async () => {
              if (closed) return;
              await emitCatchUp(lastSentSeq);
            });
          });
          unlisten = () => handle.unlisten();

          heartbeat = setInterval(() => {
            if (closed) return;
            try {
              controller.enqueue(encoder.encode(": ping\n\n"));
            } catch {
              void cleanup();
            }
          }, HEARTBEAT_MS);

          reap = setInterval(() => {
            enqueue(async () => {
              if (closed) return;
              const { drainable } = await inspectAndNudgeQueue(id);
              if (!drainable.length) return;
              await drainReadySeats({
                sessionId: id,
                send: (event, data) => {
                  if (event === "queue" || event === "queued") {
                    emit(event, data);
                  }
                },
              });
            });
          }, REAP_MS);

          req.signal.addEventListener("abort", () => {
            void cleanup();
          });
        } catch (err) {
          if (!closed) {
            emit("error", {
              error: err instanceof Error ? err.message : String(err),
            });
            await cleanup();
          }
        }
      },
      cancel() {
        /* abort listener above */
      },
    });

    return new Response(stream, { headers: sseHeaders() });
  });
}
