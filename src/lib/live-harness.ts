/**
 * Voice Live is ear + mouth. Mouth waits for finalize.
 * Cursor dests still leave on the live transcript path.
 * SCP-035 — never full-pipe Travis on a live flush.
 */

export function liveShouldPipeTravis(params: {
  prompt: string;
  cursorDestCount: number;
}): boolean {
  void params;
  return false;
}
