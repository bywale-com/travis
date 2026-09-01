import { and, asc, desc, eq } from "drizzle-orm";
import {
  groupQueueSeats,
  type QueueSnapshot,
} from "@/lib/queue-logic";
import { db } from "@/server/db/client";
import {
  agentBinding,
  queuedUtterance,
  seatLiveRun,
  type AgentBinding,
  type QueuedUtterance,
  type SeatLiveRun,
} from "@/server/db/schema";

export async function getLiveRun(
  bindingId: string,
): Promise<SeatLiveRun | null> {
  const [row] = await db
    .select()
    .from(seatLiveRun)
    .where(eq(seatLiveRun.bindingId, bindingId))
    .limit(1);
  return row ?? null;
}

export async function upsertLiveRun(params: {
  bindingId: string;
  sessionId: string;
  cursorRunId: string;
  userTurnId?: string | null;
}): Promise<void> {
  await db
    .insert(seatLiveRun)
    .values({
      bindingId: params.bindingId,
      sessionId: params.sessionId,
      cursorRunId: params.cursorRunId,
      userTurnId: params.userTurnId ?? null,
      startedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: seatLiveRun.bindingId,
      set: {
        sessionId: params.sessionId,
        cursorRunId: params.cursorRunId,
        userTurnId: params.userTurnId ?? null,
        startedAt: new Date(),
      },
    });
}

/** Delete only if this stream still owns the run. True → caller may drain. */
export async function releaseLiveRunIfMatch(
  bindingId: string,
  cursorRunId: string,
): Promise<boolean> {
  const deleted = await db
    .delete(seatLiveRun)
    .where(
      and(
        eq(seatLiveRun.bindingId, bindingId),
        eq(seatLiveRun.cursorRunId, cursorRunId),
      ),
    )
    .returning({ bindingId: seatLiveRun.bindingId });
  return deleted.length > 0;
}

/** Barge claims the live-run row so the original stream will not drain. */
export async function claimLiveRun(
  bindingId: string,
): Promise<SeatLiveRun | null> {
  const [row] = await db
    .delete(seatLiveRun)
    .where(eq(seatLiveRun.bindingId, bindingId))
    .returning();
  return row ?? null;
}

async function nextQueueSeq(
  sessionId: string,
  bindingId: string,
): Promise<number> {
  const [last] = await db
    .select({ seq: queuedUtterance.seq })
    .from(queuedUtterance)
    .where(
      and(
        eq(queuedUtterance.sessionId, sessionId),
        eq(queuedUtterance.bindingId, bindingId),
      ),
    )
    .orderBy(desc(queuedUtterance.seq))
    .limit(1);
  return (last?.seq ?? 0) + 1;
}

export async function enqueueUtterance(params: {
  sessionId: string;
  binding: AgentBinding;
  text: string;
}): Promise<QueuedUtterance> {
  const seq = await nextQueueSeq(params.sessionId, params.binding.id);
  const [row] = await db
    .insert(queuedUtterance)
    .values({
      sessionId: params.sessionId,
      bindingId: params.binding.id,
      seatKey: params.binding.seatKey ?? "pm",
      seq,
      text: params.text,
    })
    .returning();
  return row;
}

export async function deleteQueuedItem(
  sessionId: string,
  itemId: string,
): Promise<QueuedUtterance | null> {
  const [row] = await db
    .delete(queuedUtterance)
    .where(
      and(
        eq(queuedUtterance.id, itemId),
        eq(queuedUtterance.sessionId, sessionId),
      ),
    )
    .returning();
  return row ?? null;
}

export async function getQueuedItem(
  sessionId: string,
  itemId: string,
): Promise<QueuedUtterance | null> {
  const [row] = await db
    .select()
    .from(queuedUtterance)
    .where(
      and(
        eq(queuedUtterance.id, itemId),
        eq(queuedUtterance.sessionId, sessionId),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function getQueueHead(
  sessionId: string,
  bindingId: string,
): Promise<QueuedUtterance | null> {
  const [row] = await db
    .select()
    .from(queuedUtterance)
    .where(
      and(
        eq(queuedUtterance.sessionId, sessionId),
        eq(queuedUtterance.bindingId, bindingId),
      ),
    )
    .orderBy(asc(queuedUtterance.seq))
    .limit(1);
  return row ?? null;
}

/** Distinct addressees that still have waiting lines in this session. */
export async function bindingsWithQueuedItems(
  sessionId: string,
): Promise<AgentBinding[]> {
  const rows = await db
    .select({
      binding: agentBinding,
    })
    .from(queuedUtterance)
    .innerJoin(agentBinding, eq(queuedUtterance.bindingId, agentBinding.id))
    .where(eq(queuedUtterance.sessionId, sessionId))
    .orderBy(asc(queuedUtterance.seq));
  const seen = new Set<string>();
  const out: AgentBinding[] = [];
  for (const row of rows) {
    if (seen.has(row.binding.id)) continue;
    seen.add(row.binding.id);
    out.push(row.binding);
  }
  return out;
}

export async function queueSnapshot(
  sessionId: string,
): Promise<QueueSnapshot> {
  const rows = await db
    .select({
      id: queuedUtterance.id,
      seatKey: queuedUtterance.seatKey,
      seq: queuedUtterance.seq,
      text: queuedUtterance.text,
      createdAt: queuedUtterance.createdAt,
      label: agentBinding.label,
    })
    .from(queuedUtterance)
    .innerJoin(agentBinding, eq(queuedUtterance.bindingId, agentBinding.id))
    .where(eq(queuedUtterance.sessionId, sessionId))
    .orderBy(asc(queuedUtterance.seq));

  const labels: Record<string, string> = {};
  for (const row of rows) {
    if (row.seatKey && row.label) labels[row.seatKey] = row.label;
  }
  return groupQueueSeats(rows, labels);
}
