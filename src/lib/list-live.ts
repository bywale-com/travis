/**
 * SCP-029 — incremental tape merge and which door the tick paints.
 * No new bus. Poll stays.
 */

export function parseAfterSeq(raw: string | null | undefined): number | null {
  if (raw == null) return null;
  const s = raw.trim();
  if (!/^-?\d+$/.test(s)) return null;
  const n = Number(s);
  if (!Number.isSafeInteger(n)) return null;
  return n;
}

export function maxTurnSeq(turns: Array<{ seq: number }>): number | null {
  if (!turns.length) return null;
  return turns.reduce((m, t) => (t.seq > m ? t.seq : m), turns[0].seq);
}

/** Incoming replaces by id. New ids append. Omitted rows stay. */
export function mergeTurnsById<T extends { id: string }>(
  prev: T[],
  incoming: T[],
): T[] {
  if (incoming.length === 0) return prev;
  const byId = new Map(prev.map((t) => [t.id, t]));
  const order = prev.map((t) => t.id);
  for (const t of incoming) {
    if (!byId.has(t.id)) order.push(t.id);
    byId.set(t.id, t);
  }
  return order.map((id) => byId.get(id)!);
}

export type OpenDoorTick =
  | { kind: "rooms" }
  | { kind: "ticket"; id: string }
  | { kind: "backlog" }
  | { kind: "room"; sessionId: string }
  | { kind: "idle" };

/** Which list the phone is looking at. Closed doors are not refetched. */
export function openDoorTick(input: {
  plate: string;
  door: string | null;
  ticketId: string | null;
  sessionId: string | null;
}): OpenDoorTick {
  if (input.plate === "index") return { kind: "rooms" };
  if (input.ticketId) return { kind: "ticket", id: input.ticketId };
  if (input.door === "backlog") return { kind: "backlog" };
  if (input.plate === "room" && input.sessionId) {
    return { kind: "room", sessionId: input.sessionId };
  }
  return { kind: "idle" };
}
