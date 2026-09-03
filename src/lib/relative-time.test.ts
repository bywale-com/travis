import assert from "node:assert/strict";
import { test } from "node:test";
import { elapsedLabel, relativeTime } from "./relative-time";

const now = Date.parse("2026-09-03T12:00:00Z");

test("elapsed is seconds, then minutes", () => {
  assert.equal(elapsedLabel(38_000), "38s");
  assert.equal(elapsedLabel(134_000), "2m 14s");
});

test("fresh is just now", () => {
  assert.equal(relativeTime(new Date(now - 10_000), now), "just now");
});

test("minutes and hours", () => {
  assert.equal(relativeTime(new Date(now - 2 * 60_000), now), "2m ago");
  assert.equal(relativeTime(new Date(now - 3600_000), now), "1h ago");
});

test("yesterday then days", () => {
  assert.equal(relativeTime(new Date(now - 90_000_000), now), "yesterday");
  assert.equal(relativeTime(new Date(now - 3 * 86_400_000), now), "3d ago");
});
