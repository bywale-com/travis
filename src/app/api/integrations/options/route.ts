import { NextResponse } from "next/server";
import { jsonRoute } from "@/server/api-error";
import { getIntegrationOptions } from "@/server/create-agent";

/** SCP-011 — typed ModelOption[] + RepoOption[] for I2/I3 pickers. Replaces /api/agents/options. */
export async function GET() {
  return jsonRoute(async () => {
    const options = await getIntegrationOptions();
    return NextResponse.json(options);
  });
}
