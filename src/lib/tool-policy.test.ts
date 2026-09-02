import assert from "node:assert/strict";
import test from "node:test";
import {
  TOOL_POLICY,
  dedupeWindowFor,
  duplicateRefusal,
  guardToolCall,
  policyCoverage,
  policyFor,
} from "./tool-policy";
import { TRAVIS_TOOL_DECLS } from "@/server/travis-tools";

/**
 * The coverage assertion. Ship a tool without classifying it and this fails,
 * which is the whole point of the policy being a map instead of scattered ifs.
 */
test("every declared tool carries a policy", () => {
  const { missing } = policyCoverage(TRAVIS_TOOL_DECLS.map((d) => d.name));
  assert.deepEqual(missing, []);
});

test("coverage reports what exists by class", () => {
  const { byClass } = policyCoverage(TRAVIS_TOOL_DECLS.map((d) => d.name));
  assert.equal(byClass.terminal.includes("end_session"), true);
  assert.equal(byClass.destructive.includes("barge_or_drop"), true);
  assert.equal(byClass.write.includes("dispatch_to_seat"), true);
  assert.equal(byClass.read.includes("read_seat_reply"), true);
});

test("the policy has no entries for tools that do not exist", () => {
  const declared = new Set(TRAVIS_TOOL_DECLS.map((d) => d.name));
  const stale = Object.keys(TOOL_POLICY).filter((n) => !declared.has(n));
  assert.deepEqual(stale, []);
});

test("an unknown tool fails closed", () => {
  const v = guardToolCall("delete_everything", {});
  assert.equal(v.allow, false);
  if (!v.allow) assert.match(v.reason, /not a tool you have/);
});

test("ending the room needs a second beat", () => {
  const first = guardToolCall("end_session", {});
  assert.equal(first.allow, false);
  if (!first.allow) assert.match(first.reason, /cannot be undone/);
  assert.equal(guardToolCall("end_session", { confirm: true }).allow, true);
});

test("a truthy-looking confirm that is not true does not count", () => {
  assert.equal(guardToolCall("end_session", { confirm: "yes" }).allow, false);
  assert.equal(guardToolCall("end_session", { confirm: 1 }).allow, false);
});

test("reads and ordinary writes pass straight through", () => {
  assert.equal(guardToolCall("read_seat_reply", { seat: "sa" }).allow, true);
  assert.equal(
    guardToolCall("dispatch_to_seat", { seat: "sa", text: "go" }).allow,
    true,
  );
});

test("only sends are deduped", () => {
  assert.equal(dedupeWindowFor("send_to_seat"), 45_000);
  assert.equal(dedupeWindowFor("dispatch_to_seat"), 45_000);
  assert.equal(dedupeWindowFor("read_seat_reply"), null);
  assert.equal(dedupeWindowFor("nope"), null);
});

test("the duplicate refusal says what it refused and why", () => {
  const text = duplicateRefusal("Systems Analyst", 12);
  assert.match(text, /already sent that exact line to Systems Analyst 12s ago/);
  assert.match(text, /Not sending it twice/);
});

test("policyFor does not inherit from Object.prototype", () => {
  assert.equal(policyFor("constructor"), null);
  assert.equal(policyFor("toString"), null);
});
