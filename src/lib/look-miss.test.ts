import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  LOOK_EMPTY,
  LOOK_SEED_MARKER,
  isWalkFile,
  parseLookBody,
  renderLookSeed,
} from "./look-miss";

test("empty note and empty turnIds is a miss", () => {
  const miss = parseLookBody({ note: "  ", turnIds: [] });
  assert.equal(miss.ok, false);
  if (!miss.ok) assert.equal(miss.reason, LOOK_EMPTY);
  assert.equal(parseLookBody({}).ok, false);
});

test("note-only is ok", () => {
  const got = parseLookBody({ note: "  Mouth never came back.  " });
  assert.deepEqual(got, {
    ok: true,
    note: "Mouth never came back.",
    turnIds: [],
  });
});

test("turnIds-only is ok", () => {
  const got = parseLookBody({
    turnIds: ["", "a", "a", "  b  "],
    note: "  ",
  });
  assert.deepEqual(got, { ok: true, note: "", turnIds: ["a", "b"] });
});

test("walk cookie equal is a dry File", () => {
  assert.equal(
    isWalkFile("walk-tok", { TRAVIS_TEST_OPERATOR_COOKIE: "walk-tok" }),
    true,
  );
  assert.equal(
    isWalkFile("walk-tok", { TRAVIS_TEST_OPERATOR_COOKIE: "other" }),
    false,
  );
  assert.equal(isWalkFile("walk-tok", {}), false);
  assert.equal(
    isWalkFile("", { TRAVIS_TEST_OPERATOR_COOKIE: "walk-tok" }),
    false,
  );
});

test("seed carries the Look staples", () => {
  const seed = renderLookSeed({
    sessionId: "11111111-1111-1111-1111-111111111111",
    turnIds: ["turn-a", "turn-b"],
    note: "Mouth never came back.",
    sha: "abc",
    deploy: "https://travis-psi.vercel.app",
    when: "2026-09-15T11:00:00.000Z",
  });
  assert.match(seed, new RegExp(LOOK_SEED_MARKER));
  assert.match(seed, /\*\*Session:\*\*/);
  assert.match(seed, /\*\*Note:\*\*/);
  assert.match(seed, /Mouth never came back/);
});

test("Look File fresh-adds wake-engineer and never outside-look", () => {
  const src = readFileSync(new URL("../server/look-github.ts", import.meta.url), "utf8");
  assert.match(src, /freshAddWakeEngineer/);
  assert.match(src, /LOOK_WAKE_LABEL = "wake-engineer"/);
  assert.match(src, /travis-look-armed/);
  assert.doesNotMatch(src, /freshAddOutsideLook/);
  assert.doesNotMatch(src, /ensureOutsideLookLabel/);
  assert.doesNotMatch(src, /name: "outside-look"/);
  assert.doesNotMatch(src, /addLabel\([\s\S]*"outside-look"/);
});
