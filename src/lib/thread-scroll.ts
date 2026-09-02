/**
 * Hotfix 035 — the thread follows the newest turn only while you are already
 * at the bottom. Scroll up to read and the log holds still.
 */

/** Slack from the bottom that still counts as reading the newest turn. */
export const PIN_TOLERANCE_PX = 48;

export type ScrollBox = {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
};

export function distanceFromBottom(box: ScrollBox): number {
  return box.scrollHeight - box.scrollTop - box.clientHeight;
}

export function isPinnedToBottom(
  box: ScrollBox,
  tolerancePx: number = PIN_TOLERANCE_PX,
): boolean {
  return distanceFromBottom(box) <= tolerancePx;
}
