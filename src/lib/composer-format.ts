/** Wrap the current Type selection. Empty selection still inserts the marks. */

export function wrapSelection(
  text: string,
  start: number,
  end: number,
  mark: "**" | "*" | "`",
): { text: string; start: number; end: number } {
  const lo = Math.max(0, Math.min(start, end, text.length));
  const hi = Math.max(0, Math.min(Math.max(start, end), text.length));
  const inner = text.slice(lo, hi);
  const next = `${text.slice(0, lo)}${mark}${inner}${mark}${text.slice(hi)}`;
  const innerStart = lo + mark.length;
  return { text: next, start: innerStart, end: innerStart + inner.length };
}
