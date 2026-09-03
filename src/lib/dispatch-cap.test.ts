import assert from "node:assert/strict";
import test from "node:test";
import {
  BEAT_FALLBACK_MS,
  MAX_SEATS_PER_BEAT,
  beatSeats,
  collectBeatSends,
  guardBeatDispatch,
  normalizeDispatchText,
  siloCopyOf,
} from "./dispatch-cap";

test("the cap is two seats", () => {
  assert.equal(MAX_SEATS_PER_BEAT, 2);
});

test("same seat twice is not a new dest", () => {
  assert.deepEqual(
    beatSeats([
      { seat: "pm", text: "lock 007" },
      { seat: "pm", text: "stamp the log" },
    ]),
    ["pm"],
  );
});

test("whitespace and case do not hide a copy", () => {
  assert.equal(
    normalizeDispatchText("  Founder wants  the barge\nfix. "),
    "founder wants the barge fix.",
  );
});

test("the same line to a second seat is a silo", () => {
  const already = [{ seat: "pm", text: "Spec the hear queue." }];
  const copy = siloCopyOf(already, {
    seat: "engineer",
    text: "spec the hear queue.",
  });
  assert.equal(copy?.seat, "pm");
  const v = guardBeatDispatch(already, {
    seat: "engineer",
    text: "Spec the hear queue.",
  });
  assert.equal(v.allow, false);
  if (!v.allow) {
    assert.match(v.reason, /already sent that to PM/);
    assert.match(v.reason, /silos/);
  }
});

test("two different jobs to two seats are allowed", () => {
  const v = guardBeatDispatch([{ seat: "pm", text: "Lock the hear-queue face." }], {
    seat: "sa",
    text: "Ascribe heard/ready. Do not mint a table unless you must.",
  });
  assert.equal(v.allow, true);
});

test("a third dest is refused even with a new job", () => {
  const v = guardBeatDispatch(
    [
      { seat: "pm", text: "Lock the face." },
      { seat: "sa", text: "Ascribe the store." },
    ],
    { seat: "engineer", text: "Plant it." },
  );
  assert.equal(v.allow, false);
  if (!v.allow) {
    assert.match(v.reason, /PM and SA already have work/);
    assert.match(v.reason, /third/);
  }
});

test("a second line to a seat already on the beat is allowed", () => {
  const v = guardBeatDispatch([{ seat: "engineer", text: "Cut the cap." }], {
    seat: "engineer",
    text: "Also write the trail.",
  });
  assert.equal(v.allow, true);
});

test("this beat is dests after the last founder line", () => {
  const now = Date.parse("2026-09-03T03:05:00Z");
  const sends = collectBeatSends(
    [
      { kind: "user", seatKey: "engineer", text: "plant barge" },
      { kind: "user", seatKey: "pm", text: "lock barge" },
      { kind: "user", seatKey: "travis", text: "fix the barge" },
      { kind: "user", seatKey: "sa", text: "old membership" },
    ],
    now,
  );
  assert.deepEqual(sends, [
    { seat: "engineer", text: "plant barge" },
    { seat: "pm", text: "lock barge" },
  ]);
});

test("without a founder line, only the last two minutes count", () => {
  const now = Date.parse("2026-09-03T03:05:00Z");
  const sends = collectBeatSends(
    [
      {
        kind: "user",
        seatKey: "pm",
        text: "just now",
        createdAt: new Date(now - 10_000).toISOString(),
      },
      {
        kind: "user",
        seatKey: "sa",
        text: "hours ago",
        createdAt: new Date(now - BEAT_FALLBACK_MS - 5_000).toISOString(),
      },
    ],
    now,
  );
  assert.deepEqual(sends, [{ seat: "pm", text: "just now" }]);
});
