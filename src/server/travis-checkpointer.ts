/**
 * SCP-034 — official LangGraph PostgresSaver. Schema `langgraph`, not `travis`.
 * Own tiny pg.Pool. Do not share the drizzle client.
 * CJS load — the package's ESM entry throws on Vercel require().
 */

import { createRequire } from "node:module";
import { join } from "node:path";
import type { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { Pool } from "pg";

export const CHECKPOINTER_SCHEMA = "langgraph";
export const CHECKPOINTER_POOL_MAX = 1;

let ready: Promise<PostgresSaver> | null = null;

export async function travisCheckpointer(): Promise<PostgresSaver> {
  if (!ready) {
    ready = makeSaver().catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}

function loadPostgresSaver(): typeof import("@langchain/langgraph-checkpoint-postgres") {
  const req = createRequire(join(process.cwd(), "package.json"));
  return req("@langchain/langgraph-checkpoint-postgres");
}

async function makeSaver(): Promise<PostgresSaver> {
  const connectionString = process.env.DATABASE_URL?.trim() ?? "";
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set — LangGraph checkpointer cannot hang.",
    );
  }
  const { PostgresSaver } = loadPostgresSaver();
  const pool = new Pool({
    connectionString,
    max: CHECKPOINTER_POOL_MAX,
  });
  const saver = new PostgresSaver(pool, undefined, {
    schema: CHECKPOINTER_SCHEMA,
  });
  await saver.setup();
  return saver;
}
