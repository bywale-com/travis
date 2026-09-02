import assert from "node:assert/strict";
import { test } from "node:test";
import { matchConductorPhrase } from "./conductor";

const PHRASES = [
  "I'm done with this message",
  "I'm done with this",
  "I'm done talking",
  "I'm done",
];

test("I'm done at the end sends — prompt kept", () => {
  const m = matchConductorPhrase(
    "look at the log I'm done",
    PHRASES,
  );
  assert.equal(m.matched, true);
  assert.equal(m.cleanedText, "look at the log");
});

test("I'm done alone matches", () => {
  const m = matchConductorPhrase("I'm done", PHRASES);
  assert.equal(m.matched, true);
  assert.equal(m.cleanedText, "");
});

test("STT I am done is the same phrase", () => {
  const m = matchConductorPhrase("look at the log I am done", PHRASES);
  assert.equal(m.matched, true);
  assert.equal(m.cleanedText, "look at the log");
});

test("a real sentence without the phrase does not match", () => {
  const m = matchConductorPhrase("I am not done thinking about this", PHRASES);
  assert.equal(m.matched, false);
});
