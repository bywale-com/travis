import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { voiceTurn } from "@/server/db/schema";
import { jsonRoute } from "@/server/api-error";
import { requireOwnedSession } from "@/server/operator";

/** Room log: ordered turns with SCP-002 grain. */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  return jsonRoute(async () => {
    const { id } = await ctx.params;
    await requireOwnedSession(req, id);

    const turns = await db
      .select()
      .from(voiceTurn)
      .where(eq(voiceTurn.sessionId, id))
      .orderBy(asc(voiceTurn.seq));

    return NextResponse.json({
      turns: turns.map((t) => ({
        id: t.id,
        seq: t.seq,
        role: t.role,
        kind: t.kind,
        seatKey: t.seatKey,
        referenceTurnId: t.referenceTurnId,
        initiativeId: t.initiativeId,
        speakable: t.speakable,
        thoughtStatus: t.thoughtStatus,
        text: t.text,
        createdAt: t.createdAt,
      })),
    });
  });
}
