import { NextResponse } from "next/server";
import { jsonRoute } from "@/server/api-error";
import {
  HOLD_FEED_PREFIX,
  InitiativeError,
  holdInitiative,
  listInitiatives,
} from "@/server/initiative";
import { bindingForSeat, setActiveBinding } from "@/server/travis-dest";
import { pipeTravisText } from "@/server/travis-reply";
import { sse, sseHeaders } from "@/server/seat-pipe";
import { voiceTurn } from "@/server/db/schema";
import type { InitiativeStatus } from "@/server/db/schema";
import { db } from "@/server/db/client";
import { eq } from "drizzle-orm";

type PostBody = { foundingTurnId?: string };

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  return jsonRoute(async () => {
    const { id: sessionId } = await ctx.params;
    const statusRaw = new URL(req.url).searchParams.get("status") ?? "open";
    const status = ["open", "done", "all"].includes(statusRaw)
      ? (statusRaw as InitiativeStatus | "all")
      : "open";
    const items = await listInitiatives(sessionId, status);
    return NextResponse.json({ initiatives: items });
  });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await ctx.params;
  const body = (await req.json()) as PostBody;
  const foundingTurnId = String(body.foundingTurnId ?? "").trim();
  if (!foundingTurnId) {
    return NextResponse.json({ error: "foundingTurnId required" }, { status: 400 });
  }

  let row;
  try {
    row = await holdInitiative(sessionId, foundingTurnId);
  } catch (err) {
    if (err instanceof InitiativeError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  const [founding] = await db
    .select()
    .from(voiceTurn)
    .where(eq(voiceTurn.id, foundingTurnId))
    .limit(1);
  const travis = await bindingForSeat("travis");
  if (travis) {
    try {
      await setActiveBinding(sessionId, travis.id);
    } catch {
      /* dest flip is best-effort; the ticket already exists */
    }
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sse(event, data)));
      };
      try {
        send("held", { initiative: row });
        if (founding) {
          await pipeTravisText({
            sessionId,
            prompt: `${HOLD_FEED_PREFIX}${founding.text}`,
            send,
            userTurn: founding,
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
