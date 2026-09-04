import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assistantBeatsFromConversation,
  assistantTextsFromConversation,
  textFromAssistantMessage,
} from "./cursor-conversation";

test("each assistantMessage is its own text", () => {
  const parts = assistantTextsFromConversation([
    {
      turn: {
        steps: [
          { type: "assistantMessage", message: { text: "First look at the log." } },
          { type: "thinking", message: { text: "ignore" } },
          { type: "assistantMessage", message: { text: "Now the ticket door." } },
          {
            type: "assistantMessage",
            message: { content: [{ type: "text", text: "Files hang on this beat." }] },
          },
        ],
      },
    },
  ]);
  assert.deepEqual(parts, [
    "First look at the log.",
    "Now the ticket door.",
    "Files hang on this beat.",
  ]);
});

test("conversation beats stay split — not one string joined on blank lines", () => {
  const beats = assistantBeatsFromConversation([
    {
      turn: {
        steps: [
          { type: "assistantMessage", message: { text: "First look at the log." } },
          { type: "assistantMessage", message: { text: "Now the ticket door." } },
          { type: "assistantMessage", message: { text: "Files hang on this beat." } },
        ],
      },
    },
  ]);
  assert.equal(beats.length, 3);
  assert.equal(
    beats.join("\n\n").includes("\n\n"),
    true,
  );
  assert.equal(beats[0].includes("Now the ticket"), false);
});

test("text blocks concatenate inside one message only", () => {
  assert.equal(
    textFromAssistantMessage([
      { type: "text", text: "Hi " },
      { type: "text", text: "there." },
    ]),
    "Hi there.",
  );
});
