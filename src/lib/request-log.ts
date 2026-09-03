/**
 * Hotfix 048 — the request log is the room's user turns, not a new store.
 *
 * Travis only gets a 14-turn receipt window, so it forgets what was routed
 * an hour ago. The rows are already in voice_turn. This formats them, matches
 * a search, and tells Travis the organ exists.
 */

export const REQUEST_LOG_LIMIT = 30;
export const REQUEST_LINE_CAP = 180;
export const REQUEST_SCAN = 200;

/** UTC day / last seven days. No user timezone store. */
export type RequestWhen = "today" | "week" | "all";

export function parseRequestWhen(raw: unknown): RequestWhen {
  if (raw === "today" || raw === "week" || raw === "all") return raw;
  return "all";
}

export function clampRequestLimit(n: unknown): number {
  const x = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(x)) return REQUEST_LOG_LIMIT;
  return Math.min(REQUEST_SCAN, Math.max(1, Math.floor(x)));
}

export function requestWindowStart(
  when: RequestWhen,
  nowMs = Date.now(),
): number | null {
  if (when === "today") {
    const d = new Date(nowMs);
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }
  if (when === "week") return nowMs - 7 * 24 * 60 * 60 * 1000;
  return null;
}

export function requestInWindow(
  at: Date | string | undefined,
  sinceMs: number | null,
): boolean {
  if (sinceMs == null) return true;
  if (at == null || at === "") return false;
  const t = typeof at === "string" ? new Date(at).getTime() : at.getTime();
  return Number.isFinite(t) && t >= sinceMs;
}

export type RequestRow = {
  id?: string;
  seq: number;
  seatKey: string | null;
  text: string;
  createdAt?: Date | string;
};

export function isRequestTurn(kind: string): boolean {
  return kind === "user";
}

export function requestDestLabel(seatKey: string | null | undefined): string {
  if (seatKey === "pm") return "PM";
  if (seatKey === "sa") return "SA";
  if (seatKey === "engineer") return "Engineer";
  if (seatKey === "travis") return "Travis";
  const raw = (seatKey ?? "").trim();
  return raw || "Travis";
}

export function requestMatches(
  text: string,
  q: string,
  seatKey?: string | null,
  seat?: string,
): boolean {
  if (seat && (seatKey ?? "") !== seat) return false;
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return text.toLowerCase().includes(needle);
}

export function filterRequests<T extends RequestRow>(
  rows: T[],
  opts: {
    q?: string;
    seat?: string;
    when?: RequestWhen;
    limit?: number;
    nowMs?: number;
  } = {},
): T[] {
  const q = opts.q ?? "";
  const since = requestWindowStart(opts.when ?? "all", opts.nowMs ?? Date.now());
  const limit = clampRequestLimit(opts.limit);
  return rows
    .filter(
      (r) =>
        requestMatches(r.text, q, r.seatKey, opts.seat) &&
        requestInWindow(r.createdAt, since),
    )
    .slice(0, limit);
}

export function formatStamp(at?: Date | string): string {
  if (at == null || at === "") return "";
  const d = typeof at === "string" ? new Date(at) : at;
  if (!Number.isFinite(d.getTime())) return "";
  const iso = d.toISOString();
  return `${iso.slice(0, 16).replace("T", " ")} UTC`;
}

function clip(text: string, cap: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= cap) return flat;
  return `${flat.slice(0, cap).trimEnd()}…`;
}

export function formatRequestLine(row: RequestRow): string {
  const stamp = formatStamp(row.createdAt);
  const dest = requestDestLabel(row.seatKey);
  const body = clip(row.text, REQUEST_LINE_CAP);
  return stamp ? `[${stamp}] → ${dest}: ${body}` : `→ ${dest}: ${body}`;
}

function whenPhrase(when?: RequestWhen): string {
  if (when === "today") return " today";
  if (when === "week") return " in the last 7 days";
  return "";
}

export function formatRequestLog(params: {
  rows: RequestRow[];
  total: number;
  q?: string;
  seat?: string;
  when?: RequestWhen;
}): string {
  const { rows, total, q, seat, when } = params;
  const dest = seat ? ` to ${requestDestLabel(seat)}` : "";
  const match = q?.trim() ? ` matching “${q.trim()}”` : "";
  const span = whenPhrase(when);
  if (!total) {
    if (q?.trim() || seat || (when && when !== "all")) {
      return `No requests${dest}${match}${span}.`;
    }
    return "No requests in this room yet.";
  }
  const shown = `${rows.length} of ${total} requests${dest}${match}${span}, newest first.`;
  return [shown, ...rows.map(formatRequestLine)].join("\n");
}

export function requestLogPointer(count: number): string | null {
  if (count <= 0) return null;
  const n = count === 1 ? "1 request" : `${count} requests`;
  return `This room has ${n} in the request log (every line sent, with time). They are not all in the window above. Call search_room to list or search them — when=today, when=week, or limit for the last N. Times are UTC.`;
}
