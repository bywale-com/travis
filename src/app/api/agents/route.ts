import { NextResponse } from "next/server";
import { jsonRoute } from "@/server/api-error";
import { createAgentBinding } from "@/server/create-agent";

type Body = {
  label?: string;
  model?: string;
  repository?: string;
  ref?: string;
};

export async function POST(req: Request) {
  return jsonRoute(async () => {
    const body = (await req.json().catch(() => ({}))) as Body;
    try {
      const agent = await createAgentBinding({
        label: String(body.label ?? ""),
        model: body.model ? String(body.model) : undefined,
        repository: body.repository ? String(body.repository) : undefined,
        ref: body.ref ? String(body.ref) : undefined,
      });
      return NextResponse.json({ agent });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : String(err) },
        { status: 400 },
      );
    }
  });
}
