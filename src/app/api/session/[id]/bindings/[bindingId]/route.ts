import { NextResponse } from "next/server";
import { jsonRoute } from "@/server/api-error";
import { MembershipError } from "@/server/room-membership";
import { requireOwnedSession } from "@/server/operator";
import { agentBindingById } from "@/server/create-agent";
import { SitError, sitBinding } from "@/server/sit";

type Body = { protocol?: string };

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string; bindingId: string }> },
) {
  return jsonRoute(async () => {
    const { id: sessionId, bindingId } = await ctx.params;
    await requireOwnedSession(req, sessionId);
    const body = (await req.json().catch(() => ({}))) as Body;
    const binding = await agentBindingById(bindingId);
    if (!binding) {
      return NextResponse.json({ error: "Binding not found." }, { status: 404 });
    }
    try {
      const sat = await sitBinding({
        sessionId,
        binding,
        protocol: body.protocol,
      });
      return NextResponse.json({
        seatKey: sat.binding.seatKey,
        label: sat.binding.label,
        protocolPath: sat.protocolPath,
      });
    } catch (err) {
      if (err instanceof SitError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      if (err instanceof MembershipError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }
  });
}
