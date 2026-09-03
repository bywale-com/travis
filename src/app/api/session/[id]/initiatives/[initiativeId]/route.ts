import { NextResponse } from "next/server";
import { jsonRoute } from "@/server/api-error";
import {
  InitiativeError,
  markInitiativeDone,
  readInitiative,
} from "@/server/initiative";

type PatchBody = { status?: string };

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string; initiativeId: string }> },
) {
  return jsonRoute(async () => {
    const { id: sessionId, initiativeId } = await ctx.params;
    try {
      const ticket = await readInitiative(sessionId, initiativeId);
      return NextResponse.json({ initiative: ticket });
    } catch (err) {
      if (err instanceof InitiativeError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }
  });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string; initiativeId: string }> },
) {
  return jsonRoute(async () => {
    const { id: sessionId, initiativeId } = await ctx.params;
    const body = (await req.json()) as PatchBody;
    if (body.status !== "done") {
      return NextResponse.json({ error: "status must be done" }, { status: 400 });
    }
    try {
      const row = await markInitiativeDone(sessionId, initiativeId);
      return NextResponse.json({ initiative: row });
    } catch (err) {
      if (err instanceof InitiativeError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }
  });
}
