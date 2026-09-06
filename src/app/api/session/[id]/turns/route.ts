import { NextResponse } from "next/server";
import { parseAfterSeq } from "@/lib/list-live";
import { listMotionCards } from "@/server/motion";
import { listSessionStreams } from "@/server/stream";
import { jsonRoute } from "@/server/api-error";
import { requireOwnedSession } from "@/server/operator";
import { turnsAfterSeq } from "@/server/turns-read";

/** Room log. Incremental via afterSeq — fallback + resume (029). */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  return jsonRoute(async () => {
    const { id } = await ctx.params;
    await requireOwnedSession(req, id);

    const afterSeq = parseAfterSeq(new URL(req.url).searchParams.get("afterSeq"));
    const turns = await turnsAfterSeq(id, afterSeq);
    const cards = await listMotionCards(id).catch(() => []);
    const streams = await listSessionStreams(id).catch(() => ({
      live: [],
      cards: [],
    }));

    return NextResponse.json({
      cards,
      streams,
      turns,
    });
  });
}
