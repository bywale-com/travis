import assert from "node:assert/strict";
import test from "node:test";
import {
  dispatchReceipt,
  elapsedPhrase,
  inFlightReport,
  sendReceipt,
} from "./tool-receipt";

test("elapsed reads in the unit a person would say", () => {
  assert.equal(elapsedPhrase(400), "under a second");
  assert.equal(elapsedPhrase(26_000), "26s");
  assert.equal(elapsedPhrase(240_000), "4m");
});

/**
 * Lived 18:25 — the tool said "Sent to SA." after blocking 26s, so Travis
 * told the founder it had sent "two parallel messages".
 */
test("a finished send admits how long it blocked", () => {
  const text = sendReceipt({
    seatLabel: "Systems Analyst",
    queued: false,
    elapsedMs: 26_400,
    replyChars: 312,
  });
  assert.match(text, /Sent to Systems Analyst/);
  assert.match(text, /blocked for 26s/);
  assert.match(text, /312 characters/);
});

test("the receipt never carries the reply body", () => {
  const text = sendReceipt({
    seatLabel: "Engineer",
    queued: false,
    elapsedMs: 5_000,
    replyChars: 40_000,
  });
  assert.equal(text.includes("40000 characters"), true);
  assert.equal(text.length < 160, true, "receipt stays a receipt");
});

test("an errored run says so instead of claiming a reply", () => {
  const text = sendReceipt({
    seatLabel: "Product Manager",
    queued: false,
    elapsedMs: 8_000,
    errored: true,
  });
  assert.match(text, /errored/);
  assert.equal(/reply is in the room log/.test(text), false);
});

test("a finished run with no text does not invent one", () => {
  const text = sendReceipt({
    seatLabel: "Product Manager",
    queued: false,
    elapsedMs: 12_000,
    replyChars: 0,
  });
  assert.match(text, /no reply text/);
});

test("queued says it did not send, and how deep", () => {
  assert.match(
    sendReceipt({
      seatLabel: "Systems Analyst",
      queued: true,
      waitingAhead: 2,
      elapsedMs: 30,
    }),
    /2 waiting ahead of it\. Not sent yet\./,
  );
  assert.match(
    sendReceipt({
      seatLabel: "Systems Analyst",
      queued: true,
      waitingAhead: 0,
      elapsedMs: 30,
    }),
    /that seat is busy\. Not sent yet\./,
  );
});

test("in-flight reports running and waiting separately", () => {
  assert.equal(
    inFlightReport(
      [{ seatLabel: "SA", elapsedMs: 26_000 }],
      [{ seatLabel: "PM", count: 2 }],
    ),
    "Running now: SA (26s so far). Waiting: PM 2.",
  );
});

test("in-flight is honest about an idle room", () => {
  assert.equal(
    inFlightReport([], [{ seatLabel: "PM", count: 0 }]),
    "Nothing running. Nothing waiting.",
  );
});

/** Hotfix 039 — dispatch must not imply an answer came back. */
test("a started dispatch says nothing came back yet", () => {
  const text = dispatchReceipt({ status: "started", seatLabel: "Engineer" });
  assert.match(text, /Engineer is now running it/);
  assert.match(text, /Nothing came back yet/);
  assert.equal(/finished|replied/.test(text), false);
});

test("a queued dispatch names the depth and says it has not gone", () => {
  assert.match(
    dispatchReceipt({ status: "queued", seatLabel: "SA", waitingAhead: 1 }),
    /behind 1 already waiting/,
  );
  assert.match(
    dispatchReceipt({ status: "queued", seatLabel: "SA", waitingAhead: 0 }),
    /busy right now/,
  );
});

test("an unwired seat is not reported as running", () => {
  const text = dispatchReceipt({ status: "stand-in", seatLabel: "PM" });
  assert.match(text, /not wired/);
  assert.equal(/running it/.test(text), false);
});

test("a failed dispatch carries the reason", () => {
  assert.match(
    dispatchReceipt({ status: "error", seatLabel: "PM", error: "boom" }),
    /Could not start PM: boom/,
  );
});

test("a busy role dest does not claim it queued", () => {
  const text = dispatchReceipt({ status: "busy", seatLabel: "Pat" });
  assert.match(text, /does not queue/);
  assert.doesNotMatch(text, /will go when/);
});
