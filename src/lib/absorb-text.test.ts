import assert from "node:assert/strict";
import { test } from "node:test";
import {
  absorbFinalTranscript,
  absorbText,
  collapseSpeechStutter,
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
