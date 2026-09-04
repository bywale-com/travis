import assert from "node:assert/strict";
import test from "node:test";
import { TRAVIS_SYSTEM, TRAVIS_TOOL_DECLS } from "@/server/travis-tools";

/**
 * Lived 20:41 — with 038's room window giving it engineering context for the
 * first time, Travis offered to "review the final diff", check that "the test
 * commands actually run in CI", and recommend a canary rollout. It has nine
 * tools and none of them can see a repository.
 */
test("Travis is told it cannot see the repo, diffs, tests or CI", () => {
  for (const thing of ["repository", "diff", "test run", "CI"]) {
    assert.equal(
      TRAVIS_SYSTEM.includes(thing),
      true,
      `boundary should name ${thing}`,
    );
  }
});

test("Travis is told to route repo work to a seat instead of claiming it", () => {
  assert.match(TRAVIS_SYSTEM, /cannot see it and offer to send it to the Engineer/);
  assert.match(TRAVIS_SYSTEM, /Never describe a review, a check, or an analysis you are not able to perform/);
});

test("no tool actually grants a view of the code", () => {
  const names = TRAVIS_TOOL_DECLS.map((d) => d.name);
  for (const forbidden of ["read_file", "read_diff", "run_tests", "read_ci"]) {
    assert.equal(names.includes(forbidden), false);
  }
  assert.equal(names.length, 22);
  assert.equal(names.includes("create_agent"), true);
  assert.equal(names.includes("sit_agent"), true);
  assert.equal(names.includes("search_room"), true);
  assert.equal(names.includes("list_os"), true);
  assert.equal(names.includes("read_os"), true);
  assert.equal(names.includes("write_os"), true);
  assert.equal(names.includes("list_initiatives"), true);
  assert.equal(names.includes("read_initiative"), true);
  assert.equal(names.includes("rename_initiative"), true);
  assert.equal(names.includes("rename_room"), true);
  assert.equal(names.includes("mark_initiative_done"), true);
  assert.equal(names.includes("file_plan"), true);
  assert.equal(names.includes("list_backlog"), true);
});

test("Travis is told he owns the house and that reading a protocol is not unfolding a repo", () => {
  assert.match(TRAVIS_SYSTEM, /list_os/);
  assert.match(TRAVIS_SYSTEM, /read_os/);
  assert.match(TRAVIS_SYSTEM, /write_os/);
  assert.match(TRAVIS_SYSTEM, /Reading a protocol is not unfolding it into a repo/);
});

test("Travis is told the turn is not the work", () => {
  assert.match(TRAVIS_SYSTEM, /file_plan/);
  assert.match(TRAVIS_SYSTEM, /list_backlog/);
  assert.match(TRAVIS_SYSTEM, /The turn is not the work/);
  assert.match(TRAVIS_SYSTEM, /Do not invent progress/);
});

test("Travis is told it can create a person and must not assign a role", () => {
  assert.match(TRAVIS_SYSTEM, /create_agent/);
  assert.match(TRAVIS_SYSTEM, /You do not assign a role/);
  assert.match(TRAVIS_SYSTEM, /You do not invent a Cursor id/);
});

test("Travis is told to speak short and not invent an empty backlog", () => {
  assert.match(TRAVIS_SYSTEM, /Speak short/);
  assert.match(TRAVIS_SYSTEM, /A miss is no match/);
  assert.match(TRAVIS_SYSTEM, /tools are depth/i);
  assert.match(TRAVIS_SYSTEM, /must not contradict Here/);
});

test("Travis is told seats are disposable and sit hangs a protocol", () => {
  assert.match(TRAVIS_SYSTEM, /sit_agent/);
  assert.match(TRAVIS_SYSTEM, /disposable/);
  assert.match(TRAVIS_SYSTEM, /do not queue/);
  assert.match(TRAVIS_SYSTEM, /Create is not seated/);
});
