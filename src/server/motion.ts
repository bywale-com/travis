/**
 * SCP-013 — Travis process store + dumb runner.
 * Sibling of initiative. No seat send. No product cap.
 */
import { and, asc, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { clipInitiativeTitle } from "@/lib/initiative-title";
import {
  formatFiledPlan,
  formatMotionList,
  isAutoFileableTool,
  isMotionStepAllowed,
  isMotionStepRefused,
  motionStepN,
  motionUnder,
  parseBacklogView,
  STALE_RUNNING_MS,
  type BacklogView,
  type MotionCard,
  type MotionCardStep,
  type MotionListItem,
  type MotionStatus,
} from "@/lib/motion";
import {
  formatInitiativeList,
  listInitiatives,
  type InitiativeListItem,
  type ListInitiativesOpts,
} from "@/server/initiative";
import { db } from "@/server/db/client";
import { motion, motionStep, voiceTurn } from "@/server/db/schema";

export class MotionError extends Error {
  constructor(
    message: string,
    public status: 400 | 404,
  ) {
    super(message);
    this.name = "MotionError";
  }
}

let motionStoreReady = false;

export async function ensureMotionStore(): Promise<void> {
  if (motionStoreReady) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS travis.motion (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id uuid NOT NULL REFERENCES travis.voice_session(id),
      title text NOT NULL,
      status text NOT NULL,
      founding_turn_id uuid REFERENCES travis.voice_turn(id),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      done_at timestamptz,
      CONSTRAINT motion_status_chk
        CHECK (status IN ('waiting', 'running', 'done', 'failed'))
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS motion_open_by_session
      ON travis.motion (session_id)
      WHERE status IN ('waiting', 'running', 'failed')
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS travis.motion_step (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      motion_id uuid NOT NULL REFERENCES travis.motion(id),
      seq int NOT NULL,
      tool text NOT NULL,
      args text NOT NULL,
      status text NOT NULL,
      result_text text NOT NULL DEFAULT '',
      started_at timestamptz,
      done_at timestamptz,
      CONSTRAINT motion_step_status_chk
        CHECK (status IN ('pending', 'running', 'done', 'failed')),
      CONSTRAINT motion_step_seq_uniq UNIQUE (motion_id, seq)
    )
  `);
  motionStoreReady = true;
}

export type FiledPlan = {
  id: string;
  title: string;
  stepCount: number;
};

export type FilePlanStep = {
  tool: string;
  args?: Record<string, unknown>;
};

function parsePlanSteps(raw: unknown): FilePlanStep[] {
  if (!Array.isArray(raw) || raw.length < 1) {
    throw new MotionError("Need at least one step.", 400);
  }
  const steps: FilePlanStep[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      throw new MotionError("Each step needs a tool.", 400);
    }
    const tool = String((row as { tool?: unknown }).tool ?? "").trim();
    if (!tool) throw new MotionError("Each step needs a tool.", 400);
    if (isMotionStepRefused(tool) || !isMotionStepAllowed(tool)) {
      throw new MotionError(
        `${tool} cannot be a motion step. Seat work stays a ticket. A process has no one's input.`,
        400,
      );
    }
    const argsRaw = (row as { args?: unknown }).args;
    const args =
      argsRaw && typeof argsRaw === "object" && !Array.isArray(argsRaw)
        ? (argsRaw as Record<string, unknown>)
        : {};
    steps.push({ tool, args });
  }
  return steps;
}

async function latestUserTurn(sessionId: string) {
  const [row] = await db
    .select()
    .from(voiceTurn)
    .where(and(eq(voiceTurn.sessionId, sessionId), eq(voiceTurn.kind, "user")))
    .orderBy(desc(voiceTurn.createdAt))
    .limit(1);
  return row ?? null;
}

