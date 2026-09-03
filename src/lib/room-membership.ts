/** SCP-007 — dest and role grain. No leftover analysis. */

export type MembershipRole = "member" | "facilitator";

export type MemberRef = { id: string; seatKey: string | null };

export function membershipRoleFor(
  seatKey: string | null | undefined,
): MembershipRole {
  return seatKey === "travis" ? "facilitator" : "member";
}

/**
 * Create dest: first chosen member (not Travis) if any, else Travis.
 * Stand-in keeps today's PM when that row is in the insert set.
 */
export function destOnCreate(opts: {
  chosen: MemberRef[];
  standInPmId?: string | null;
}): string | null {
  if (
    opts.standInPmId &&
    opts.chosen.some((c) => c.id === opts.standInPmId)
  ) {
    return opts.standInPmId;
  }
  const member = opts.chosen.find((c) => c.seatKey !== "travis");
  if (member) return member.id;
  return opts.chosen.find((c) => c.seatKey === "travis")?.id ?? null;
}

/** Repoint dest FKs after a remove. First remaining member, else Travis. */
export function destAfterRemove(opts: {
  removedId: string;
  current: { activeId: string; defaultId: string; bindingId: string };
  remaining: MemberRef[];
}): { activeId: string; defaultId: string; bindingId: string } {
  const fallback =
    opts.remaining.find((r) => r.seatKey !== "travis")?.id ??
    opts.remaining[0]?.id;
  const pick = (id: string) =>
    id === opts.removedId ? (fallback ?? id) : id;
  return {
    activeId: pick(opts.current.activeId),
    defaultId: pick(opts.current.defaultId),
    bindingId: pick(opts.current.bindingId),
  };
}
