/**
 * SCP-034 — official LangGraph PostgresSaver. Schema `langgraph`, not `travis`.
 * Own tiny pg.Pool. Do not share the drizzle client.
 * 086 — lazy createRequire() so Vercel does not webpack import() ESM.
 */

import type { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

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

async function makeSaver(): Promise<PostgresSaver> {
  const connectionString = process.env.DATABASE_URL?.trim() ?? "";
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set — LangGraph checkpointer cannot hang.",
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createRequire } = require("node:module") as typeof import("node:module");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require("node:path") as typeof import("node:path");
  const req = createRequire(path.join(process.cwd(), "package.json"));
  const { PostgresSaver: PostgresSaverCtor } = req(
    "@langchain/langgraph-checkpoint-postgres",
  ) as typeof import("@langchain/langgraph-checkpoint-postgres");
  const { Pool } = req("pg") as typeof import("pg");
  const pool = new Pool({
    connectionString,
    max: CHECKPOINTER_POOL_MAX,
  });
  const saver = new PostgresSaverCtor(pool, undefined, {
    schema: CHECKPOINTER_SCHEMA,
  });
  await saver.setup();
  return saver;
}
