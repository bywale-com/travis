/** How long a live run has been up, in the grain the in-flight door draws. */
export function elapsedLabel(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m <= 0) return `${r}s`;
  return `${m}m ${r}s`;
}

/** How long ago, in the grain the room index draws. */

export function relativeTime(at: Date | string, nowMs = Date.now()): string {
  const then = typeof at === "string" ? new Date(at).getTime() : at.getTime();
  if (!Number.isFinite(then)) return "";
  const s = Math.max(0, Math.round((nowMs - then) / 1000));
  if (s < 45) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 172800) return "yesterday";
  return `${Math.floor(s / 86400)}d ago`;
}
