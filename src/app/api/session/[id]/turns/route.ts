import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { voiceTurn } from "@/server/db/schema";

/** Thread pane: query turns for a session (no hard-coded demo rows). */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const turns = await db
    .select()
    .from(voiceTurn)
    .where(eq(voiceTurn.sessionId, id))
    .orderBy(asc(voiceTurn.seq));

  return NextResponse.json({ turns });
}
