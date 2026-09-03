import { NextResponse } from "next/server";
import { jsonRoute } from "@/server/api-error";
import { getIntegrationStatus } from "@/server/create-agent";

/** SCP-011 — I1 + I5 data. No client secrets. */
export async function GET() {
  return jsonRoute(async () => {
    const status = await getIntegrationStatus();
    return NextResponse.json(status);
  });
}
