import assert from "node:assert/strict";
import { test } from "node:test";
import { liveWrapUtterance, matchConductorPhrase } from "./conductor";

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

test("Live wrap posts I'm done when Realtime concatenates wrap before dest", () => {
  assert.equal(
    liveWrapUtterance(
      "I'm done. Engineer, this is a Travis runtime canary. Acknowledge only.",
      PHRASES,
    ),
    "I'm done",
  );
});

test("Live wrap is finalize I'm done — dest already landed on transcript", () => {
  assert.equal(
    liveWrapUtterance("look at the log I'm done", PHRASES),
    "I'm done",
  );
});

test("I'm done with the rest of a sentence is not a Live wrap prefix", () => {
  assert.equal(
    liveWrapUtterance(
      "I'm done with the migration file and it needs review",
      PHRASES,
    ),
    null,
  );
});
