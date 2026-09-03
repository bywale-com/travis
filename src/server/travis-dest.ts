import { desc, eq } from "drizzle-orm";
import { travisIsWired } from "@/server/travis-openai";
import { insertStatusTurn } from "@/server/seat-pipe";
import { db } from "@/server/db/client";
import { agentBinding, voiceSession, voiceTurn } from "@/server/db/schema";
import type { SeatKey } from "@/server/db/schema";
import { requireOpenMember } from "@/server/room-membership";

export async function bindingForSeat(seatKey: SeatKey) {
  const [row] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.seatKey, seatKey))
    .limit(1);
  return row ?? null;
}

export async function setActiveBinding(sessionId: string, bindingId: string) {
  await requireOpenMember(sessionId, bindingId);
  await db
    .update(voiceSession)
    .set({ activeBindingId: bindingId, bindingId })
    .where(eq(voiceSession.id, sessionId));
}

export async function noteTravisUnwired(sessionId: string): Promise<void> {
  if (travisIsWired()) return;
  const [last] = await db
    .select({ text: voiceTurn.text, kind: voiceTurn.kind })
    .from(voiceTurn)
    .where(eq(voiceTurn.sessionId, sessionId))
    .orderBy(desc(voiceTurn.seq))
    .limit(1);
  if (last?.kind === "status" && /isn.t wired/i.test(last.text)) return;
  await insertStatusTurn(sessionId, "Travis isn’t wired");
}
