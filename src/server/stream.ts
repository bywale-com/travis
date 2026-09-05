/**
 * SCP-024 — Stream store. Live grain is rows. The Log tape stays completed.
 * SCP-025 — Travis close hangs on this trigger’s answering post, not session-latest.
 * Founder lands the table. ensure-once + migrate + Drizzle.
 */
import { and, asc, desc, eq, gt, inArray, sql } from "drizzle-orm";
import {
  decideTravisStreamClose,
  lastEventOfKind,
  nextStreamMessage,
  pickAnsweringPost,
  pickFoundingFallbackPost,
  processEventValues,
  processFloorAt,
  streamShowsCard,
  type StreamEventGrain,
  type StreamGrain,
  type StreamStatus,
} from "@/lib/stream";
import { isTravisSeat } from "@/lib/seats";
import { db } from "@/server/db/client";
import {
  agentBinding,
  motion,
  motionStep,
  stream,
  streamEvent,
  voiceTurn,
  type AgentBinding,
} from "@/server/db/schema";

let streamStoreReady = false;

export async function ensureStreamStore(): Promise<void> {
  if (streamStoreReady) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS travis.stream (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id uuid NOT NULL REFERENCES travis.voice_session(id),
      binding_id uuid NOT NULL REFERENCES travis.agent_binding(id),
      trigger_turn_id uuid NOT NULL REFERENCES travis.voice_turn(id),
      close_turn_id uuid REFERENCES travis.voice_turn(id),
      dest_job_id uuid REFERENCES travis.dest_job(id),
      motion_id uuid REFERENCES travis.motion(id),
      cursor_run_id text NOT NULL DEFAULT '',
      status text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      closed_at timestamptz,
      CONSTRAINT stream_status_chk
        CHECK (status IN ('live', 'completed', 'failed'))
    )
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS stream_live_one
      ON travis.stream (session_id, binding_id)
      WHERE status = 'live'
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS travis.stream_event (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      stream_id uuid NOT NULL REFERENCES travis.stream(id),
      seq int NOT NULL,
      kind text NOT NULL,
      body text NOT NULL DEFAULT '',
      tool text NOT NULL DEFAULT '',
      created_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT stream_event_kind_chk
        CHECK (kind IN ('message', 'process', 'thought')),
      CONSTRAINT stream_event_seq_uniq UNIQUE (stream_id, seq)
    )
  `);
  await backfillWalkStreamClose();
  streamStoreReady = true;
}

/** SCP-025 — named walk row only. Idempotent. Do not scan every stream. */
async function backfillWalkStreamClose(): Promise<void> {
  await db.execute(sql`
    UPDATE travis.stream AS s
    SET
      close_turn_id = t.id,
      status = 'completed',
      closed_at = COALESCE(s.closed_at, now())
    FROM travis.voice_turn AS t
    WHERE t.session_id = '0e8875f8-283b-4dae-bf54-76c82a05b6ef'
      AND t.seq = 747
      AND t.kind = 'agent_post'
      AND t.seat_key = 'travis'
      AND s.session_id = t.session_id
      AND s.id::text LIKE '643e3e50-%'
  `);
  await db.execute(sql`
    INSERT INTO travis.stream_event (stream_id, seq, kind, body, tool)
    SELECT
      s.id,
      COALESCE(
        (SELECT MAX(e.seq) FROM travis.stream_event AS e WHERE e.stream_id = s.id),
        0
      ) + 1,
      'message',
      t.text,
      ''
    FROM travis.stream AS s
    JOIN travis.voice_turn AS t
      ON t.session_id = s.session_id
     AND t.seq = 747
     AND t.kind = 'agent_post'
     AND t.seat_key = 'travis'
    WHERE s.id::text LIKE '643e3e50-%'
      AND NOT EXISTS (
        SELECT 1
        FROM travis.stream_event AS e
        WHERE e.stream_id = s.id
          AND e.kind = 'message'
      )
  `);
}

async function latestUserTrigger(sessionId: string) {
  const [row] = await db
    .select()
    .from(voiceTurn)
    .where(and(eq(voiceTurn.sessionId, sessionId), eq(voiceTurn.kind, "user")))
    .orderBy(desc(voiceTurn.seq))
    .limit(1);
  return row ?? null;
}

export async function liveStreamForBinding(
  sessionId: string,
  bindingId: string,
) {
  await ensureStreamStore();
  const [row] = await db
    .select()
    .from(stream)
    .where(
      and(
        eq(stream.sessionId, sessionId),
        eq(stream.bindingId, bindingId),
        eq(stream.status, "live"),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function openStream(params: {
  sessionId: string;
  binding: AgentBinding;
  triggerTurnId?: string | null;
  destJobId?: string | null;
  motionId?: string | null;
  cursorRunId?: string;
}): Promise<{ id: string } | null> {
  await ensureStreamStore();
  const existing = await liveStreamForBinding(
    params.sessionId,
    params.binding.id,
  );
  if (existing) {
    if (params.motionId && !existing.motionId) {
      await db
        .update(stream)
        .set({ motionId: params.motionId })
        .where(eq(stream.id, existing.id));
    }
    if (params.destJobId && !existing.destJobId) {
      await db
        .update(stream)
        .set({ destJobId: params.destJobId })
        .where(eq(stream.id, existing.id));
    }
    if (params.cursorRunId) {
      await db
        .update(stream)
        .set({ cursorRunId: params.cursorRunId })
        .where(eq(stream.id, existing.id));
    }
    return { id: existing.id };
  }

  let triggerId = params.triggerTurnId ?? null;
  if (triggerId) {
    const [turn] = await db
      .select({ id: voiceTurn.id, kind: voiceTurn.kind })
      .from(voiceTurn)
      .where(eq(voiceTurn.id, triggerId))
      .limit(1);
    if (!turn || turn.kind !== "user") triggerId = null;
  }
  if (!triggerId) {
    const latest = await latestUserTrigger(params.sessionId);
    triggerId = latest?.id ?? null;
  }
  if (!triggerId) return null;

  try {
    const [row] = await db
      .insert(stream)
      .values({
        sessionId: params.sessionId,
        bindingId: params.binding.id,
        triggerTurnId: triggerId,
        destJobId: params.destJobId ?? null,
        motionId: params.motionId ?? null,
        cursorRunId: params.cursorRunId ?? "",
        status: "live",
      })
      .returning({ id: stream.id });
    return row ?? null;
  } catch {
    const again = await liveStreamForBinding(
      params.sessionId,
      params.binding.id,
    );
    return again ? { id: again.id } : null;
  }
}

async function nextSeq(streamId: string): Promise<number> {
  const [last] = await db
    .select({ seq: streamEvent.seq })
    .from(streamEvent)
    .where(eq(streamEvent.streamId, streamId))
    .orderBy(desc(streamEvent.seq))
    .limit(1);
  return (last?.seq ?? 0) + 1;
}

async function eventsFor(streamId: string) {
  return db
    .select()
    .from(streamEvent)
    .where(eq(streamEvent.streamId, streamId))
    .orderBy(asc(streamEvent.seq));
}

function asGrain(row: typeof streamEvent.$inferSelect): StreamEventGrain {
  return {
    id: row.id,
    seq: row.seq,
    kind: row.kind as StreamEventGrain["kind"],
    body: row.body,
    tool: row.tool,
  };
}

export async function writeStreamMessage(params: {
  streamId: string;
  text: string;
  closer: "dest" | "travis";
}): Promise<StreamEventGrain | null> {
  await ensureStreamStore();
  const incoming = params.text.trim();
  if (!incoming) return null;
  const rows = await eventsFor(params.streamId);
  const last = lastEventOfKind(rows.map(asGrain), "message");
  const next = nextStreamMessage(last, incoming, params.closer);
  if (next.mode === "update" && last) {
    const [row] = await db
      .update(streamEvent)
      .set({ body: next.text })
      .where(eq(streamEvent.id, last.id))
      .returning();
    return row ? asGrain(row) : last;
  }
  const seq = await nextSeq(params.streamId);
  const [row] = await db
    .insert(streamEvent)
    .values({
      streamId: params.streamId,
      seq,
      kind: "message",
      body: next.text,
      tool: "",
    })
    .returning();
  return row ? asGrain(row) : null;
}

export async function writeStreamThought(params: {
  streamId: string;
  text: string;
}): Promise<StreamEventGrain | null> {
  await ensureStreamStore();
  const incoming = params.text.trim();
  if (!incoming) return null;
  const rows = await eventsFor(params.streamId);
  const last = lastEventOfKind(rows.map(asGrain), "thought");
  if (last) {
    const [row] = await db
      .update(streamEvent)
      .set({ body: incoming })
      .where(eq(streamEvent.id, last.id))
      .returning();
    return row ? asGrain(row) : last;
  }
  const seq = await nextSeq(params.streamId);
  const [row] = await db
    .insert(streamEvent)
    .values({
      streamId: params.streamId,
      seq,
      kind: "thought",
      body: incoming,
      tool: "",
    })
    .returning();
  return row ? asGrain(row) : null;
}

export async function startStreamProcess(params: {
  streamId: string;
  tool: string;
  body?: string;
}): Promise<StreamEventGrain | null> {
  await ensureStreamStore();
  const values = processEventValues({
    tool: params.tool,
    body: params.body ?? "",
  });
  if (!values) return null;
  const seq = await nextSeq(params.streamId);
  const [row] = await db
    .insert(streamEvent)
    .values({
      streamId: params.streamId,
      seq,
      kind: "process",
      body: values.body,
      tool: values.tool,
    })
    .returning();
  return row ? asGrain(row) : null;
}

export async function finishStreamProcess(params: {
  eventId: string;
  body: string;
}): Promise<void> {
  await ensureStreamStore();
  await db
    .update(streamEvent)
    .set({ body: params.body })
    .where(eq(streamEvent.id, params.eventId));
}

export async function messageBodies(streamId: string): Promise<string[]> {
  await ensureStreamStore();
  const rows = await db
    .select()
    .from(streamEvent)
    .where(
      and(eq(streamEvent.streamId, streamId), eq(streamEvent.kind, "message")),
    )
    .orderBy(asc(streamEvent.seq));
  return rows.map((r) => r.body).filter((b) => b.trim());
}

export async function closeStream(params: {
  streamId: string;
  status: "completed" | "failed";
  closeTurnId?: string | null;
}): Promise<void> {
  await ensureStreamStore();
  await db
    .update(stream)
    .set({
      status: params.status,
      closeTurnId: params.closeTurnId ?? null,
      closedAt: new Date(),
    })
    .where(and(eq(stream.id, params.streamId), eq(stream.status, "live")));
}

export async function failLiveStreamWithoutCard(params: {
  sessionId: string;
  bindingId: string;
}): Promise<void> {
  const live = await liveStreamForBinding(params.sessionId, params.bindingId);
  if (!live) return;
  await closeStream({ streamId: live.id, status: "failed", closeTurnId: null });
}

export async function setStreamCursorRun(
  streamId: string,
  cursorRunId: string,
): Promise<void> {
  await ensureStreamStore();
  await db
    .update(stream)
    .set({ cursorRunId })
    .where(eq(stream.id, streamId));
}

export async function attachMotionToLiveStream(params: {
  sessionId: string;
  bindingId: string;
  motionId: string;
}): Promise<void> {
  const live = await liveStreamForBinding(params.sessionId, params.bindingId);
  if (!live || live.motionId) return;
  await db
    .update(stream)
    .set({ motionId: params.motionId })
    .where(eq(stream.id, live.id));
}

export async function travisBinding(): Promise<AgentBinding | null> {
  const [row] = await db
    .select()
    .from(agentBinding)
    .where(eq(agentBinding.seatKey, "travis"))
    .limit(1);
  return row ?? null;
}

export async function openTravisStream(params: {
  sessionId: string;
  motionId?: string | null;
}): Promise<{ id: string; binding: AgentBinding } | null> {
  const binding = await travisBinding();
  if (!binding) return null;
  const opened = await openStream({
    sessionId: params.sessionId,
    binding,
    motionId: params.motionId,
  });
  if (!opened) return null;
  return { id: opened.id, binding };
}

export async function travisLaborStillOpen(sessionId: string): Promise<boolean> {
  await ensureStreamStore();
  const open = await db
    .select({ id: motion.id })
    .from(motion)
    .where(
      and(
        eq(motion.sessionId, sessionId),
        inArray(motion.status, ["waiting", "running"]),
      ),
    )
    .limit(1);
  if (open.length) return true;
  const running = await db
    .select({ id: motionStep.id })
    .from(motionStep)
    .innerJoin(motion, eq(motionStep.motionId, motion.id))
    .where(
      and(
        eq(motion.sessionId, sessionId),
        inArray(motionStep.status, ["pending", "running"]),
      ),
    )
    .limit(1);
  return running.length > 0;
}

export async function maybeCloseTravisStream(params: {
  sessionId: string;
  failed?: boolean;
  foundingFallback?: boolean;
}): Promise<void> {
  const binding = await travisBinding();
  if (!binding) return;
  if (await travisLaborStillOpen(params.sessionId)) return;
  const live = await liveStreamForBinding(params.sessionId, binding.id);
  if (!live) return;

  const [trigger] = await db
    .select({ seq: voiceTurn.seq })
    .from(voiceTurn)
    .where(eq(voiceTurn.id, live.triggerTurnId))
    .limit(1);

  const [lastProcess] = await db
    .select({ createdAt: streamEvent.createdAt })
    .from(streamEvent)
    .where(
      and(eq(streamEvent.streamId, live.id), eq(streamEvent.kind, "process")),
    )
    .orderBy(desc(streamEvent.createdAt))
    .limit(1);
  const processFloor = processFloorAt(lastProcess?.createdAt, live.createdAt);

  const afterTrigger = trigger
    ? await db
        .select({
          id: voiceTurn.id,
          seq: voiceTurn.seq,
          createdAt: voiceTurn.createdAt,
        })
        .from(voiceTurn)
        .where(
          and(
            eq(voiceTurn.sessionId, params.sessionId),
            eq(voiceTurn.kind, "agent_post"),
            eq(voiceTurn.seatKey, "travis"),
            eq(voiceTurn.speakable, true),
            gt(voiceTurn.seq, trigger.seq),
          ),
        )
        .orderBy(desc(voiceTurn.seq))
    : [];

  const answering = pickAnsweringPost(
    afterTrigger,
    trigger?.seq ?? -1,
    processFloor,
  );
  const founding = pickFoundingFallbackPost(
    afterTrigger,
    trigger?.seq ?? -1,
  );
  const decision = decideTravisStreamClose({
    laborOpen: false,
    failed: params.failed,
    foundingFallback: params.foundingFallback,
    answeringPostId: answering?.id ?? null,
    foundingFallbackPostId: founding?.id ?? null,
  });

  if (decision.action === "stay") return;
  if (decision.action === "fail-without-card") {
    await closeStream({
      streamId: live.id,
      status: "failed",
      closeTurnId: null,
    });
    return;
  }
  await closeStream({
    streamId: live.id,
    status: "completed",
    closeTurnId: decision.closeTurnId,
  });
}

async function toDto(
  row: typeof stream.$inferSelect,
  seatKey: string | null,
  triggerText: string,
  events: StreamEventGrain[],
): Promise<StreamGrain> {
  return {
    id: row.id,
    bindingId: row.bindingId,
    seatKey,
    triggerTurnId: row.triggerTurnId,
    triggerText,
    closeTurnId: row.closeTurnId,
    destJobId: row.destJobId,
    motionId: row.motionId,
    cursorRunId: row.cursorRunId,
    status: row.status as StreamStatus,
    events,
  };
}

export async function listSessionStreams(sessionId: string): Promise<{
  live: StreamGrain[];
  cards: StreamGrain[];
}> {
  await ensureStreamStore();
  const rows = await db
    .select({
      stream: stream,
      seatKey: agentBinding.seatKey,
      triggerText: voiceTurn.text,
    })
    .from(stream)
    .innerJoin(agentBinding, eq(stream.bindingId, agentBinding.id))
    .innerJoin(voiceTurn, eq(stream.triggerTurnId, voiceTurn.id))
    .where(eq(stream.sessionId, sessionId))
    .orderBy(asc(stream.createdAt));

  const live: StreamGrain[] = [];
  const cards: StreamGrain[] = [];
  for (const row of rows) {
    const events = (await eventsFor(row.stream.id)).map(asGrain);
    const dto = await toDto(
      row.stream,
      row.seatKey,
      row.triggerText,
      events,
    );
    if (dto.status === "live") live.push(dto);
    else if (streamShowsCard(dto)) cards.push(dto);
  }
  return { live, cards };
}

export function isTravisBinding(binding: AgentBinding): boolean {
  return isTravisSeat(binding.seatKey);
}
