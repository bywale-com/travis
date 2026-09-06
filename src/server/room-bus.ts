import { sql } from "drizzle-orm";
import { db } from "@/server/db/client";

/** SCP-029 — other-request writes wake the room wire. Not a table. */
export async function notifyRoom(sessionId: string): Promise<void> {
  if (!sessionId) return;
  await db.execute(sql`SELECT pg_notify('travis_room', ${sessionId})`);
}
