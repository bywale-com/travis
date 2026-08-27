/**
 * Apply operator-supplied Cursor agent ids onto agent_binding.
 * Ids come from server env only — never SPA constants.
 */
import { eq } from "drizzle-orm";
import { db } from "./client";
import { agentBinding } from "./schema";

const SEATS = [
  {
    seatKey: "pm" as const,
    label: "PM",
    env:
      process.env.SEED_CURSOR_AGENT_ID_PM?.trim() ||
      process.env.SEED_CURSOR_AGENT_ID?.trim() ||
      "",
  },
  {
    seatKey: "sa" as const,
    label: "SA",
    env: process.env.SEED_CURSOR_AGENT_ID_SA?.trim() || "",
  },
  {
    seatKey: "engineer" as const,
    label: "Engineer",
    env: process.env.SEED_CURSOR_AGENT_ID_ENGINEER?.trim() || "",
  },
];

export async function ensureSeatBindings(): Promise<void> {
  for (const seat of SEATS) {
    const [existing] = await db
      .select()
      .from(agentBinding)
      .where(eq(agentBinding.seatKey, seat.seatKey))
      .limit(1);

    if (!existing) {
      await db.insert(agentBinding).values({
        seatKey: seat.seatKey,
        label: seat.label,
        cursorAgentId: seat.env,
        runtime: "cloud",
        active: true,
      });
      continue;
    }

    if (seat.env && existing.cursorAgentId !== seat.env) {
      await db
        .update(agentBinding)
        .set({ cursorAgentId: seat.env })
        .where(eq(agentBinding.id, existing.id));
    }
  }
}
