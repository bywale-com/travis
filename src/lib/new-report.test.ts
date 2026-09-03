import assert from "node:assert/strict";
import test from "node:test";
import {
  collectNewReports,
  isNewReportTurn,
  newCutTurnId,
  newReportBeat,
  newReportChip,
  newReportSeats,
} from "./new-report";

test("only speakable cursor posts are New", () => {
  assert.equal(
    isNewReportTurn({ id: "1", kind: "agent_post", seatKey: "engineer" }),
    true,
  );
  assert.equal(
    isNewReportTurn({
      id: "2",
      kind: "agent_post",
      seatKey: "travis",
      speakable: false,
    }),
    false,
  );
  assert.equal(
    isNewReportTurn({ id: "3", kind: "user", seatKey: "engineer" }),
    false,
  );
});

test("history before the baseline is not New", () => {
  const fresh = collectNewReports(
    [
      { id: "old", seq: 4, kind: "agent_post", seatKey: "pm" },
      { id: "new", seq: 9, kind: "agent_post", seatKey: "engineer" },
    ],
    4,
  );
  assert.deepEqual(fresh.map((t) => t.id), ["new"]);
});

test("the chip names seats and never says waiting", () => {
  assert.equal(newReportChip([{ seatKey: "engineer" }]), "1 new · Eng");
  assert.equal(
    newReportChip([{ seatKey: "engineer" }, { seatKey: "sa" }]),
    "2 new · Eng, SA",
  );
  assert.equal(newReportChip([]), "");
  assert.equal(newReportChip([{ seatKey: "engineer" }]).includes("waiting"), false);
});

test("the beat names the seat and does not read a body", () => {
  assert.equal(
    newReportBeat([{ seatKey: "engineer" }]),
    "Engineer has something new.",
  );
  assert.equal(
    newReportBeat([{ seatKey: "engineer" }, { seatKey: "sa" }]),
    "Engineer and SA have something new.",
  );
});

test("unique seats keep first-seen order", () => {
  assert.deepEqual(
    newReportSeats([
      { id: "a", kind: "agent_post", seatKey: "engineer" },
      { id: "b", kind: "agent_post", seatKey: "engineer" },
      { id: "c", kind: "agent_post", seatKey: "sa" },
    ]),
    [{ seatKey: "engineer" }, { seatKey: "sa" }],
  );
});

test("the New cut sits on the first unseen id", () => {
  assert.equal(newCutTurnId(["old", "mid", "fresh"], new Set(["fresh"])), "fresh");
  assert.equal(newCutTurnId(["old"], new Set(["fresh"])), null);
});
