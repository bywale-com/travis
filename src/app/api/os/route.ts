import { NextResponse } from "next/server";
import { jsonRoute } from "@/server/api-error";
import { requireOperator } from "@/server/operator";
import { OsHouseError, getOs, writeOs } from "@/server/os-house";

type PutBody = { path?: string; body?: string };

export async function GET(req: Request) {
  return jsonRoute(async () => {
    await requireOperator(req);
    const path = new URL(req.url).searchParams.get("path") ?? "/";
    try {
      return NextResponse.json(await getOs(path));
    } catch (err) {
      if (err instanceof OsHouseError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }
  });
}

export async function PUT(req: Request) {
  return jsonRoute(async () => {
    await requireOperator(req);
    const body = (await req.json().catch(() => ({}))) as PutBody;
    try {
      const filed = await writeOs({
        path: typeof body.path === "string" ? body.path : "",
        body: body.body,
        writerBindingId: null,
      });
      return NextResponse.json(filed);
    } catch (err) {
      if (err instanceof OsHouseError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }
  });
}
