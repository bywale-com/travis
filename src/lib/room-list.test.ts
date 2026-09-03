import assert from "node:assert/strict";
import { test } from "node:test";
import { packRoomRows } from "./room-list";

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
