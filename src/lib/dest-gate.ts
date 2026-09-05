/**
 * SCP-023 — dest is a job, not a mailbox keyed by the noun.
 * His / theirs / nobody. Catalog fallback is not a class.
 */

export type DestClass = "his" | "theirs" | "nobody";

export type DestHole =
  | "vacant"
  | "not_seated"
  | "catalog"
  | "rebind"
  | "capability"
  | "unseat"
  | "spin";

const HIS_WORK =
  /\b(create|sit|prove|unfold|authorize)\b/i;
const HIS_PLACE = /\b(box|house|os node|os_node|work repo template)\b/i;
const NEW_ROLE = /\bnew\s+(pm|sa|engineer|product manager|systems analyst)\b/i;
const UNSEAT_ASK = /\b(deprecate|unseat)\b/i;
const BC_ID = /\bbc-[0-9a-f-]+\b/i;

export function isHisWork(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (UNSEAT_ASK.test(t)) return false;
  if (HIS_WORK.test(t)) return true;
  if (HIS_PLACE.test(t) && /\b(run|write|read|prove|list|unfold)\b/i.test(t)) {
    return true;
  }
  if (NEW_ROLE.test(t)) return true;
  return false;
}

export function isRebindAsk(text: string): boolean {
  return BC_ID.test(text) || /\brebind\b/i.test(text);
}

export function classifyDestPrompt(
  text: string,
): { class: DestClass; hole?: DestHole } | null {
  if (isRebindAsk(text)) return { class: "nobody", hole: "rebind" };
  if (UNSEAT_ASK.test(text)) return { class: "nobody", hole: "unseat" };
  if (isHisWork(text)) return { class: "his" };
  return null;
}

export function classifyOpenMember(params: {
  binding: { protocolPath?: string | null; cursorAgentId?: string | null } | null;
}): { class: DestClass; hole?: DestHole } {
  if (!params.binding) return { class: "nobody", hole: "vacant" };
  const path = (params.binding.protocolPath ?? "").trim();
  if (!path) return { class: "nobody", hole: "not_seated" };
  return { class: "theirs" };
}

export function nobodyReceipt(params: {
  hole: DestHole;
  label: string;
}): string {
  const name = params.label.trim() || "that seat";
  if (params.hole === "vacant") {
    return `No open ${name} in this room. That is a hole. I can offer Engineer, or you can create and sit.`;
  }
  if (params.hole === "not_seated" || params.hole === "catalog") {
    return `${name} is in the room but not seated. I will not mail a catalog slug. Create and sit, or offer Engineer.`;
  }
  if (params.hole === "rebind") {
    return `I cannot rebind a Cursor id. That is a hole here. Offer Engineer.`;
  }
  if (params.hole === "capability") {
    return `I cannot see their repo, diff, or CI. Offer Engineer.`;
  }
  if (params.hole === "unseat") {
    return `There is no unseat write. Deprecate without a next person is a hole. Offer Engineer.`;
  }
  return `Could not sit or spin an idle ${name}. That is a hole. Offer Engineer.`;
}

export function hisWorkReceipt(): string {
  return "That is mine — create, sit, prove, unfold, box, or house. I will not send it.";
}

export const DEST_HEARTBEAT_STALE_MS = 15_000;

export function destHeartbeatState(
  lastHeartbeatAt: Date | string | null | undefined,
  nowMs = Date.now(),
): "quiet" | "live" | "stale" {
  if (lastHeartbeatAt == null || lastHeartbeatAt === "") return "quiet";
  const then =
    typeof lastHeartbeatAt === "string"
      ? new Date(lastHeartbeatAt).getTime()
      : lastHeartbeatAt.getTime();
  if (!Number.isFinite(then)) return "quiet";
  const age = Math.max(0, nowMs - then);
  return age > DEST_HEARTBEAT_STALE_MS ? "stale" : "live";
}

export function destHeartbeatLabel(
  lastHeartbeatAt: Date | string | null | undefined,
  nowMs = Date.now(),
): string {
  const state = destHeartbeatState(lastHeartbeatAt, nowMs);
  if (state === "quiet") return "";
  if (state === "stale") return "stale";
  const then =
    typeof lastHeartbeatAt === "string"
      ? new Date(lastHeartbeatAt).getTime()
      : (lastHeartbeatAt as Date).getTime();
  const s = Math.max(0, Math.floor((nowMs - then) / 1000));
  return `${s}s ago`;
}
