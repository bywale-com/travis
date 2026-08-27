import { db } from "./client";
import { turnConductorPhrase } from "./schema";
import { ensureSeatBindings } from "./ensure-bindings";

const PHRASES = [
  "I'm done with this message",
  "I'm done with this",
  "I'm done talking",
  "I'm done",
];

async function seed() {
  await ensureSeatBindings();

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
