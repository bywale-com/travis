import assert from "node:assert/strict";
import test from "node:test";
import {
  parseStay,
  stayOnEnter,
  stayOnLeave,
  stayOnScroll,
} from "./stay";

test("stay JSON is room or index and keeps the session", () => {
  const room = parseStay(
    JSON.stringify({
      sessionId: "abc",
      plate: "room",
      scrollTurnId: "t1",
      scrollOffsetPx: 12,
    }),
  );
  assert.deepEqual(room, {
    sessionId: "abc",
    plate: "room",
    scrollTurnId: "t1",
    scrollOffsetPx: 12,
  });
  assert.equal(parseStay(JSON.stringify({ plate: "index", sessionId: "" }))?.plate, "index");
  assert.equal(parseStay("nope"), null);
  assert.equal(parseStay(JSON.stringify({ plate: "room" })), null);
});

test("enter writes room; leave writes index; scroll keeps the turn", () => {
  const writes: string[] = [];
  const store: Record<string, string> = {};
  (globalThis as { window?: unknown }).window = {
    localStorage: {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
        writes.push(v);
      },
    },
  };
  stayOnEnter("s1");
  assert.equal(JSON.parse(writes.at(-1) ?? "").plate, "room");
  stayOnScroll("s1", "turn-9", 4);
  assert.deepEqual(JSON.parse(writes.at(-1) ?? ""), {
    sessionId: "s1",
    plate: "room",
    scrollTurnId: "turn-9",
    scrollOffsetPx: 4,
  });
  stayOnLeave("s1");
  assert.equal(JSON.parse(writes.at(-1) ?? "").plate, "index");
});
