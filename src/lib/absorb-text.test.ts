import assert from "node:assert/strict";
import { test } from "node:test";
import {
  absorbFinalTranscript,
  absorbText,
  carryDraftAcrossRestart,
  collapseSpeechStutter,
  keepSpeechDraft,
  mergeLiveTranscript,
} from "./absorb-text";
import { parseCallByName } from "./router";

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

test("collapseSpeechStutter folds a long restart with a short hitch", () => {
  const a =
    "okay let's see what are some engineer what were some of the things we wanted to fix in this previous hotfix";
  const raw = `${a} exit again ${a} is it again okay why is it duplicating`;
  assert.equal(
    collapseSpeechStutter(raw),
    `${a} is it again okay why is it duplicating`,
  );
});

test("carryDraftAcrossRestart folds a restarted passage after junk", () => {
  const a =
    "okay let's see what are some engineer what were some of the things we wanted to fix in this previous hotfix";
  assert.equal(carryDraftAcrossRestart(a, `exit again ${a}`), a);
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

test("carryDraftAcrossRestart keeps a held sentence and appends a new clause", () => {
  assert.equal(
    carryDraftAcrossRestart(
      "Engineer look at the stream",
      "there's a second problem",
    ),
    "Engineer look at the stream there's a second problem",
  );
});

test("carryDraftAcrossRestart keeps held when the new session has no finals yet", () => {
  assert.equal(
    carryDraftAcrossRestart(
      "oh my God there's actually a second problem",
      "",
    ),
    "oh my God there's actually a second problem",
  );
});

test("carryDraftAcrossRestart folds a restarted growing concat", () => {
  assert.equal(
    carryDraftAcrossRestart(
      "Engineer can I see",
      "Engineer can I see the engineer talking",
    ),
    "Engineer can I see the engineer talking",
  );
});

test("carryDraftAcrossRestart keeps a leading seat call across a silence restart", () => {
  assert.equal(
    carryDraftAcrossRestart("Engineer", ""),
    "Engineer",
  );
  assert.equal(
    parseCallByName(
      carryDraftAcrossRestart("Engineer look at this", "there's a second problem"),
    ).seatKey,
    "engineer",
  );
});

test("keepSpeechDraft does not let an empty restart wipe a draft", () => {
  assert.equal(keepSpeechDraft("look at the log", ""), "look at the log");
  assert.equal(keepSpeechDraft("look at the log", "   "), "look at the log");
  assert.equal(
    keepSpeechDraft("look at the log", "look at the log now"),
    "look at the log now",
  );
});
