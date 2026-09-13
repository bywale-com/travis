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
  assert.match(src, /mode: params\.mode \?\? "synthesize"/);
});

test("live transcript dest write-and-leaves — SSE headers before Cursor handoff", () => {
  const src = readFileSync(
    join(process.cwd(), "src/app/api/session/[id]/live/transcript/route.ts"),
    "utf8",
  );
  assert.match(src, /fileDestJobsForSeatKeys/);
  assert.match(src, /writeAndLeaveDest/);
  assert.match(src, /dispatchStreamIntents/);
  assert.match(src, /sseHeaders/);
  assert.match(src, /send\("done"/);
  assert.match(src, /: ping/);
  assert.match(src, /destFail/);
  assert.equal(src.includes("sendOrEnqueueMany"), false);
  assert.equal(src.includes("pipeTravisText"), false);
  assert.doesNotMatch(
    src,
    /if \(prompt && cursorDests\.length\) \{\s*await runMotionRunner/,
  );
});

test("writeAndLeaveDest files dest_job before Cursor handoff returns", () => {
  const src = readFileSync(
    join(process.cwd(), "src/server/dest-leave.ts"),
    "utf8",
  );
  assert.match(src, /dispatchToRoleDest/);
  assert.match(src, /insertDestJob/);
  assert.match(src, /markDestJob/);
  assert.match(src, /LEAVE_HANDOFF_MS/);
  assert.match(src, /status: "dispatched"/);
  assert.match(src, /fileDestJobsForSeatKeys/);
  assert.match(src, /destBindingForSeatKey/);
  assert.match(src, /isFounderOpsDestError/);
  assert.match(src, /hard limit/);
  assert.doesNotMatch(src, /status: "failed"/);
  const insertAt = src.indexOf("insertDestJob");
  const handoffAt = src.indexOf("handoff(params)");
  assert.ok(insertAt >= 0 && handoffAt > insertAt);
});

test("dest stream Cursor miss does not fail dest_job", () => {
  const src = readFileSync(
    join(process.cwd(), "src/server/seat-pipe.ts"),
    "utf8",
  );
  const fn = src.slice(src.indexOf("async function driveDestCursorEvents"));
  const body = fn.slice(0, fn.indexOf("export async function continueDestStream"));
  const job = body.slice(body.indexOf("if (params.destJobId"));
  assert.match(job, /if \(params\.destJobId && !failed\)/);
  assert.doesNotMatch(job, /status: "failed"/);
});

test("role dest resolve does not await sit handoff", () => {
  const src = readFileSync(join(process.cwd(), "src/server/sit.ts"), "utf8");
  assert.match(src, /void sitBinding\(/);
});

test("direct bind dest uses the open member — no force-sit", () => {
  const dest = readFileSync(
    join(process.cwd(), "src/server/dest-resolve.ts"),
    "utf8",
  );
  assert.match(dest, /destKeysForSeat/);
  assert.match(dest, /sitRoleFromAlias/);
  assert.match(dest, /isLivingCursorId/);
  const leave = readFileSync(
    join(process.cwd(), "src/server/dest-leave.ts"),
    "utf8",
  );
  assert.match(leave, /destKeysForSeat/);
  assert.match(leave, /protocolPath \?\? ""/);
  const sit = readFileSync(join(process.cwd(), "src/server/sit.ts"), "utf8");
  const fn = sit.slice(sit.indexOf("export async function resolveRoleDest"));
  const body = fn.slice(0, fn.indexOf("export async function listSeatRoster"));
  assert.doesNotMatch(body, /void sitBinding\(/);
});

test("role dest reuses catalog living bind before Cursor spin", () => {
  const src = readFileSync(join(process.cwd(), "src/server/sit.ts"), "utf8");
  const fn = src.slice(src.indexOf("export async function resolveRoleDest"));
  const body = fn.slice(0, fn.indexOf("export async function listSeatRoster"));
  const catalogAt = body.indexOf("bindingBySeatKey(params.role)");
  const spinAt = body.lastIndexOf("spinSeatedRole");
  assert.ok(catalogAt >= 0 && spinAt > catalogAt);
});

test("Deep Agents kit loads through CJS require, not a static ESM import", () => {
  const src = readFileSync(
    join(process.cwd(), "src/server/travis-deep-agent.ts"),
    "utf8",
  );
  assert.equal(src.includes('from "deepagents/node"'), false);
  assert.match(src, /requireDeepAgents\("deepagents\/node"\)/);
  assert.match(src, /createRequire/);
});

test("runtime transcript door consumes dest SSE so the leave can start before wrap", () => {
  const src = readFileSync(join(process.cwd(), "src/runtime/doors.ts"), "utf8");
  const fn = src.slice(src.indexOf("export async function transcript"));
  const body = fn.slice(0, fn.indexOf("export async function finalize"));
  assert.match(body, /consumeSse/);
});

test("type send uses writeAndLeaveDest for chip dests", () => {
  const src = readFileSync(
    join(process.cwd(), "src/app/api/session/[id]/send/route.ts"),
    "utf8",
  );
  assert.match(src, /fileDestJobsForSeatKeys/);
  assert.match(src, /writeAndLeaveDest/);
  assert.match(src, /destFail/);
  assert.equal(src.includes("sendOrEnqueueMany"), false);
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
