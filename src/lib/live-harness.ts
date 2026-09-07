/**
 * Voice Live is ear + mouth. Think is the Type hang (Deep Agents).
 * Cursor dests still leave on the live transcript path.
 */

export function liveShouldPipeTravis(params: {
  prompt: string;
  cursorDestCount: number;
}): boolean {
  return Boolean(params.prompt.trim()) && params.cursorDestCount === 0;
}
