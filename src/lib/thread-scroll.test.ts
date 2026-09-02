import assert from "node:assert/strict";
import test from "node:test";
import {
  PIN_TOLERANCE_PX,
  distanceFromBottom,
  isPinnedToBottom,
} from "./thread-scroll";

test("resting at the bottom stays pinned", () => {
  const box = { scrollTop: 900, scrollHeight: 1500, clientHeight: 600 };
  assert.equal(distanceFromBottom(box), 0);
  assert.equal(isPinnedToBottom(box), true);
});

test("a hair off the bottom still counts as pinned", () => {
  const box = {
    scrollTop: 900 - (PIN_TOLERANCE_PX - 1),
    scrollHeight: 1500,
    clientHeight: 600,
  };
  assert.equal(isPinnedToBottom(box), true);
});

test("scrolled up to read is not pinned", () => {
  const box = { scrollTop: 200, scrollHeight: 1500, clientHeight: 600 };
  assert.equal(isPinnedToBottom(box), false);
});

test("iOS overscroll past the bottom is still pinned", () => {
  const box = { scrollTop: 960, scrollHeight: 1500, clientHeight: 600 };
  assert.equal(distanceFromBottom(box) < 0, true);
  assert.equal(isPinnedToBottom(box), true);
});

test("a thread shorter than the pane is pinned", () => {
  const box = { scrollTop: 0, scrollHeight: 300, clientHeight: 600 };
  assert.equal(isPinnedToBottom(box), true);
});

test("tolerance is adjustable", () => {
  const box = { scrollTop: 890, scrollHeight: 1500, clientHeight: 600 };
  assert.equal(isPinnedToBottom(box, 4), false);
  assert.equal(isPinnedToBottom(box, 20), true);
});
