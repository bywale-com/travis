/** Room name on `voice_session.title`. Empty is legal. Harness clip, not a model name. */

export const ROOM_TITLE_CAP = 80;

export function clipRoomTitle(raw: string): string {
  const flat = String(raw ?? "").replace(/\s+/g, " ").trim();
  if (!flat) return "";
  if (flat.length <= ROOM_TITLE_CAP) return flat;
  const window = flat.slice(0, ROOM_TITLE_CAP);
  const lastSpace = window.lastIndexOf(" ");
  if (lastSpace > 16) return window.slice(0, lastSpace).trimEnd();
  return window.trimEnd();
}
