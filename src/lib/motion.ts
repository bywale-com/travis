/**
 * SCP-013 — motion plan grain. Allowlist, list shape, step verbs.
 * Store and runner live in src/server/motion.ts.
 */

export const MOTION_STEP_ALLOWLIST = [
  "list_seats",
  "queue_snapshot",
  "work_in_flight",
  "read_seat_reply",
  "search_room",
  "list_initiatives",
  "read_initiative",
  "rename_initiative",
  "mark_initiative_done",
  "rename_room",
  "list_os",
  "read_os",
  "write_os",
  "list_backlog",
] as const;

export type MotionStepTool = (typeof MOTION_STEP_ALLOWLIST)[number];

export const MOTION_STEP_REFUSED = [
  "send_to_seat",
  "dispatch_to_seat",
  "barge_or_drop",
  "end_session",
  "set_view",
  "file_plan",
  "create_agent",
  "sit_agent",
] as const;

export type BacklogView = "all" | "in_motion" | "initiatives";

export type MotionStatus = "waiting" | "running" | "done" | "failed";
export type MotionStepStatus = "pending" | "running" | "done" | "failed";

export type MotionListItem = {
  kind: "motion";
  id: string;
  title: string;
  status: MotionStatus;
  stepN: number;
  stepM: number;
  under: string;
  updatedAt: Date;
};

export function isMotionStepAllowed(tool: string): tool is MotionStepTool {
  return (MOTION_STEP_ALLOWLIST as readonly string[]).includes(tool);
}

export function isMotionStepRefused(tool: string): boolean {
  return (MOTION_STEP_REFUSED as readonly string[]).includes(tool);
}

export function parseBacklogView(raw: unknown): BacklogView {
  const v = String(raw ?? "all");
  if (v === "in_motion" || v === "initiatives" || v === "all") return v;
  return "all";
}

export function humanizeMotionTool(tool: string): string {
  const words = String(tool ?? "")
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  return words.join(" ") || "tool";
}

export function motionUnder(tool: string): string {
  return `Travis · ${humanizeMotionTool(tool)}`;
}

/** Last done+1, or the running/failed seq. */
export function motionStepN(params: {
  stepM: number;
  currentSeq: number | null;
  doneCount: number;
}): number {
  const m = Math.max(0, params.stepM);
  if (!m) return 0;
  if (params.currentSeq != null && params.currentSeq > 0) {
    return Math.min(params.currentSeq, m);
  }
  return Math.min(params.doneCount + 1, m);
}

export function formatMotionListLine(item: MotionListItem): string {
  const title = item.title.trim() || "(no title)";
  return `${item.status}: ${item.id} ${title} · step ${item.stepN} of ${item.stepM} · ${item.under}`;
}

export function formatMotionList(items: MotionListItem[]): string {
  if (!items.length) return "Nothing in motion.";
  return `${items.length} in motion.\n${items.map(formatMotionListLine).join("\n")}`;
}

export function formatFiledPlan(params: {
  id: string;
  title: string;
  stepCount: number;
}): string {
  const title = params.title.trim() || "(no title)";
  const n = params.stepCount;
  return `Filed ${params.id} “${title}” — ${n} step${n === 1 ? "" : "s"}.`;
}
