import { seatKeyToShort } from "./router";

export type QueueItemDto = {
  id: string;
  seatKey: string;
  seq: number;
  text: string;
  createdAt: string;
};

export type QueueSeatDto = {
  seatKey: string;
  label: string;
  short: string;
  items: QueueItemDto[];
};

export type QueueSnapshot = {
  seats: QueueSeatDto[];
};

const SEAT_ORDER = ["pm", "sa", "engineer"] as const;

export function waitingChipLabel(count: number, seatKey: string): string {
  return `${count} waiting · ${seatKeyToShort(seatKey)}`;
}

export function queuedBlockLabel(seatKey: string): string {
  return `Queued · ${seatKeyToShort(seatKey)}`;
}

/**
 * Queue is per addressee. A Travis live-run row is not enough — Cursor
 * must still have an active run on that seat. Stale row → send now.
 */
export function shouldQueueForSeat(opts: {
  hasLiveRow: boolean;
  cursorHasActiveRun: boolean;
}): boolean {
  return opts.hasLiveRow && opts.cursorHasActiveRun;
}

/**
 * Drain only when this seat still has waiting lines and Cursor is not
 * in a run. A leftover live-run row is not a reason to wait — that row
 * is stale once Cursor is idle. A live Cursor run with no row still waits.
 */
export function isDrainableSeat(opts: {
  hasQueue: boolean;
  cursorHasActiveRun: boolean;
}): boolean {
  return opts.hasQueue && !opts.cursorHasActiveRun;
}

/** Head of a seat = smallest seq still present. */
export function headItem<T extends { seq: number }>(items: T[]): T | null {
  if (!items.length) return null;
  return items.reduce((min, row) => (row.seq < min.seq ? row : min));
}

export function groupQueueSeats(
  rows: Array<{
    id: string;
    seatKey: string;
    seq: number;
    text: string;
    createdAt: Date | string;
    label?: string | null;
  }>,
  labels: Record<string, string>,
): QueueSnapshot {
  const bySeat = new Map<string, QueueItemDto[]>();
  for (const row of rows) {
    const createdAt =
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : row.createdAt;
    const list = bySeat.get(row.seatKey) ?? [];
    list.push({
      id: row.id,
      seatKey: row.seatKey,
      seq: row.seq,
      text: row.text,
      createdAt,
    });
    bySeat.set(row.seatKey, list);
  }

  const seats: QueueSeatDto[] = [];
  const keys = [
    ...SEAT_ORDER.filter((k) => bySeat.has(k)),
    ...[...bySeat.keys()].filter(
      (k) => !SEAT_ORDER.includes(k as (typeof SEAT_ORDER)[number]),
    ),
  ];
  for (const seatKey of keys) {
    const items = (bySeat.get(seatKey) ?? []).sort((a, b) => a.seq - b.seq);
    if (!items.length) continue;
    seats.push({
      seatKey,
      label: labels[seatKey] ?? seatKey,
      short: seatKeyToShort(seatKey),
      items,
    });
  }
  return { seats };
}
