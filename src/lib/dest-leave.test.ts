import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { destLeaveRefused } from "./dest-gate";

test("refused dest does not ticket — ensureViaTravis stays behind the leave", () => {
  assert.equal(destLeaveRefused({ class: "his" }), true);
  assert.equal(destLeaveRefused({ class: "nobody" }), true);
  assert.equal(destLeaveRefused(null), false);
});

test("create-agent has no Agent.create", () => {
  const src = readFileSync(
    join(process.cwd(), "src/server/create-agent.ts"),
    "utf8",
  );
  assert.equal(src.includes("Agent.create("), false);
});

test("chip dest files dest_job so leave starts before Cursor run_started", () => {
  const send = readFileSync(
    join(process.cwd(), "src/app/api/session/[id]/send/route.ts"),
    "utf8",
  );
  const queue = readFileSync(
    join(process.cwd(), "src/app/api/session/[id]/queue/route.ts"),
    "utf8",
  );
  assert.match(send, /insertDestJob/);
  assert.match(queue, /d\.job\.status === "created"/);
});

test("Type send stays invokeDeepAgent — no Responses cousin", () => {
  const src = readFileSync(
    join(process.cwd(), "src/server/travis-openai.ts"),
    "utf8",
  );
  assert.equal(src.includes("generateTravisTextViaResponses"), false);
  assert.match(src, /invokeDeepAgent/);
  assert.match(src, /mode: params\.mode \?\? "synthesize"/);
});

test("live transcript never pipes Travis", () => {
  const src = readFileSync(
    join(process.cwd(), "src/app/api/session/[id]/live/transcript/route.ts"),
    "utf8",
  );
  assert.equal(src.includes("pipeTravisText"), false);
  assert.match(src, /dispatchStreamIntents/);
});

test("stream-dispatch does not speak", () => {
  const src = readFileSync(
    join(process.cwd(), "src/server/stream-dispatch.ts"),
    "utf8",
  );
  assert.equal(src.includes("pipeTravisText"), false);
  assert.match(src, /handToDest/);
  assert.match(src, /destEnqueueIfBusy\("follow-up"\)/);
  assert.doesNotMatch(src, /parent_id|parentId/);
});

test("dest follow-up pins an open dest_job bind — no new job, no spin", () => {
  const src = readFileSync(
    join(process.cwd(), "src/server/travis-tools.ts"),
    "utf8",
  );
  assert.match(src, /destPathForBind/);
  assert.match(src, /followUp/);
  assert.match(src, /listOpenDestJobs/);
  assert.doesNotMatch(src, /MemorySaver/);
});
