import { NextResponse } from "next/server";
import { jsonRoute } from "@/server/api-error";
import { markTurnsHeard } from "@/server/serve";
import { requireOwnedSession } from "@/server/operator";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  return jsonRoute(async () => {
    const { id } = await ctx.params;
    await requireOwnedSession(req, id);
    const body = (await req.json()) as { turnIds?: unknown };
    const turnIds = Array.isArray(body.turnIds)
      ? body.turnIds.filter((x): x is string => typeof x === "string")
      : [];
    await markTurnsHeard(id, turnIds);
    return NextResponse.json({ ok: true });
  });
}
