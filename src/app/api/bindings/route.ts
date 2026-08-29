import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { ensureSeatBindings } from "@/server/db/ensure-bindings";
import { agentBinding } from "@/server/db/schema";

import { sortRoomSeats } from "@/lib/seats";

/** Room seats by title only — never cursor_agent_id. */
export async function GET() {
  await ensureSeatBindings();
  const rows = await db
    .select({
      seatKey: agentBinding.seatKey,
      label: agentBinding.label,
    })
    .from(agentBinding)
    .where(eq(agentBinding.active, true));

  const ordered = sortRoomSeats(rows);

  return NextResponse.json({ seats: ordered });
}
