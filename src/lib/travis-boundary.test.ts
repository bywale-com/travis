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

test("Travis is told not to spray a beat to every seat", () => {
  assert.match(TRAVIS_SYSTEM, /Route one seat at a time/);
  assert.match(TRAVIS_SYSTEM, /Never three/);
  assert.match(TRAVIS_SYSTEM, /silos/);
});

test("no tool actually grants a view of the code", () => {
  const names = TRAVIS_TOOL_DECLS.map((d) => d.name);
  for (const forbidden of ["read_file", "read_diff", "run_tests", "read_ci"]) {
    assert.equal(names.includes(forbidden), false);
  }
  assert.equal(names.length, 10);
  assert.equal(names.includes("search_room"), true);
});
