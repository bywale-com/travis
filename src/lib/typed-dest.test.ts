import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveTypedSend } from "./typed-dest";

test("empty field with no chip is a no-op", () => {
  assert.equal(resolveTypedSend({ chipSeatKeys: [], text: "  " }).kind, "empty");
});

test("one chip wins dest and skips hey engineer in the body", () => {
  const r = resolveTypedSend({
    chipSeatKeys: ["sa"],
    text: "hey engineer look at this",
  });
  assert.equal(r.kind, "send");
  if (r.kind === "send") {
    assert.deepEqual(r.seatKeys, ["sa"]);
    assert.equal(r.prompt, "hey engineer look at this");
  }
});

test("several chips fan out and skip vocative parse", () => {
  const r = resolveTypedSend({
    chipSeatKeys: ["engineer", "sa"],
    text: "hey pm both of you look",
  });
  assert.equal(r.kind, "send");
  if (r.kind === "send") {
    assert.deepEqual(r.seatKeys, ["engineer", "sa"]);
    assert.equal(r.prompt, "hey pm both of you look");
  }
});

test("duplicate chips collapse", () => {
  const r = resolveTypedSend({
    chipSeatKeys: ["sa", "sa", "engineer"],
    text: "hi",
  });
  assert.equal(r.kind, "send");
  if (r.kind === "send") assert.deepEqual(r.seatKeys, ["sa", "engineer"]);
});

test("chips with empty text is switch-only to the last chip", () => {
  const r = resolveTypedSend({ chipSeatKeys: ["pm", "engineer"], text: "" });
  assert.equal(r.kind, "switch");
  if (r.kind === "switch") assert.equal(r.seatKey, "engineer");
});

test("legacy chipSeatKey still wins", () => {
  const r = resolveTypedSend({
    chipSeatKey: "sa",
    text: "hey engineer look at this",
  });
  assert.equal(r.kind, "send");
  if (r.kind === "send") assert.deepEqual(r.seatKeys, ["sa"]);
});

test("no chip uses vocative parse", () => {
  const r = resolveTypedSend({ chipSeatKeys: [], text: "hey engineer look" });
  assert.equal(r.kind, "send");
  if (r.kind === "send") {
    assert.deepEqual(r.seatKeys, ["engineer"]);
    assert.equal(r.prompt, "look");
  }
});

test("no chip and no name stays sticky", () => {
  const r = resolveTypedSend({ chipSeatKeys: [], text: "look at the log" });
  assert.equal(r.kind, "send");
  if (r.kind === "send") {
    assert.deepEqual(r.seatKeys, []);
    assert.equal(r.prompt, "look at the log");
  }
});

test("Type @ Travis is a dest", () => {
  const r = resolveTypedSend({
    chipSeatKeys: ["travis"],
    text: "what's waiting",
  });
  assert.equal(r.kind, "send");
  if (r.kind === "send") assert.deepEqual(r.seatKeys, ["travis"]);
});

test("mixed Travis + Engineer chips fan out", () => {
  const r = resolveTypedSend({
    chipSeatKeys: ["travis", "engineer"],
    text: "look at this",
  });
  assert.equal(r.kind, "send");
  if (r.kind === "send") {
    assert.deepEqual(r.seatKeys, ["travis", "engineer"]);
  }
});
