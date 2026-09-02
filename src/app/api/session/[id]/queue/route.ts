import { NextResponse } from "next/server";
import { inspectAndNudgeQueue } from "@/server/seat-pipe";

/** Session queue snapshot. Harvests finished Cursor runs whose SSE died; nudges stale live-run rows; names seats ready to drain. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const { queue, drainable } = await inspectAndNudgeQueue(id);
  return NextResponse.json({ queue, drainable });
}
