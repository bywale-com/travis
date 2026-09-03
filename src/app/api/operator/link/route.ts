import { NextResponse } from "next/server";
import { jsonRoute } from "@/server/api-error";
import { requestOperatorLink } from "@/server/operator";

export async function POST(req: Request) {
  return jsonRoute(async () => {
    const body = (await req.json().catch(() => ({}))) as {
      email?: unknown;
    };
    const email = typeof body.email === "string" ? body.email : "";
    await requestOperatorLink(req, email);
    // Magic link UX: always return the same success copy.
    return NextResponse.json({ ok: true });
  });
}

