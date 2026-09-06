import { NextResponse } from "next/server";
import { jsonRoute } from "@/server/api-error";
import {
  listSessionArtifacts,
  markArtifactsSeen,
} from "@/server/artifacts";
import { requireOwnedSession } from "@/server/operator";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  return jsonRoute(async () => {
    const { id } = await ctx.params;
    await requireOwnedSession(req, id);
    const artifacts = await listSessionArtifacts(id);
    return NextResponse.json({ artifacts });
  });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  return jsonRoute(async () => {
    const { id } = await ctx.params;
    await requireOwnedSession(req, id);
    const body = (await req.json()) as { ids?: unknown };
    const ids = Array.isArray(body.ids)
      ? body.ids.filter((x): x is string => typeof x === "string")
      : [];
    await markArtifactsSeen(id, ids);
    const artifacts = await listSessionArtifacts(id);
    return NextResponse.json({ artifacts });
  });
}
