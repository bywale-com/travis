/**
 * SCP-034 — open dest_job for that living bind is follow-up, not a new leave.
 * No phrase classifier. The open job is the staple.
 */

export type DestPath = "follow-up" | "new-leave";

export function destPathForBind(openJobForBind: boolean): DestPath {
  return openJobForBind ? "follow-up" : "new-leave";
}

/** Follow-up busy → enqueue on that same bind. New role leave still never queues. */
export function destEnqueueIfBusy(path: DestPath): boolean | undefined {
  if (path === "follow-up") return true;
  return undefined;
}
