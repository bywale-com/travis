import assert from "node:assert/strict";
import { test } from "node:test";
import { isCursorSeat, isTravisSeat, isVocativeOnlyCall, keepWorkAfterTravisCall } from "./seats";

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

test("trailing work plus a seat name is not vocative-only", () => {
  assert.equal(
    isVocativeOnlyCall(
      "testing audio travis",
      "testing audio travis",
      "travis",
    ),
    false,
  );
  assert.equal(
    isVocativeOnlyCall(
      "testing audio engineer",
      "testing audio engineer",
      "engineer",
    ),
    false,
  );
  assert.equal(
    keepWorkAfterTravisCall("testing audio travis", "testing audio travis"),
    "testing audio",
  );
  assert.equal(
    keepWorkAfterTravisCall("okay travis what's queued", "what's queued"),
    "what's queued",
  );
  assert.equal(keepWorkAfterTravisCall("hey travis", "hey travis"), "");
});