/** Card hangs on his spoken line, not the founder request. */
export async function latestTravisFoundingTurn(sessionId: string) {
  const [row] = await db
    .select()
    .from(voiceTurn)
    .where(
      and(
        eq(voiceTurn.sessionId, sessionId),
        eq(voiceTurn.kind, "agent_post"),
        eq(voiceTurn.seatKey, "travis"),
        eq(voiceTurn.speakable, true),
      ),
    )
    .orderBy(desc(voiceTurn.seq))
    .limit(1);
  return row ?? null;
}

export async function filePlan(
  sessionId: string,
  params: { title?: string; steps: unknown },
): Promise<FiledPlan> {
  await ensureMotionStore();
  const steps = parsePlanSteps(params.steps);
  const founding = await latestTravisFoundingTurn(sessionId);
  const clipFrom = founding ?? (await latestUserTurn(sessionId));
  const given = typeof params.title === "string" ? params.title.trim() : "";
  const title = given || clipInitiativeTitle(clipFrom?.text ?? "");
  if (!title) {
    throw new MotionError("Need a title or a user line to clip.", 400);
  }

  const [row] = await db
    .insert(motion)
    .values({
      sessionId,
      title,
      status: "waiting",
      foundingTurnId: founding?.id ?? null,
    })
    .returning();
  if (!row) throw new MotionError("Could not file the plan.", 400);

  await db.insert(motionStep).values(
    steps.map((step, i) => ({
      motionId: row.id,
      seq: i + 1,
      tool: step.tool,
      args: JSON.stringify(step.args ?? {}),
      status: "pending",
    })),
  );

  const filed = { id: row.id, title: row.title, stepCount: steps.length };
  void runMotionRunner(sessionId);
  return filed;
}

/**
 * In-turn nobody-work that never called file_plan. One step on his last
 * spoken line. unfold_repo may hang here; it stays off the planned allowlist.
 */
export async function autoFileOneStep(
  sessionId: string,
  params: {
    tool: string;
    args?: Record<string, unknown>;
  },
): Promise<FiledPlan | null> {
  await ensureMotionStore();
  if (!isAutoFileableTool(params.tool)) return null;
  const founding = await latestTravisFoundingTurn(sessionId);
  const clipFrom = founding ?? (await latestUserTurn(sessionId));
  const title = clipInitiativeTitle(clipFrom?.text ?? "") || humanTitle(params.tool);
  const [row] = await db
    .insert(motion)
    .values({
      sessionId,
      title,
      status: "waiting",
      foundingTurnId: founding?.id ?? null,
    })
    .returning();
  if (!row) return null;
  await db.insert(motionStep).values({
    motionId: row.id,
    seq: 1,
    tool: params.tool,
    args: JSON.stringify(params.args ?? {}),
    status: "pending",
  });
  void runMotionRunner(sessionId);
  return { id: row.id, title: row.title, stepCount: 1 };
}

function humanTitle(tool: string): string {
  return tool.replace(/_/g, " ");
}

export async function hangOrphanMotionsOn(
  sessionId: string,
  foundingTurnId: string,
): Promise<void> {
  await ensureMotionStore();
  await db
    .update(motion)
    .set({ foundingTurnId })
    .where(and(eq(motion.sessionId, sessionId), isNull(motion.foundingTurnId)));
}

