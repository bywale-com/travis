import assert from "node:assert/strict";
import { test } from "node:test";
import {
  groupQueueSeats,
  headItem,
  queuedBlockLabel,
  shouldQueueForSeat,
  waitingChipLabel,
} from "./queue-logic";

test("waiting chip matches C4 copy", () => {
  assert.equal(waitingChipLabel(1, "engineer"), "1 waiting · Eng");
  assert.equal(waitingChipLabel(2, "pm"), "2 waiting · PM");
});

test("queued block matches C3 copy", () => {
  assert.equal(queuedBlockLabel("engineer"), "Queued · Eng");
  assert.equal(queuedBlockLabel("sa"), "Queued · SA");
});

test("head is the smallest seq still present", () => {
  const head = headItem([
    { id: "b", seq: 4 },
    { id: "a", seq: 2 },
    { id: "c", seq: 9 },
  ]);
  assert.equal(head?.id, "a");
  assert.equal(headItem([]), null);
});

test("groupQueueSeats omits empty seats and keeps per-seat order", () => {
  const snap = groupQueueSeats(
    [
      {
        id: "2",
        seatKey: "engineer",
        seq: 2,
        text: "second",
        createdAt: "2026-08-27T00:00:02.000Z",
      },
      {
        id: "1",
        seatKey: "engineer",
        seq: 1,
        text: "first",
        createdAt: "2026-08-27T00:00:01.000Z",
      },
      {
        id: "p",
        seatKey: "pm",
        seq: 1,
        text: "pm line",
        createdAt: "2026-08-27T00:00:03.000Z",
      },
    ],
    { engineer: "Engineer", pm: "PM" },
  );
  assert.equal(snap.seats.length, 2);
  assert.equal(snap.seats[0].seatKey, "pm");
  assert.equal(snap.seats[1].seatKey, "engineer");
  assert.equal(snap.seats[1].items.map((i) => i.id).join(","), "1,2");
  assert.equal(snap.seats.find((s) => s.seatKey === "sa"), undefined);
});

test("queue is per-seat and only when Cursor still has an active run", () => {
  assert.equal(
    shouldQueueForSeat({ hasLiveRow: true, cursorHasActiveRun: true }),
    true,
  );
  assert.equal(
    shouldQueueForSeat({ hasLiveRow: true, cursorHasActiveRun: false }),
    false,
  );
  assert.equal(
    shouldQueueForSeat({ hasLiveRow: false, cursorHasActiveRun: true }),
    false,
  );
  assert.equal(
    shouldQueueForSeat({ hasLiveRow: false, cursorHasActiveRun: false }),
    false,
  );
});
