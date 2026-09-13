/**
 * SCP-027 — dest is an open member binding. Catalog pm is never the send target.
 * SCP-028 — destFromReferencedTurn reads this agent_post’s author only.
 */
import { and, eq } from "drizzle-orm";
import { isLivingCursorId } from "@/lib/dest-glass";
import { destKeysForSeat, sitRoleFromAlias } from "@/lib/protocol-path";
import { isTravisSeat } from "@/lib/seats";
import { authorDestKeyFromTurn, mergeReplyDestKeys } from "@/lib/reply-dest";
import type { TypedDest } from "@/lib/typed-dest";
import type { AgentBinding } from "@/server/db/schema";
import { db } from "@/server/db/client";
import { voiceTurn } from "@/server/db/schema";
import { MembershipError, openBindingForSeat, requireOpenMember } from "@/server/room-membership";
import { bindingBySeatKey, resolveRoleDest, SitError } from "@/server/sit";

export async function resolveDestBinding(
  sessionId: string,
  destKey: string,
): Promise<AgentBinding | null> {
  for (const key of destKeysForSeat(destKey)) {
    const open = await openBindingForSeat(sessionId, key);
    if (open && isLivingCursorId(open.cursorAgentId)) return open;
  }
  const role = sitRoleFromAlias(destKey);
  if (role) {
    try {
      return await resolveRoleDest({ sessionId, role });
    } catch (err) {
      if (err instanceof SitError) return null;
      throw err;
    }
  }
  const byKey = await bindingBySeatKey(destKey);
  if (byKey) {
    try {
      await requireOpenMember(sessionId, byKey.id);
      return byKey;
    } catch (err) {
      if (err instanceof MembershipError) {
        return openBindingForSeat(sessionId, destKey);
      }
      throw err;
    }
  }
  return openBindingForSeat(sessionId, destKey);
}

/** This referenced row’s author. Do not walk reference_turn_id. */
export async function destFromReferencedTurn(
  sessionId: string,
  referenceTurnId: string,
): Promise<AgentBinding | null> {
  const [row] = await db
    .select({
      kind: voiceTurn.kind,
      seatKey: voiceTurn.seatKey,
    })
    .from(voiceTurn)
    .where(
      and(eq(voiceTurn.id, referenceTurnId), eq(voiceTurn.sessionId, sessionId)),
    )
    .limit(1);
  const key = row ? authorDestKeyFromTurn(row) : null;
  if (!key) return null;
  if (isTravisSeat(key)) {
    return resolveDestBinding(sessionId, "travis");
  }
  return resolveDestBinding(sessionId, key);
}

export async function destBindingsForSend(params: {
  sessionId: string;
  decided: TypedDest;
  referenceTurnId: string | null;
}): Promise<AgentBinding[]> {
  const author = params.referenceTurnId
    ? await destFromReferencedTurn(params.sessionId, params.referenceTurnId)
    : null;
  const keys = mergeReplyDestKeys({
    decided: params.decided,
    authorKey: author?.seatKey ?? null,
  });
  const out: AgentBinding[] = [];
  for (const key of keys) {
    if (author && key === author.seatKey) {
      if (!out.some((b) => b.id === author.id)) out.push(author);
      continue;
    }
    const dest = await resolveDestBinding(params.sessionId, key);
    if (dest && !out.some((b) => b.id === dest.id)) out.push(dest);
  }
  return out;
}
