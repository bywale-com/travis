import assert from "node:assert/strict";
import { test } from "node:test";
import {
  maxTurnSeq,
  mergeTurnsById,
  openDoorTick,
  parseAfterSeq,
} from "./list-live";

test("afterSeq is an integer or the full tape", () => {
  assert.equal(parseAfterSeq(null), null);
  assert.equal(parseAfterSeq(""), null);
  assert.equal(parseAfterSeq("  "), null);
  assert.equal(parseAfterSeq("1.5"), null);
  assert.equal(parseAfterSeq("seq"), null);
  assert.equal(parseAfterSeq("12"), 12);
  assert.equal(parseAfterSeq("0"), 0);
});

test("merge keeps omitted rows and replaces by id", () => {
  const prev = [
    { id: "a", seq: 1, text: "old a" },
    { id: "b", seq: 2, text: "old b" },
  ];
  const next = mergeTurnsById(prev, [
    { id: "b", seq: 2, text: "new b" },
    { id: "c", seq: 3, text: "c" },
  ]);
  assert.deepEqual(
    next.map((t) => [t.id, t.text]),
    [
      ["a", "old a"],
      ["b", "new b"],
      ["c", "c"],
    ],
  );
});

test("empty delta does not blank the tape", () => {
  const prev = [{ id: "a", seq: 1, text: "keep" }];
  assert.deepEqual(mergeTurnsById(prev, []), prev);
});

test("tick paints the open door only", () => {
  assert.deepEqual(
    openDoorTick({
      plate: "index",
      door: null,
      ticketId: null,
      sessionId: null,
    }),
    { kind: "rooms" },
  );
  assert.deepEqual(
    openDoorTick({
      plate: "room",
      door: "backlog",
      ticketId: "t1",
      sessionId: "s1",
    }),
    { kind: "ticket", id: "t1" },
  );
  assert.deepEqual(
    openDoorTick({
      plate: "room",
      door: "backlog",
      ticketId: null,
      sessionId: "s1",
    }),
    { kind: "backlog" },
  );
  assert.deepEqual(
    openDoorTick({
      plate: "room",
      door: null,
      ticketId: null,
      sessionId: "s1",
    }),
    { kind: "room", sessionId: "s1" },
  );
  assert.deepEqual(
    openDoorTick({
      plate: "create",
      door: null,
      ticketId: null,
      sessionId: null,
    }),
    { kind: "idle" },
  );
});

test("max seq is the afterSeq cursor", () => {
  assert.equal(maxTurnSeq([]), null);
  assert.equal(
    maxTurnSeq([
      { seq: 2 },
      { seq: 9 },
      { seq: 4 },
    ]),
    9,
  );
});
