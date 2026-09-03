import { NextResponse } from "next/server";
import { jsonRoute } from "@/server/api-error";
import { ensureSeatBindings } from "@/server/db/ensure-bindings";
import {
  createExplicitRoom,
  ensureMembershipStore,
  listRoomsForOperator,
  MembershipError,
  sessionJson,
} from "@/server/room-membership";
import { clientIpFromHeaders } from "@/server/client-ip";
import { requireOperator, roomScopeForOperator } from "@/server/operator";

type CreateBody = {
  title?: string;
  bindingIds?: string[];
};

export async function GET(req: Request) {
  return jsonRoute(async () => {
    await ensureSeatBindings();
    await ensureMembershipStore();
    // Auth gates the index; IP stays telemetry.
    const operator = await requireOperator(req);
    const scope = await roomScopeForOperator(operator);
    const rooms = await listRoomsForOperator(scope.viewerIds);
    return NextResponse.json({ rooms });
  });
}

/** Explicit create: chosen members + Travis. Not the catalog. */
export async function POST(req: Request) {
  return jsonRoute(async () => {
    await ensureSeatBindings();
    await ensureMembershipStore();
    const ip = clientIpFromHeaders(req.headers);
    const operator = await requireOperator(req);
    const scope = await roomScopeForOperator(operator);
    const body = (await req.json().catch(() => ({}))) as CreateBody;
    const bindingIds = Array.isArray(body.bindingIds) ? body.bindingIds : [];
    try {
      const session = await createExplicitRoom({
        title: typeof body.title === "string" ? body.title : "",
        clientIp: ip,
        operatorId: scope.ownerId,
        bindingIds,
      });
      return NextResponse.json({ session: await sessionJson(session) });
    } catch (err) {
      if (err instanceof MembershipError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }
  });
}
