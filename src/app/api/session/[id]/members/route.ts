import { NextResponse } from "next/server";
import { jsonRoute } from "@/server/api-error";
import { addMember, MembershipError, roomSeats } from "@/server/room-membership";

type Body = { bindingId?: string };

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  return jsonRoute(async () => {
    const { id: sessionId } = await ctx.params;
    const body = (await req.json()) as Body;
    const bindingId = String(body.bindingId ?? "").trim();
    if (!bindingId) {
      return NextResponse.json({ error: "bindingId required" }, { status: 400 });
    }
    try {
      await addMember(sessionId, bindingId);
      return NextResponse.json({ seats: await roomSeats(sessionId) });
    } catch (err) {
      if (err instanceof MembershipError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }
  });
}
