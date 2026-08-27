import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { ensureSeatBindings } from "@/server/db/ensure-bindings";
import { agentBinding } from "@/server/db/schema";

const SEAT_ORDER = ["pm", "sa", "engineer"] as const;

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

  rows.sort((a, b) => {
    const ia = SEAT_ORDER.indexOf(a.seatKey as (typeof SEAT_ORDER)[number]);
    const ib = SEAT_ORDER.indexOf(b.seatKey as (typeof SEAT_ORDER)[number]);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  return NextResponse.json({ seats: rows });
}
