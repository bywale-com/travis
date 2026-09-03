import { NextResponse } from "next/server";
import { jsonRoute } from "@/server/api-error";
import { clientIpFromHeaders } from "@/server/client-ip";
import { ensureSeatBindings } from "@/server/db/ensure-bindings";
import {
  createExplicitRoom,
  ensureMembershipStore,
  listRoomsForIp,
  MembershipError,
  sessionJson,
} from "@/server/room-membership";

type CreateBody = {
  title?: string;
  bindingIds?: string[];
};

export async function GET(req: Request) {
  return jsonRoute(async () => {
    await ensureSeatBindings();
    await ensureMembershipStore();
    const ip = clientIpFromHeaders(req.headers);
    const rooms = await listRoomsForIp(ip);
    return NextResponse.json({ rooms });
  });
}

/** Explicit create: chosen members + Travis. Not the catalog. */
export async function POST(req: Request) {
  return jsonRoute(async () => {
    await ensureSeatBindings();
    await ensureMembershipStore();
    const ip = clientIpFromHeaders(req.headers);
    const body = (await req.json().catch(() => ({}))) as CreateBody;
    const bindingIds = Array.isArray(body.bindingIds) ? body.bindingIds : [];
    try {
      const session = await createExplicitRoom({
        title: typeof body.title === "string" ? body.title : "",
        clientIp: ip,
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
