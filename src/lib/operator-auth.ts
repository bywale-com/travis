/** Cookie and email grain for the operator link. No store here. */

export const OPERATOR_COOKIE = "travis_op";

export const OPERATOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

export function normalizeOperatorEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isOperatorEmail(raw: string): boolean {
  const email = normalizeOperatorEmail(raw);
  if (!email || email.length > 254) return false;
  const at = email.indexOf("@");
  if (at < 1 || at === email.length - 1) return false;
  if (email.includes(" ")) return false;
  return email.includes(".", at);
}

export function seedOperatorEmails(env: {
  TRAVIS_OPERATOR_EMAIL?: string;
  TEST_EMAIL_TO?: string;
}): string[] {
  const blob = [env.TRAVIS_OPERATOR_EMAIL, env.TEST_EMAIL_TO]
    .filter((v): v is string => typeof v === "string")
    .join(",");
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of blob.split(",")) {
    const email = normalizeOperatorEmail(part.replace(/\r/g, ""));
    if (!isOperatorEmail(email) || seen.has(email)) continue;
    seen.add(email);
    out.push(email);
  }
  return out;
}

/** First env-seeded operator, else the oldest row. Used only to backfill null rooms. */
export function preferredOperator<T extends { email: string }>(
  operators: T[],
  seedEmails: string[],
): T | null {
  const byEmail = new Map(
    operators.map((row) => [normalizeOperatorEmail(row.email), row] as const),
  );
  for (const email of seedEmails) {
    const hit = byEmail.get(normalizeOperatorEmail(email));
    if (hit) return hit;
  }
  return operators[0] ?? null;
}

/**
 * v1 is one person. Seeded inboxes share one room pile.
 * A login that is not on the seed list stays on its own rooms.
 */
export function operatorRoomScope<T extends { id: string; email: string }>(
  actor: T,
  operators: T[],
  seedEmails: string[],
): { ownerId: string; viewerIds: string[] } {
  const actorEmail = normalizeOperatorEmail(actor.email);
  const seeds = seedEmails.map(normalizeOperatorEmail);
  if (!seeds.includes(actorEmail)) {
    return { ownerId: actor.id, viewerIds: [actor.id] };
  }
  const inSeed = operators.filter((row) =>
    seeds.includes(normalizeOperatorEmail(row.email)),
  );
  const owner = preferredOperator(inSeed, seeds) ?? actor;
  const viewerIds = inSeed.map((row) => row.id);
  return { ownerId: owner.id, viewerIds: viewerIds.length ? viewerIds : [actor.id] };
}

export function operatorLinkPath(token: string): string {
  return `/enter/${encodeURIComponent(token)}`;
}

export function operatorLinkText(url: string): string {
  return [
    "This is your personal Travis link. Keep it.",
    "",
    url,
    "",
    "If you lose it, open Travis, enter this email, and we send this same link again.",
  ].join("\n");
}

export function tokenFromCookieHeader(header: string | null): string {
  if (!header) return "";
  for (const part of header.split(";")) {
    const cut = part.trim();
    const eq = cut.indexOf("=");
    if (eq < 1) continue;
    const key = cut.slice(0, eq).trim();
    if (key !== OPERATOR_COOKIE) continue;
    try {
      return decodeURIComponent(cut.slice(eq + 1).trim());
    } catch {
      return cut.slice(eq + 1).trim();
    }
  }
  return "";
}
