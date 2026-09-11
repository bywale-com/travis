/**
 * SCP-034 — official LangGraph PostgresSaver. Schema `langgraph`, not `travis`.
 * Own tiny pg.Pool. Do not share the drizzle client.
 * require() CJS entrypoints — same 080 hang as travis-deep-agent.
 */

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export const CHECKPOINTER_SCHEMA = "langgraph";
export const CHECKPOINTER_POOL_MAX = 1;

type PostgresSaver = InstanceType<
  typeof import("@langchain/langgraph-checkpoint-postgres").PostgresSaver
>;

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
  const { Pool } = require("pg") as typeof import("pg");
  const { PostgresSaver } =
    require("@langchain/langgraph-checkpoint-postgres") as typeof import("@langchain/langgraph-checkpoint-postgres");
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
