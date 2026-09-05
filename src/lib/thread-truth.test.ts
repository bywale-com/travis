import assert from "node:assert/strict";
import test from "node:test";
import {
  isHisVoiceEcho,
  shouldDropHeardAsUser,
} from "./thread-truth";

test("his last line heard back is an echo, not a founder request", () => {
  const said = "Let me get to that.";
  assert.equal(isHisVoiceEcho("Let me get to that.", said), true);
  assert.equal(isHisVoiceEcho("let me get to that", said), true);
  assert.equal(isHisVoiceEcho("Deprecate the existing PM and create a new one.", said), false);
});

test("a chunk of his speech is still him", () => {
  assert.equal(
    isHisVoiceEcho(
      "I can create a person and sit them",
      "I can create a person and sit them on the PM protocol.",
    ),
    true,
  );
});

test("a distinct founder line is not an echo", () => {
  assert.equal(
    shouldDropHeardAsUser({
      heard: "Look at the queue drain.",
      hisLast: "Let me get to that.",
      heIsSpeaking: false,
    }),
    false,
  );
});

test("while he is speaking and the ear has no lock, drop a short fragment", () => {
  assert.equal(
    shouldDropHeardAsUser({
      heard: "let me",
      hisLast: "",
      heIsSpeaking: true,
    }),
    true,
  );
});

test("an empty hear is dropped", () => {
  assert.equal(
    shouldDropHeardAsUser({
      heard: "   ",
      hisLast: "",
      heIsSpeaking: false,
    }),
    true,
  );
});
