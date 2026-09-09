import assert from "node:assert/strict";
import test from "node:test";
import { liveShouldPipeTravis } from "./live-harness";

test("a spoken line to Travis does not pipe on live flush", () => {
  assert.equal(
    liveShouldPipeTravis({ prompt: "are you able to do that now?", cursorDestCount: 0 }),
    false,
  );
});

test("a spoken dest to a Cursor seat does not pipe Travis think", () => {
  assert.equal(
    liveShouldPipeTravis({ prompt: "list the open tickets", cursorDestCount: 1 }),
    false,
  );
});

test("a vocative-only switch does not pipe Travis think", () => {
  assert.equal(liveShouldPipeTravis({ prompt: "", cursorDestCount: 0 }), false);
});
