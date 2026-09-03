import { NextResponse } from "next/server";
import { jsonRoute } from "@/server/api-error";
import { listCreateOptions } from "@/server/create-agent";

export async function GET() {
  return jsonRoute(async () => {
    const options = await listCreateOptions();
    return NextResponse.json(options);
  });
}
