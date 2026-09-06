/**
 * SCP-028 — dest from this referenced turn’s author. Read this row only.
 */

import type { TypedDest } from "@/lib/typed-dest";

export function authorDestKeyFromTurn(turn: {
  kind?: string | null;
  seatKey?: string | null;
}): string | null {
  if (turn.kind !== "agent_post") return null;
  const key = turn.seatKey?.trim() ?? "";
  return key || null;
}

/**
 * Author dest first. Empty chips / name / sticky do not replace it.
 * Explicit chips or call-by-name add. Switch-only stays today’s via.
 */
export function mergeReplyDestKeys(params: {
  decided: TypedDest;
  authorKey: string | null;
}): string[] {
  const author = params.authorKey?.trim() || null;
  if (params.decided.kind === "empty") return [];
  if (params.decided.kind === "switch") return [params.decided.seatKey];
  const extras = params.decided.seatKeys.filter((key) => key !== author);
  if (!author) return extras;
  return [author, ...extras];
}
