import { NextResponse } from "next/server";
import { jsonRoute } from "@/server/api-error";
import { offerForUnheard, listUnheardReports, serveHear, serveSkip } from "@/server/serve";
import { requireOwnedSession } from "@/server/operator";

type Body = {
  action?: "hear" | "skip" | "offer";
  seat?: string;
  form?: "gist" | "full";
};

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  return jsonRoute(async () => {
    const { id } = await ctx.params;
    await requireOwnedSession(req, id);
    const body = (await req.json()) as Body;
    const action = body.action ?? "hear";
    if (action === "skip") {
      const skip = await serveSkip(id, { seat: body.seat });
      return NextResponse.json({ ok: true, speak: skip.speak, turnId: skip.turnId });
    }
    if (action === "offer") {
      const rows = await listUnheardReports(id);
      return NextResponse.json({
        ok: true,
        speak: offerForUnheard(rows),
        count: rows.length,
      });
    }
    const hear = await serveHear(id, { seat: body.seat, form: body.form });
    return NextResponse.json({
      ok: true,
      speak: hear.speak,
      turnId: hear.turnId,
    });
  });
}
