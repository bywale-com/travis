import assert from "node:assert/strict";
import { test } from "node:test";
import {
  absorbFinalTranscript,
  absorbText,
  collapseSpeechStutter,
  mergeLiveTranscript,
} from "./absorb-text";

test("absorbText treats snapshots as replace, not concatenate", () => {
  let acc = "";
  ({ acc } = absorbText(acc, "Switch"));
  ({ acc } = absorbText(acc, "Switching to Engineer"));
  assert.equal(acc, "Switching to Engineer");
});

test("absorbText does not double an identical delta emitted twice", () => {
  let acc = "";
  ({ acc } = absorbText(acc, "bc-"));
  ({ acc } = absorbText(acc, "bc-"));
  assert.equal(acc, "bc-");
});

test("absorbText appends a true suffix delta", () => {
  let acc = "";
  ({ acc } = absorbText(acc, "Switch"));
  const next = absorbText(acc, "ing");
  assert.equal(next.acc, "Switching");
  assert.equal(next.delta, "ing");
});

test("absorbFinalTranscript replaces growing finals", () => {
  let committed = absorbFinalTranscript("", "engineer");
  committed = absorbFinalTranscript(committed, "engineer can I see");
  assert.equal(committed, "engineer can I see");
});

test("collapseSpeechStutter flattens word and phrase repeats", () => {
  const raw =
    "engineer engineer engineer can can I see can I see can I see the engineer talking";
  assert.equal(
    collapseSpeechStutter(raw),
    "engineer can I see the engineer talking",
  );
});

test("collapseSpeechStutter folds growing concatenations from Android STT", () => {
  const raw =
    "and also what happens when I keep talking and also what happens when I keep talking like this and also what happens when I keep talking like this does it keep getting routed back to you";
  assert.equal(
    collapseSpeechStutter(raw),
    "and also what happens when I keep talking like this does it keep getting routed back to you",
  );
});

test("collapseSpeechStutter folds short growing prefixes", () => {
  assert.equal(
    collapseSpeechStutter("I don't I don't switch out of the engineer"),
    "I don't switch out of the engineer",
  );
});

test("mergeLiveTranscript does not glue committed onto an overlapping interim", () => {
  assert.equal(
    mergeLiveTranscript(
      "when I'm talking it starts",
      "when I'm talking it starts to duplicate what I'm saying",
    ),
    "when I'm talking it starts to duplicate what I'm saying",
  );
});

test("mergeLiveTranscript keeps committed when interim is only a tail already present", () => {
  assert.equal(
    mergeLiveTranscript("hello there friend", "friend"),
    "hello there friend",
  );
});
