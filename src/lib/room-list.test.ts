import assert from "node:assert/strict";
import { test } from "node:test";
import { orderRoomsByLastAt, packRoomRows } from "./room-list";

test("members land on their room, empty rooms stay empty", () => {
  const at = new Date("2026-09-03T17:00:00Z");
  const rows = packRoomRows(
    [
      { id: "a", title: "Gang", status: "listening", createdAt: at, endedAt: null },
      { id: "b", title: "", status: "ended", createdAt: at, endedAt: at },
    ],
    [
      { sessionId: "a", seatKey: "travis", label: "Travis" },
      { sessionId: "a", seatKey: "pm", label: "PM" },
    ],
  );
  assert.equal(rows[0].members.length, 2);
  assert.deepEqual(rows[1].members, []);
});

test("rooms with a later line sort above older created rooms", () => {
  const older = new Date("2026-08-01T00:00:00Z");
  const created = new Date("2026-09-01T00:00:00Z");
  const spoke = new Date("2026-09-03T17:00:00Z");
  const ordered = orderRoomsByLastAt(
    [
      { id: "new-empty", createdAt: created },
      { id: "old-busy", createdAt: older },
    ],
    new Map([["old-busy", spoke]]),
  );
  assert.deepEqual(
    ordered.map((r) => r.id),
    ["old-busy", "new-empty"],
  );
});
