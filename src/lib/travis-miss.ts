/**
 * Hotfix 080 — a generate miss must be a Log line, not mute status.
 * Room hides kind=status unless the text matches this.
 */

export function isVisibleLogStatus(text: string): boolean {
  return /error/i.test(text);
}

/** Status text the Log will show. Do not write `Travis: <no error>`. */
export function travisGenerateMiss(message: string): string {
  const msg = message.replace(/\s+/g, " ").trim() || "generate failed";
  if (isVisibleLogStatus(msg)) return `Travis: ${msg}`;
  return `Travis error: ${msg}`;
}
