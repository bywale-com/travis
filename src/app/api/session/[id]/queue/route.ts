import { NextResponse } from "next/server";
import { queueSnapshot } from "@/server/queue";

/** Session queue snapshot — grouped by seat, empty seats omitted. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const queue = await queueSnapshot(id);
  return NextResponse.json({ queue });
}
