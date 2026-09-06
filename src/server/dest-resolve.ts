/**
 * SCP-027 — dest is an open member binding. Catalog pm is never the send target.
 */
import type { AgentBinding } from "@/server/db/schema";
import { MembershipError, openBindingForSeat, requireOpenMember } from "@/server/room-membership";
import { bindingBySeatKey, resolveRoleDest, SitError } from "@/server/sit";

export async function resolveDestBinding(
  sessionId: string,
  destKey: string,
): Promise<AgentBinding | null> {
  if (destKey === "pm") {
    try {
      return await resolveRoleDest({ sessionId, role: "pm" });
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
