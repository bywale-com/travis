import assert from "node:assert/strict";
import test from "node:test";
import { describeTurn, LINE_CAP } from "./room-context";
import {
  assembleDestWithContext,
  isDestWithContextAsk,
  unclippedPrint,
} from "./dest-with-context";

const DEST_SENTENCE =
  "Send that list as context to Technical PM, including what we just discussed here.";
const INSTRUCTION_ONLY = "Tell Technical PM the ticket is named X.";

test("isDestWithContextAsk true on the 014 dest sentence", () => {
  assert.equal(isDestWithContextAsk(DEST_SENTENCE), true);
  assert.equal(isDestWithContextAsk(DEST_SENTENCE.toUpperCase()), true);
});

test("isDestWithContextAsk false on instruction-only dest", () => {
  assert.equal(isDestWithContextAsk(INSTRUCTION_ONLY), false);
});

test("assembleDestWithContext keeps a 2086-character Travis post that describeTurn clips", () => {
  const post = "x".repeat(2086);
  const clipped = describeTurn(
    { kind: "agent_post", seatKey: "travis", text: post },
    "Travis",
  );
  assert.ok(clipped.length <= "You said: ".length + LINE_CAP + 1);
  assert.equal(clipped.includes(post), false);

  const print = unclippedPrint([
    {
      kind: "user",
      seatKey: "travis",
      text: "List the open initiatives in this room, in order.",
    },
    {
      kind: "agent_post",
      seatKey: "travis",
      seatLabel: "Travis",
      text: post,
      speakable: true,
    },
  ]);
  const prompt = assembleDestWithContext({ ask: DEST_SENTENCE, print });
  assert.equal(prompt.includes(post), true);
  assert.notEqual(prompt, clipped);
  assert.equal(prompt.startsWith(`${DEST_SENTENCE}\n\nTravis: `), true);
});
