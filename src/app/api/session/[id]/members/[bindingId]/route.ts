import { NextResponse } from "next/server";
import { jsonRoute } from "@/server/api-error";
import {
  MembershipError,
  removeMember,
  roomSeats,
} from "@/server/room-membership";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string; bindingId: string }> },
) {
  return jsonRoute(async () => {
    const { id: sessionId, bindingId } = await ctx.params;
    try {
      await removeMember(sessionId, bindingId);
      return NextResponse.json({ seats: await roomSeats(sessionId) });
    } catch (err) {
      if (err instanceof MembershipError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }
  });
}