export async function listMotionCards(sessionId: string): Promise<MotionCard[]> {
  await ensureMotionStore();
  const rows = await db
    .select()
    .from(motion)
    .where(eq(motion.sessionId, sessionId))
    .orderBy(desc(motion.updatedAt));
  if (!rows.length) return [];
  const stepRows = await db
    .select()
    .from(motionStep)
    .where(
      inArray(
        motionStep.motionId,
        rows.map((r) => r.id),
      ),
    );
  const byId = new Map<string, MotionCardStep[]>();
  for (const step of stepRows) {
    let args: Record<string, unknown> = {};
    try {
      const parsed = JSON.parse(step.args || "{}") as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        args = parsed as Record<string, unknown>;
      }
    } catch {
      args = {};
    }
    const list = byId.get(step.motionId) ?? [];
    list.push({
      seq: step.seq,
      tool: step.tool,
      args,
      status: (["pending", "running", "done", "failed"].includes(step.status)
        ? step.status
        : "pending") as MotionCardStep["status"],
      resultText: step.resultText ?? "",
    });
    byId.set(step.motionId, list);
  }
  for (const list of byId.values()) list.sort((a, b) => a.seq - b.seq);
  return rows
    .map((row) => {
      const steps = byId.get(row.id) ?? [];
      const item = toMotionListItem(
        row,
        steps.map((s) => ({ seq: s.seq, tool: s.tool, status: s.status })),
      );
      return {
        id: row.id,
        foundingTurnId: row.foundingTurnId,
        title: row.title,
        status: item.status,
        stepN: item.stepN,
        stepM: item.stepM,
        under: item.under,
        steps,
      };
    })
    .filter((c) => c.foundingTurnId && c.stepM > 0);
}

export async function countOpenMotions(sessionId: string): Promise<number> {
  await ensureMotionStore();
  const raw = await db.execute(sql`
    SELECT COUNT(*)::int AS n
    FROM travis.motion
    WHERE session_id = ${sessionId}::uuid
      AND status IN ('waiting', 'running')
  `);
  const rows = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { rows?: unknown }).rows)
      ? (raw as { rows: unknown[] }).rows
      : [];
  const n = (rows[0] as { n?: number } | undefined)?.n;
  return typeof n === "number" ? n : 0;
}

type StepRow = {
  seq: number;
  tool: string;
  status: string;
};

function toMotionListItem(
  row: {
    id: string;
    title: string;
    status: string;
    updatedAt: Date;
  },
  steps: StepRow[],
): MotionListItem {
  const stepM = steps.length;
  const running = steps.find((s) => s.status === "running");
  const pending = steps.find((s) => s.status === "pending");
  const failed = steps.find((s) => s.status === "failed");
  const current = running ?? pending ?? failed ?? steps[steps.length - 1];
  const doneCount = steps.filter((s) => s.status === "done").length;
  const status = (
    ["waiting", "running", "done", "failed"].includes(row.status)
      ? row.status
      : "waiting"
  ) as MotionStatus;
  return {
    kind: "motion",
    id: row.id,
    title: row.title,
    status,
    stepN: motionStepN({
      stepM,
      currentSeq: current?.seq ?? null,
      doneCount,
    }),
    stepM,
    under: motionUnder(current?.tool ?? ""),
    updatedAt: row.updatedAt,
  };
}

async function stepsForMotions(motionIds: string[]): Promise<Map<string, StepRow[]>> {
  const map = new Map<string, StepRow[]>();
  if (!motionIds.length) return map;
  const rows = await db
    .select({
      motionId: motionStep.motionId,
      seq: motionStep.seq,
      tool: motionStep.tool,
      status: motionStep.status,
    })
    .from(motionStep)
    .where(inArray(motionStep.motionId, motionIds));
  for (const row of rows) {
    const list = map.get(row.motionId) ?? [];
    list.push({ seq: row.seq, tool: row.tool, status: row.status });
    map.set(row.motionId, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.seq - b.seq);
  }
  return map;
}

const OPEN_MOTION = ["waiting", "running", "failed"] as const;

export async function listMotions(
  sessionId: string,
  statuses: readonly string[] = OPEN_MOTION,
): Promise<MotionListItem[]> {
  await ensureMotionStore();
  const rows = await db
    .select()
    .from(motion)
    .where(
      and(eq(motion.sessionId, sessionId), inArray(motion.status, [...statuses])),
    )
    .orderBy(desc(motion.updatedAt));
  const byId = await stepsForMotions(rows.map((r) => r.id));
  return rows.map((row) => toMotionListItem(row, byId.get(row.id) ?? []));
}

