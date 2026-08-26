import { eq } from "drizzle-orm";
import { db } from "./client";
import {
  agentBinding,
  turnConductorPhrase,
} from "./schema";

/**
 * Seed data only — never hard-code agent ids in SPA/runtime.
 * Pass SEED_CURSOR_AGENT_ID via env (see .env.local) when seeding.
 */
const PM_AGENT_ID = process.env.SEED_CURSOR_AGENT_ID ?? "";

/** Founder phrase family from SCP-001 — inserted as rows, not read as SPA constants. */
const PHRASES = [
  "I'm done with this message",
  "I'm done with this",
  "I'm done",
];

async function seed() {
  const existingBindings = await db.select().from(agentBinding).limit(1);
  if (existingBindings.length === 0) {
    await db.insert(agentBinding).values({
      label: "PM",
      cursorAgentId: PM_AGENT_ID,
      runtime: "cloud",
      active: true,
    });
    console.log(
      "Seeded agent_binding (PM).",
      PM_AGENT_ID
        ? "cursor_agent_id from SEED_CURSOR_AGENT_ID."
        : "cursor_agent_id empty — Cursor port stays stand-in until row is updated.",
    );
  } else {
    console.log("agent_binding already has rows — skip insert.");
  }

  const existingPhrases = await db.select().from(turnConductorPhrase).limit(1);
  if (existingPhrases.length === 0) {
    await db.insert(turnConductorPhrase).values(
      PHRASES.map((phrase) => ({ phrase, active: true })),
    );
    console.log(`Seeded ${PHRASES.length} conductor phrases.`);
  } else {
    const active = await db
      .select()
      .from(turnConductorPhrase)
      .where(eq(turnConductorPhrase.active, true));
    console.log(`turn_conductor_phrase already seeded (${active.length} active).`);
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
