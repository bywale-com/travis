/**
 * SCP-037 — Look grain. Note or a selected turn. Seed lives on GitHub.
 * Walk cookie is a dry File. Not initiative. Not dest. Not a table.
 */

export const LOOK_SEED_MARKER = "<!-- travis-look -->";
export const GITHUB_BODY_CAP = 65536;
export const LOOK_EMPTY = "Need a note or a selected turn.";
export const LOOK_TOO_LONG = "Note is too long.";

export type LookParse =
  | { ok: true; note: string; turnIds: string[] }
  | { ok: false; reason: string };

export function parseLookBody(raw: unknown): LookParse {
  const obj =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const note = typeof obj.note === "string" ? obj.note.trim() : "";
  const rawIds = Array.isArray(obj.turnIds) ? obj.turnIds : [];
  const turnIds: string[] = [];
  const seen = new Set<string>();
  for (const id of rawIds) {
    if (typeof id !== "string") continue;
    const next = id.trim();
    if (!next || seen.has(next)) continue;
    seen.add(next);
    turnIds.push(next);
  }
  if (!note && turnIds.length === 0) {
    return { ok: false, reason: LOOK_EMPTY };
  }
  return { ok: true, note, turnIds };
}

export function isWalkFile(
  cookie: string,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const want = String(env.TRAVIS_TEST_OPERATOR_COOKIE ?? "").trim();
  const got = cookie.trim();
  return Boolean(want && got && want === got);
}

export function renderLookSeed(args: {
  sessionId: string;
  turnIds: string[];
  note: string;
  sha: string;
  deploy: string;
  when: string;
}): string {
  const turns = args.turnIds.length ? args.turnIds.join(", ") : "none";
  return `${LOOK_SEED_MARKER}
## Look (lived miss)

**Session:** ${args.sessionId}
**Turns:** ${turns}
**Note:** ${args.note}
**SHA:** ${args.sha || "unknown"}
**Deploy:** ${args.deploy}
**When:** ${args.when}
`;
}

export function lookSeedTooLong(seed: string): boolean {
  return seed.length > GITHUB_BODY_CAP;
}

/** Last user turn plus following assistant / agent_post in that beat. Face only. */
export function defaultLookTurnIds(
  turns: { id: string; kind: string }[],
): string[] {
  let lastUser = -1;
  for (let i = turns.length - 1; i >= 0; i--) {
    if (turns[i].kind === "user") {
      lastUser = i;
      break;
    }
  }
  if (lastUser < 0) return [];
  const ids = [turns[lastUser].id];
  for (let i = lastUser + 1; i < turns.length; i++) {
    const kind = turns[i].kind;
    if (kind === "user") break;
    if (kind === "assistant" || kind === "agent_post") ids.push(turns[i].id);
  }
  return ids;
}
