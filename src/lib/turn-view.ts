/**
 * What the log shows. Travis reports an unwired key, a model error, or an
 * empty reply as a `status` turn — dropping those read as "Travis isn't
 * responding", so they belong on the glass as a quiet line, not a bubble.
 */

export const LOG_TURN_KINDS = [
  "user",
  "agent_post",
  "travis_prompt",
  "status",
] as const;

export function isLoggedTurn(kind: string | null | undefined): boolean {
  return (LOG_TURN_KINDS as readonly string[]).includes(kind ?? "");
}

/** Quiet muted line — never an avatar, bubble, or section bar. */
export function isQuietStatus(kind: string | null | undefined): boolean {
  return kind === "status";
}
