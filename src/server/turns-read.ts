import { and, asc, eq, gt, or } from "drizzle-orm";
import { attachmentsForTurns } from "@/server/artifacts";
import { db } from "@/server/db/client";
import { voiceTurn } from "@/server/db/schema";

export type TurnGrain = {
  id: string;
  seq: number;
  role: string;
  kind: string;
  seatKey: string | null;
  referenceTurnId: string | null;
  initiativeId: string | null;
  heardAt: Date | null;
  speakable: boolean;
  thoughtStatus: string | null;
  text: string;
  createdAt: Date;
  attachments: unknown[];
};

export async function turnsAfterSeq(
  sessionId: string,
  afterSeq: number | null,
): Promise<TurnGrain[]> {
  const turns = await db
    .select()
    .from(voiceTurn)
    .where(
      afterSeq != null
        ? and(
            eq(voiceTurn.sessionId, sessionId),
            or(
              gt(voiceTurn.seq, afterSeq),
              eq(voiceTurn.thoughtStatus, "streaming"),
            ),
          )
        : eq(voiceTurn.sessionId, sessionId),
    )
    .orderBy(asc(voiceTurn.seq));
  const hung = await attachmentsForTurns(
    sessionId,
    afterSeq != null ? turns.map((t) => t.id) : undefined,
  );
  return turns.map((t) => ({
    id: t.id,
    seq: t.seq,
    role: t.role,
    kind: t.kind,
    seatKey: t.seatKey,
    referenceTurnId: t.referenceTurnId,
    initiativeId: t.initiativeId,
    heardAt: t.heardAt,
    speakable: t.speakable,
    thoughtStatus: t.thoughtStatus,
    text: t.text,
    createdAt: t.createdAt,
    attachments: hung.get(t.id) ?? [],
  }));
}
