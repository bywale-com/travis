import { NextResponse } from "next/server";
import { exchangeRealtimeSdp } from "@/server/travis-openai";
import { AuthError, jsonRoute } from "@/server/api-error";
import { requireOwnedSession } from "@/server/operator";

export const runtime = "nodejs";
export const maxDuration = 30;

type Body = { sdp?: string; token?: string };

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  return jsonRoute(async () => {
    const { id: sessionId } = await ctx.params;
    try {
      await requireOwnedSession(req, sessionId);
    } catch (err) {
      if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const body = (await req.json()) as Body;
    const offerSdp = String(body.sdp ?? "").trim();
    const token = String(body.token ?? "").trim();
    if (!offerSdp.startsWith("v=")) {
      return NextResponse.json({ error: "Live: no SDP offer" }, { status: 400 });
    }
    if (!token) {
      return NextResponse.json({ error: "Live: no token" }, { status: 400 });
    }

    const exchanged = await exchangeRealtimeSdp({ offerSdp, sessionId });
    if (!exchanged.ok) {
      const detail = exchanged.body.trim().slice(0, 180) || `Live SDP ${exchanged.status}`;
      return NextResponse.json({ error: detail }, { status: 502 });
    }
    return NextResponse.json({ sdp: exchanged.sdp });
  });
}
