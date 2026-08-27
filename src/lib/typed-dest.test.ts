import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveTypedSend } from "./typed-dest";

test("empty field with no chip is a no-op", () => {
  assert.equal(resolveTypedSend({ chipSeatKey: null, text: "  " }).kind, "empty");
});

test("chip wins dest and skips hey engineer in the body", () => {
  const r = resolveTypedSend({
    chipSeatKey: "sa",
    text: "hey engineer look at this",
  });
  assert.equal(r.kind, "send");
  if (r.kind === "send") {
    assert.equal(r.seatKey, "sa");
    assert.equal(r.prompt, "hey engineer look at this");
  }
});

test("chip with empty text is switch-only", () => {
  const r = resolveTypedSend({ chipSeatKey: "engineer", text: "" });
  assert.equal(r.kind, "switch");
  if (r.kind === "switch") assert.equal(r.seatKey, "engineer");
});

test("no chip uses vocative parse", () => {
  const r = resolveTypedSend({ chipSeatKey: null, text: "hey engineer look" });
  assert.equal(r.kind, "send");
  if (r.kind === "send") {
    assert.equal(r.seatKey, "engineer");
    assert.equal(r.prompt, "look");
  }
});

test("no chip and no name stays sticky", () => {
  const r = resolveTypedSend({ chipSeatKey: null, text: "look at the log" });
  assert.equal(r.kind, "send");
  if (r.kind === "send") {
    assert.equal(r.seatKey, null);
    assert.equal(r.prompt, "look at the log");
  }
});