export type BacklogInitiativeItem = InitiativeListItem & {
  kind: "initiative";
};

export type BacklogItem = MotionListItem | BacklogInitiativeItem;

export async function listBacklog(
  sessionId: string,
  opts: ListInitiativesOpts & { view?: BacklogView } = {},
): Promise<{ items: BacklogItem[]; motionCount: number }> {
  const view = parseBacklogView(opts.view);
  const motionCount = await countOpenMotions(sessionId);
  if (view === "in_motion") {
    return { items: await listMotions(sessionId), motionCount };
  }
  const tickets = await listInitiatives(sessionId, {
    status: opts.status,
    when: opts.when,
    q: opts.q,
  });
  const initiatives: BacklogInitiativeItem[] = tickets.map((row) => ({
    ...row,
    kind: "initiative" as const,
  }));
  if (view === "initiatives") {
    return { items: initiatives, motionCount };
  }
  const motions = await listMotions(sessionId);
  const items: BacklogItem[] = [...motions, ...initiatives].sort((a, b) => {
    const aAt = a.kind === "motion" ? a.updatedAt : a.createdAt;
    const bAt = b.kind === "motion" ? b.updatedAt : b.createdAt;
    return new Date(bAt).getTime() - new Date(aAt).getTime();
  });
  return { items, motionCount };
}

export function formatBacklogToolText(
  view: BacklogView,
  pile: { items: BacklogItem[]; motionCount: number },
): string {
  if (view === "in_motion") {
    return formatMotionList(pile.items.filter((i) => i.kind === "motion"));
  }
  const tickets = pile.items.filter((i) => i.kind === "initiative");
  const motions = pile.items.filter((i) => i.kind === "motion");
  if (view === "initiatives") {
    return formatInitiativeList(tickets);
  }
  const motionText = motions.length ? formatMotionList(motions) : "Nothing in motion.";
  const ticketText = formatInitiativeList(tickets);
  return `${motionText}\n${ticketText}\n${pile.motionCount} waiting or running.`;
}

type ClaimedStep = {
  id: string;
  motionId: string;
  seq: number;
  tool: string;
  args: string;
};

function asClaimed(raw: unknown): ClaimedStep | null {
  const rows = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { rows?: unknown }).rows)
      ? (raw as { rows: unknown[] }).rows
      : [];
  const row = rows[0] as
    | {
        id?: string;
        motion_id?: string;
        seq?: number;
        tool?: string;
        args?: string;
      }
    | undefined;
  if (!row?.id || !row.motion_id || !row.tool) return null;
  return {
    id: row.id,
    motionId: row.motion_id,
    seq: Number(row.seq ?? 0),
    tool: row.tool,
    args: typeof row.args === "string" ? row.args : "{}",
  };
}

/** Request died after claim. Leave it pending so the next wake retries. */
async function reclaimStaleRunningSteps(motionId: string): Promise<number> {
  const raw = await db.execute(sql`
    UPDATE travis.motion_step
    SET status = 'pending', started_at = NULL
    WHERE motion_id = ${motionId}::uuid
      AND status = 'running'
      AND coalesce(result_text, '') = ''
      AND started_at IS NOT NULL
      AND started_at < now() - (${STALE_RUNNING_MS}::int * interval '1 millisecond')
    RETURNING id
  `);
  const rows = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { rows?: unknown }).rows)
      ? (raw as { rows: unknown[] }).rows
      : [];
  return rows.length;
}

async function claimNextStep(motionId: string): Promise<ClaimedStep | null> {
  const raw = await db.execute(sql`
    UPDATE travis.motion_step
    SET status = 'running', started_at = now()
    WHERE id = (
      SELECT id FROM travis.motion_step
      WHERE motion_id = ${motionId}::uuid AND status = 'pending'
      ORDER BY seq ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    RETURNING id, motion_id, seq, tool, args
  `);
  return asClaimed(raw);
}

