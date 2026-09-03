import { NextResponse } from "next/server";
import { jsonRoute } from "@/server/api-error";
import { requestOperatorLink } from "@/server/operator";

export async function POST(req: Request) {
  return jsonRoute(async () => {
    const body = (await req.json().catch(() => ({}))) as {
      email?: unknown;
    };
    const email = typeof body.email === "string" ? body.email : "";
    const result = await requestOperatorLink(req, email);
    if (result.outcome === "send_failed") {
      return NextResponse.json(
        {
          ok: false,
          error:
            "We couldn't send the login email right now. Check Resend is wired on Vercel, then try again.",
        },
        { status: 503 },
      );
    }
    // Unknown email gets the same quiet success as a sent link.
    return NextResponse.json({ ok: true });
  });
}

