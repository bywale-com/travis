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

test("Type send stays invokeDeepAgent — no Responses cousin", () => {
  const src = readFileSync(
    join(process.cwd(), "src/server/travis-openai.ts"),
    "utf8",
  );
  assert.equal(src.includes("generateTravisTextViaResponses"), false);
  assert.match(src, /invokeDeepAgent/);
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