async function finishStep(
  stepId: string,
  motionId: string,
  resultText: string,
  ok: boolean,
): Promise<void> {
  const now = new Date();
  await db
    .update(motionStep)
    .set({
      status: ok ? "done" : "failed",
      resultText,
      doneAt: now,
    })
    .where(eq(motionStep.id, stepId));

  if (!ok) {
    await db
      .update(motion)
      .set({ status: "failed", updatedAt: now, doneAt: now })
      .where(eq(motion.id, motionId));
    return;
  }

  const leftover = await db
    .select({ id: motionStep.id })
    .from(motionStep)
    .where(
      and(
        eq(motionStep.motionId, motionId),
        inArray(motionStep.status, ["pending", "running"]),
      ),
    )
    .limit(1);

  if (!leftover.length) {
    await db
      .update(motion)
      .set({ status: "done", updatedAt: now, doneAt: now })
      .where(eq(motion.id, motionId));
    return;
  }

  await db
    .update(motion)
    .set({ status: "waiting", updatedAt: now })
    .where(eq(motion.id, motionId));
}

async function runOneMotion(sessionId: string, motionId: string): Promise<void> {
  await reclaimStaleRunningSteps(motionId);
  await db
    .update(motion)
    .set({ status: "running", updatedAt: new Date() })
    .where(and(eq(motion.id, motionId), eq(motion.status, "waiting")));

  for (;;) {
    const claimed = await claimNextStep(motionId);
    if (!claimed) {
      if ((await reclaimStaleRunningSteps(motionId)) > 0) continue;
      const leftover = await db
        .select({ id: motionStep.id, status: motionStep.status })
        .from(motionStep)
        .where(eq(motionStep.motionId, motionId));
      const failed = leftover.some((s) => s.status === "failed");
      const open = leftover.some(
        (s) => s.status === "pending" || s.status === "running",
      );
      if (!open && leftover.length && leftover.every((s) => s.status === "done")) {
        await db
          .update(motion)
          .set({ status: "done", updatedAt: new Date(), doneAt: new Date() })
          .where(eq(motion.id, motionId));
      } else if (failed) {
        await db
          .update(motion)
          .set({ status: "failed", updatedAt: new Date(), doneAt: new Date() })
          .where(
            and(eq(motion.id, motionId), inArray(motion.status, ["waiting", "running"])),
          );
      }
      return;
    }

    await db
      .update(motion)
      .set({ status: "running", updatedAt: new Date() })
      .where(eq(motion.id, motionId));

    let args: Record<string, unknown> = {};
    try {
      const parsed = JSON.parse(claimed.args || "{}") as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        args = parsed as Record<string, unknown>;
      }
    } catch {
      args = {};
    }

    try {
      const { runTravisTool } = await import("./travis-tools");
      const result = await runTravisTool({
        sessionId,
        name: claimed.tool,
        args,
        asMotionStep: true,
      });
      await finishStep(claimed.id, motionId, result.text, result.ok);
      if (!result.ok) return;
    } catch (err) {
      const text = err instanceof Error ? err.message : String(err);
      await finishStep(claimed.id, motionId, text, false);
      return;
    }
  }
}

/** Never throws to Voice. Safe when there is nothing to do. */
export async function runMotionRunner(sessionId: string): Promise<void> {
  try {
    await ensureMotionStore();
    const rows = await db
      .select({ id: motion.id })
      .from(motion)
      .where(
        and(
          eq(motion.sessionId, sessionId),
          inArray(motion.status, ["waiting", "running"]),
        ),
      )
      .orderBy(asc(motion.createdAt));
    await Promise.all(rows.map((row) => runOneMotion(sessionId, row.id)));
  } catch (err) {
    console.error("[motion] runner", err);
  }
}

export function formatFilePlanResult(filed: FiledPlan): string {
  return formatFiledPlan(filed);
}
