/**
 * SCP-015 — land protocol_path before any agent_binding select (052 lesson).
 */
import { sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { ensureOsStore } from "@/server/os-house";

let sitStoreReady = false;

export async function ensureSitStore(): Promise<void> {
  if (sitStoreReady) return;
  await db.execute(sql`
    ALTER TABLE travis.agent_binding
      ADD COLUMN IF NOT EXISTS protocol_path text NOT NULL DEFAULT ''
  `);
  await ensureOsStore();
  sitStoreReady = true;
}
