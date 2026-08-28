import assert from "node:assert/strict";
import { test } from "node:test";
import { flushSpeakBuffer, pullClosedSentences } from "./speak-sentences";

test("holds a fragment until a sentence end plus space", () => {
  const a = pullClosedSentences("Hello there");
  assert.deepEqual(a.closed, []);
  assert.equal(a.rest, "Hello there");
  const b = pullClosedSentences("Hello there. More");
  assert.deepEqual(b.closed, ["Hello there."]);
  assert.equal(b.rest, "More");
});

test("blank line closes a unit without a period", () => {
  const r = pullClosedSentences("Bind path\n\n- quote the rail");
  assert.deepEqual(r.closed, ["Bind path"]);
  assert.equal(r.rest, "- quote the rail");
});

test("several sentences drain in order", () => {
  const r = pullClosedSentences("One. Two. Three still");
  assert.deepEqual(r.closed, ["One.", "Two."]);
  assert.equal(r.rest, "Three still");
});

test("flush speaks the leftover fragment", () => {
  assert.deepEqual(flushSpeakBuffer("Almost done"), ["Almost done"]);
  assert.deepEqual(flushSpeakBuffer("One. Tail"), ["One.", "Tail"]);
  assert.deepEqual(flushSpeakBuffer("   "), []);
});
