import assert from "node:assert/strict";
import { test } from "node:test";
import { wrapSelection } from "./composer-format";

test("bold wraps the selected span", () => {
  const out = wrapSelection("say hello now", 4, 9, "**");
  assert.equal(out.text, "say **hello** now");
  assert.equal(out.start, 6);
  assert.equal(out.end, 11);
});

test("empty selection still plants the marks", () => {
  const out = wrapSelection("hi", 2, 2, "`");
  assert.equal(out.text, "hi``");
  assert.equal(out.start, 3);
  assert.equal(out.end, 3);
});
