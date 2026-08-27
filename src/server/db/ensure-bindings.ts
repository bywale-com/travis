/**
 * Fill blank agent_binding ids from server env.
 * Never overwrite a live SQL/operator bind — Open session was clobbering
 * PM back to a dead seed id whenever Vercel env lagged the table.
 */
import { eq } from "drizzle-orm";
import { envMayWriteBinding } from "@/lib/seat-binding";
import { db } from "./client";
import { agentBinding } from "./schema";

const SEATS = [
  {
    seatKey: "pm" as const,
    label: "PM",
    // Do not fall back to SEED_CURSOR_AGENT_ID — that alias was the dead
    // seed and froze PM on the wrong chat after fill-blanks-only landed.
    env: process.env.SEED_CURSOR_AGENT_ID_PM?.trim() || "",
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

    if (envMayWriteBinding(existing.cursorAgentId, seat.env)) {
      await db
        .update(agentBinding)
        .set({ cursorAgentId: seat.env })
        .where(eq(agentBinding.id, existing.id));
    }
  }
}
