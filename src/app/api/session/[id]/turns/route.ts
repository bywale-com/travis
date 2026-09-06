import { and, asc, eq, gt, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { parseAfterSeq } from "@/lib/list-live";
import { db } from "@/server/db/client";
import { voiceTurn } from "@/server/db/schema";
import { attachmentsForTurns } from "@/server/artifacts";
import { listMotionCards } from "@/server/motion";
import { listSessionStreams } from "@/server/stream";
import { jsonRoute } from "@/server/api-error";
import { requireOwnedSession } from "@/server/operator";

/** Room log: ordered turns with SCP-002 grain. Incremental via afterSeq (029). */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  return jsonRoute(async () => {
    const { id } = await ctx.params;
    await requireOwnedSession(req, id);

    const afterSeq = parseAfterSeq(new URL(req.url).searchParams.get("afterSeq"));
    const turns = await db
      .select()
      .from(voiceTurn)
      .where(
        afterSeq != null
          ? and(
              eq(voiceTurn.sessionId, id),
              or(
                gt(voiceTurn.seq, afterSeq),
                eq(voiceTurn.thoughtStatus, "streaming"),
              ),
            )
          : eq(voiceTurn.sessionId, id),
      )
      .orderBy(asc(voiceTurn.seq));
    const hung = await attachmentsForTurns(
      id,
      afterSeq != null ? turns.map((t) => t.id) : undefined,
    );
    const cards = await listMotionCards(id).catch(() => []);
    const streams = await listSessionStreams(id).catch(() => ({
      live: [],
      cards: [],
    }));

    return NextResponse.json({
      cards,
      streams,
      turns: turns.map((t) => ({
        id: t.id,
        seq: t.seq,
        role: t.role,
        kind: t.kind,
        seatKey: t.seatKey,
        referenceTurnId: t.referenceTurnId,
        initiativeId: t.initiativeId,
        heardAt: t.heardAt,
        speakable: t.speakable,
        thoughtStatus: t.thoughtStatus,
        text: t.text,
        createdAt: t.createdAt,
        attachments: hung.get(t.id) ?? [],
      })),
    });
  });
}
