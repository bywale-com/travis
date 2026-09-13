/**
 * SCP-015 — locked sit paths. Empty protocol_path is created, not seated.
 */

export const SIT_PROTOCOL_FILES = [
  "/protocols/pm.md",
  "/protocols/sa.md",
  "/protocols/engineer.md",
] as const;

export type SitProtocolRole = "pm" | "sa" | "engineer";

export const SIT_ROLE_LABEL: Record<SitProtocolRole, string> = {
  pm: "Technical Architect",
  sa: "SA",
  engineer: "Engineer",
};

export const SIT_PROTOCOL_BY_ROLE: Record<SitProtocolRole, string> = {
  pm: "/protocols/pm.md",
  sa: "/protocols/sa.md",
  engineer: "/protocols/engineer.md",
};

export type SitProtocolOk = { ok: true; role: SitProtocolRole; path: string };
export type SitProtocolErr = { ok: false; reason: string };

const ROLE_ALIASES: Record<string, SitProtocolRole> = {
  pm: "pm",
  sa: "sa",
  engineer: "engineer",
  architect: "pm",
  "technical architect": "pm",
  "technical-architect": "pm",
  "/protocols/pm.md": "pm",
  "/protocols/sa.md": "sa",
  "/protocols/engineer.md": "engineer",
};

export function isSitProtocolRole(
  value: string | null | undefined,
): value is SitProtocolRole {
  return value === "pm" || value === "sa" || value === "engineer";
}

/** Architect (and glass names) dest as the Technical Architect role. */
export function sitRoleFromAlias(
  raw: string | null | undefined,
): SitProtocolRole | null {
  const key = (raw ?? "").trim();
  if (!key) return null;
  if (isSitProtocolRole(key)) return key;
  const parsed = parseSitProtocol(key);
  return parsed.ok ? parsed.role : null;
}

/** Room / catalog keys that count as the same dest (architect ↔ pm). */
export function destKeysForSeat(destKey: string): string[] {
  const key = destKey.trim();
  if (!key) return [];
  const role = sitRoleFromAlias(key);
  const out = [key];
  if (role && !out.includes(role)) out.push(role);
  if (role === "pm" && !out.includes("architect")) out.push("architect");
  return out;
}

/** Optional bind_agent seat — custom key or role. Architect stays architect. */
export function requestedBindSeatKey(raw: unknown): string {
  const key = String(raw ?? "").trim();
  if (!key) return "";
  const slug = key.toLowerCase().replace(/\s+/g, "-");
  if (
    slug === "architect" ||
    slug === "technical-architect" ||
    slug === "technical-pm"
  ) {
    return "architect";
  }
  return slug;
}

export function parseSitProtocol(raw: unknown): SitProtocolOk | SitProtocolErr {
  if (typeof raw !== "string" || !raw.trim()) {
    return { ok: false, reason: "Need a protocol (pm, sa, or engineer)." };
  }
  const key = raw.trim();
  const role = ROLE_ALIASES[key] ?? ROLE_ALIASES[key.toLowerCase()];
  if (role) {
    return { ok: true, role, path: SIT_PROTOCOL_BY_ROLE[role] };
  }
  if (key === "/protocols/travis.md" || key === "travis") {
    return {
      ok: false,
      reason: "Travis is the facilitator, not a Cursor seat.",
    };
  }
  if (key === "/protocols/WHERE.md" || key === "/protocols/logging.md") {
    return { ok: false, reason: "WHERE and logging are not seat protocols." };
  }
  return { ok: false, reason: "Sit only hangs pm, sa, or engineer." };
}

/** Person dest when `who` is set. Role dest when seat is a role and who is empty. */
export function destKind(args: {
  seat?: unknown;
  who?: unknown;
}): "person" | "role" | "none" {
  const who = String(args.who ?? "").trim();
  if (who) return "person";
  if (sitRoleFromAlias(String(args.seat ?? "").trim())) return "role";
  return "none";
}

export function formatSeatRosterLine(opts: {
  label: string;
  seatKey: string;
  protocolPath: string;
  busy: boolean;
}): string {
  const seated = opts.protocolPath.trim() || "not seated";
  return `${opts.label} (${opts.seatKey}) — ${seated} — ${opts.busy ? "busy" : "idle"}`;
}
