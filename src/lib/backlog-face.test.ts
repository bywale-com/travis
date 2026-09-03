import assert from "node:assert/strict";
import { test } from "node:test";
import {
  backlogAge,
  backlogNextWord,
  backlogStageKeys,
  backlogWithLine,
} from "./backlog-face";

test("next word matches the B1 right rail", () => {
  assert.equal(backlogNextWord("pm", "open"), "PM");
  assert.equal(backlogNextWord("engineer", "open"), "Eng");
  assert.equal(backlogNextWord("sa", "open"), "SA");
  assert.equal(backlogNextWord("travis", "open"), "Travis");
  assert.equal(backlogNextWord("pm", "done"), "Done");
});

test("with-line is muted status, not a button", () => {
  assert.equal(backlogWithLine("sa", "open"), "With SA");
  assert.equal(backlogWithLine(null, "done"), "Done");
});

test("B1 age is compact", () => {
  const now = Date.parse("2026-09-03T17:00:00Z");
  assert.equal(backlogAge(new Date(now - 2 * 60_000), now), "2m");
  assert.equal(backlogAge(new Date(now - 3600_000), now), "1h");
  assert.equal(backlogAge(new Date(now - 86_400_000), now), "yesterday");
});

test("stage marks are lit seats plus whose turn", () => {
  assert.deepEqual(backlogStageKeys(["travis", "pm"], "pm"), ["travis", "pm"]);
  assert.deepEqual(backlogStageKeys(["travis", "pm", "sa"], "engineer"), [
    "travis",
    "pm",
    "sa",
    "engineer",
  ]);
});
