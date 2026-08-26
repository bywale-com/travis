import { eq } from "drizzle-orm";
import { db } from "./client";
import { agentBinding, turnConductorPhrase } from "./schema";

const PM_AGENT_ID = process.env.SEED_CURSOR_AGENT_ID ?? "";

const PHRASES = [
  "I'm done with this message",
  "I'm done with this",
  "I'm done",
];

const SEATS = [
  { seatKey: "pm", label: "PM", cursorAgentId: PM_AGENT_ID },
  { seatKey: "sa", label: "SA", cursorAgentId: "" },
  { seatKey: "engineer", label: "Engineer", cursorAgentId: "" },
] as const;

async function seed() {
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
        cursorAgentId: seat.cursorAgentId,
        runtime: "cloud",
        active: true,
      });
      console.log(`Seeded agent_binding (${seat.label}).`);
    } else if (seat.seatKey === "pm" && PM_AGENT_ID && !existing.cursorAgentId) {
      await db
        .update(agentBinding)
        .set({ cursorAgentId: PM_AGENT_ID })
        .where(eq(agentBinding.id, existing.id));
      console.log("Updated PM cursor_agent_id from SEED_CURSOR_AGENT_ID.");
    }
  }

  const existingPhrases = await db.select().from(turnConductorPhrase).limit(1);
  if (existingPhrases.length === 0) {
    await db.insert(turnConductorPhrase).values(
      PHRASES.map((phrase) => ({ phrase, active: true })),
    );
    console.log(`Seeded ${PHRASES.length} conductor phrases.`);
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
