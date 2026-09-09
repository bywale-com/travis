import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { destEnqueueIfBusy, destPathForBind } from "./dest-follow";

test("open dest_job for that bind is follow-up; else a new leave", () => {
  assert.equal(destPathForBind(true), "follow-up");
  assert.equal(destPathForBind(false), "new-leave");
  assert.equal(destEnqueueIfBusy("follow-up"), true);
  assert.equal(destEnqueueIfBusy("new-leave"), undefined);
});

test("Type invoke hangs official PostgresSaver + session thread_id", () => {
  const agent = readFileSync(
    join(process.cwd(), "src/server/travis-deep-agent.ts"),
    "utf8",
  );
  const saver = readFileSync(
    join(process.cwd(), "src/server/travis-checkpointer.ts"),
    "utf8",
  );
  assert.match(agent, /travisCheckpointer/);
  assert.match(agent, /checkpointer/);
  assert.match(agent, /thread_id:\s*params\.sessionId/);
  assert.equal(agent.includes("MemorySaver"), false);
  assert.equal(agent.includes("InMemorySaver"), false);
  assert.match(saver, /@langchain\/langgraph-checkpoint-postgres/);
  assert.match(saver, /schema:\s*CHECKPOINTER_SCHEMA/);
  assert.match(saver, /langgraph/);
  assert.equal(saver.includes("from \"@/server/db/client\""), false);
  assert.equal(saver.includes("from \"@/server/db/pool\""), false);
});
