import { NextResponse } from "next/server";
import { liveRunsForSession } from "@/server/queue";
import { inspectAndNudgeQueue } from "@/server/seat-pipe";
import { jsonRoute } from "@/server/api-error";
import { requireOwnedSession } from "@/server/operator";

/** Session queue snapshot. Harvests finished Cursor runs whose SSE died; nudges stale live-run rows; names seats ready to drain. */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  return jsonRoute(async () => {
    const { id } = await ctx.params;
    await requireOwnedSession(req, id);

    const { queue, drainable } = await inspectAndNudgeQueue(id);
    const now = Date.now();
    const runs = await liveRunsForSession(id);
    const running = runs.map(({ live, binding }) => ({
      seatKey: binding.seatKey,
      label: binding.label,
      elapsedMs: Math.max(0, now - new Date(live.startedAt).getTime()),
    }));
    return NextResponse.json({ queue, drainable, running });
  });
}
