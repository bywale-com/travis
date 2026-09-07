/**
 * SCP-033 — newest active seated bind of a house path with a bc- id.
 * Catalog pm is never living. No living-bind column.
 */
import { and, desc, eq } from "drizzle-orm";
import { isCatalogPm, isLivingCursorId } from "@/lib/dest-glass";
import { db } from "@/server/db/client";
import { agentBinding, type AgentBinding } from "@/server/db/schema";

export async function livingSeated(
  protocolPath: string,
): Promise<AgentBinding | null> {
  const path = protocolPath.trim();
  if (!path) return null;
  const rows = await db
    .select()
    .from(agentBinding)
    .where(
      and(eq(agentBinding.active, true), eq(agentBinding.protocolPath, path)),
    )
    .orderBy(desc(agentBinding.createdAt));
  for (const row of rows) {
    if (isCatalogPm(row.seatKey)) continue;
    if (!isLivingCursorId(row.cursorAgentId)) continue;
    return row;
  }
  return null;
}
