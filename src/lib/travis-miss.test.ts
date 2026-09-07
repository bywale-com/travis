import assert from "node:assert/strict";
import { test } from "node:test";
import { isVisibleLogStatus, travisGenerateMiss } from "./travis-miss";

test("the lived ESM miss is hidden unless the line says error", () => {
  const lived = "Travis: Cannot use import statement outside a module";
  assert.equal(isVisibleLogStatus(lived), false);
  const shown = travisGenerateMiss("Cannot use import statement outside a module");
  assert.equal(shown, "Travis error: Cannot use import statement outside a module");
  assert.equal(isVisibleLogStatus(shown), true);
});

test("a message that already says error stays Travis: …", () => {
  const shown = travisGenerateMiss("OpenAI error: 500");
  assert.equal(shown, "Travis: OpenAI error: 500");
  assert.equal(isVisibleLogStatus(shown), true);
});
