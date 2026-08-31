import assert from "node:assert/strict";
import { test } from "node:test";
import { isLoggedTurn, isQuietStatus } from "./turn-view";

test("conversation turns show", () => {
  assert.equal(isLoggedTurn("user"), true);
  assert.equal(isLoggedTurn("agent_post"), true);
  assert.equal(isLoggedTurn("travis_prompt"), true);
});

test("a Travis failure is shown, not swallowed", () => {
  // insertStatusTurn writes kind "status" for: Travis isn't wired, a model
  // error, and an empty reply. Hiding it is why Travis looked silent.
  assert.equal(isLoggedTurn("status"), true);
});

test("thinking stays off the log — hygiene, not triage", () => {
  assert.equal(isLoggedTurn("agent_thought"), false);
});

test("an unknown kind does not leak onto the glass", () => {
  assert.equal(isLoggedTurn("tool_spam"), false);
  assert.equal(isLoggedTurn(null), false);
  assert.equal(isLoggedTurn(undefined), false);
});

test("status renders quiet, everything else does not", () => {
  assert.equal(isQuietStatus("status"), true);
  assert.equal(isQuietStatus("agent_post"), false);
  assert.equal(isQuietStatus("user"), false);
});
