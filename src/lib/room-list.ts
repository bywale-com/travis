/** Pack index rows. One member query, not one per room. */

export type RoomListSession = {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  endedAt: Date | null;
};

export type RoomListMember = {
  sessionId: string;
  seatKey: string | null;
  label: string;
};

export function packRoomRows(
  sessions: RoomListSession[],
  members: RoomListMember[],
) {
  const map = new Map<string, Array<{ seatKey: string | null; label: string }>>();
  for (const m of members) {
    const list = map.get(m.sessionId) ?? [];
    list.push({ seatKey: m.seatKey, label: m.label });
    map.set(m.sessionId, list);
  }
  return sessions.map((s) => ({
    id: s.id,
    title: s.title,
    status: s.status,
    createdAt: s.createdAt,
    endedAt: s.endedAt,
    members: map.get(s.id) ?? [],
  }));
}
