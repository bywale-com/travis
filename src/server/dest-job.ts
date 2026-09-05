/**
 * SCP-023 — dest is a job. Heartbeat lives on this row.
 * seat_live_run stays the Cursor run. Null ping is quiet, not healthy.
 */
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import {
  destHeartbeatLabel,
  destHeartbeatState,
} from "@/lib/dest-gate";
import { db } from "@/server/db/client";
import {
  agentBinding,
  destJob,
  type AgentBinding,
  type DestJob,
  type DestJobStatus,
} from "@/server/db/schema";

let destJobStoreReady = false;

export async function ensureDestJobStore(): Promise<void> {
  if (destJobStoreReady) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS travis.dest_job (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id uuid NOT NULL REFERENCES travis.voice_session(id),
      binding_id uuid NOT NULL REFERENCES travis.agent_binding(id),
      initiative_id uuid REFERENCES travis.initiative(id),
      user_turn_id uuid REFERENCES travis.voice_turn(id),
      parent_id uuid REFERENCES travis.dest_job(id),
      payload jsonb NOT NULL,
      idempotency_key text NOT NULL,
      timeout_ms int NOT NULL DEFAULT 120000,
      status text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      last_heartbeat_at timestamptz,
      CONSTRAINT dest_job_status_chk
        CHECK (status IN ('created', 'dispatched', 'in_progress', 'completed', 'failed', 'timed_out')),
      CONSTRAINT dest_job_idem_uniq UNIQUE (session_id, idempotency_key)
    )
  `);
  destJobStoreReady = true;
}

export type DestJobPayload = { text: string; done?: string };

function asPayload(raw: unknown): DestJobPayload {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as { text?: unknown; done?: unknown };
    return {
      text: String(o.text ?? ""),
      done: typeof o.done === "string" ? o.done : undefined,
    };
  }
  return { text: "" };
}

export function destIdempotencyKey(params: {
  bindingId: string;
  text: string;
}): string {
  const text = params.text.trim().slice(0, 240);
  return `${params.bindingId}:${text}`;
}

export async function insertDestJob(params: {
  sessionId: string;
  binding: AgentBinding;
  text: string;
  initiativeId?: string | null;
  userTurnId?: string | null;
  status?: DestJobStatus;
}): Promise<DestJob> {
  await ensureDestJobStore();
  const key = destIdempotencyKey({
    bindingId: params.binding.id,
    text: params.text,
  });
  const [existing] = await db
    .select()
    .from(destJob)
    .where(
      and(eq(destJob.sessionId, params.sessionId), eq(destJob.idempotencyKey, key)),
    )
    .limit(1);
  if (existing) return existing;
  const [row] = await db
    .insert(destJob)
    .values({
      sessionId: params.sessionId,
      bindingId: params.binding.id,
      initiativeId: params.initiativeId ?? null,
      userTurnId: params.userTurnId ?? null,
      payload: { text: params.text.trim(), done: "" },
      idempotencyKey: key,
      status: params.status ?? "created",
    })
    .returning();
  if (!row) throw new Error("Could not file the dest job.");
  return row;
}

export async function markDestJob(
  id: string,
  patch: {
    status?: DestJobStatus;
    userTurnId?: string | null;
    heartbeat?: boolean;
    done?: string;
  },
): Promise<DestJob | null> {
  await ensureDestJobStore();
  const [cur] = await db.select().from(destJob).where(eq(destJob.id, id)).limit(1);
  if (!cur) return null;
  const payload = asPayload(cur.payload);
  const [row] = await db
    .update(destJob)
    .set({
      ...(patch.status ? { status: patch.status } : {}),
      ...(patch.userTurnId !== undefined ? { userTurnId: patch.userTurnId } : {}),
      ...(patch.heartbeat ? { lastHeartbeatAt: new Date() } : {}),
      ...(patch.done !== undefined
        ? { payload: { ...payload, done: patch.done } }
        : {}),
    })
    .where(eq(destJob.id, id))
    .returning();
  return row ?? null;
}

const OPEN_DEST = ["created", "dispatched", "in_progress"] as const;

export async function listOpenDestJobs(sessionId: string): Promise<
  Array<{ job: DestJob; binding: AgentBinding }>
> {
  await ensureDestJobStore();
  return db
    .select({ job: destJob, binding: agentBinding })
    .from(destJob)
    .innerJoin(agentBinding, eq(destJob.bindingId, agentBinding.id))
    .where(
      and(eq(destJob.sessionId, sessionId), inArray(destJob.status, [...OPEN_DEST])),
    )
    .orderBy(desc(destJob.createdAt));
}

export async function heartbeatOpenDestJobs(
  sessionId: string,
  liveBindingIds: string[],
): Promise<void> {
  await ensureDestJobStore();
  if (!liveBindingIds.length) return;
  await db
    .update(destJob)
    .set({
      lastHeartbeatAt: new Date(),
      status: "in_progress",
    })
    .where(
      and(
        eq(destJob.sessionId, sessionId),
        inArray(destJob.bindingId, liveBindingIds),
        inArray(destJob.status, ["dispatched", "in_progress"]),
      ),
    );
}

export async function finishDestJobsForBinding(params: {
  sessionId: string;
  binding: AgentBinding;
  status: "completed" | "failed" | "timed_out";
  done: string;
}): Promise<void> {
  await ensureDestJobStore();
  const open = await db
    .select()
    .from(destJob)
    .where(
      and(
        eq(destJob.sessionId, params.sessionId),
        eq(destJob.bindingId, params.binding.id),
        inArray(destJob.status, ["dispatched", "in_progress"]),
      ),
    );
  for (const job of open) {
    const payload = asPayload(job.payload);
    await db
      .update(destJob)
      .set({
        status: params.status,
        payload: { ...payload, done: params.done },
      })
      .where(eq(destJob.id, job.id));
    const label = params.binding.label || "That seat";
    const line =
      params.status === "completed"
        ? `${label} finished.`
        : params.status === "timed_out"
          ? `${label} timed out.`
          : `${label} failed.`;
    const { insertAgentPostTurn } = await import("./seat-pipe");
    await insertAgentPostTurn(params.sessionId, line, "travis").catch(() => {});
  }
}

export async function timeOutStaleDestJobs(sessionId: string): Promise<void> {
  await ensureDestJobStore();
  const open = await db
    .select({ job: destJob, binding: agentBinding })
    .from(destJob)
    .innerJoin(agentBinding, eq(destJob.bindingId, agentBinding.id))
    .where(
      and(eq(destJob.sessionId, sessionId), inArray(destJob.status, [...OPEN_DEST])),
    );
  const now = Date.now();
  for (const { job, binding } of open) {
    const started = job.createdAt.getTime();
    if (now - started < job.timeoutMs) continue;
    await finishDestJobsForBinding({
      sessionId,
      binding,
      status: "timed_out",
      done: "timed out",
    });
  }
}

export type DestInFlightRow = {
  jobId: string;
  seatKey: string;
  label: string;
  text: string;
  receipt: string;
  heartbeat: "quiet" | "live" | "stale";
  heartbeatLabel: string;
  status: string;
};

export function toInFlightRow(
  job: DestJob,
  binding: AgentBinding,
  nowMs = Date.now(),
): DestInFlightRow {
  const payload = asPayload(job.payload);
  return {
    jobId: job.id,
    seatKey: binding.seatKey,
    label: binding.label,
    text: payload.text,
    receipt: payload.done ?? "",
    heartbeat: destHeartbeatState(job.lastHeartbeatAt, nowMs),
    heartbeatLabel: destHeartbeatLabel(job.lastHeartbeatAt, nowMs),
    status: job.status,
  };
}
