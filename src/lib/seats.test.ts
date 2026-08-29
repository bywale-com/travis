import assert from "node:assert/strict";
import { test } from "node:test";
import { isCursorSeat, isTravisSeat, isVocativeOnlyCall } from "./seats";

test("travis is not a Cursor seat", () => {
  assert.equal(isTravisSeat("travis"), true);
  assert.equal(isCursorSeat("travis"), false);
  assert.equal(isCursorSeat("engineer"), true);
});

test("hey travis remainder is vocative-only", () => {
  assert.equal(isVocativeOnlyCall("hey travis", "hey travis", "travis"), true);
  assert.equal(isVocativeOnlyCall("Travis", "", "travis"), true);
  assert.equal(
    isVocativeOnlyCall("okay travis look", "look", "travis"),
    false,
  );
});
