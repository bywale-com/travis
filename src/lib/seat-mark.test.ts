import assert from "node:assert/strict";
import test from "node:test";
import { seatInitials, seatShortLabel, seatTintIndex } from "./seat-mark";
import { mission } from "@/theme/tokens";

test("the original cast keeps its marks", () => {
  assert.equal(seatInitials("pm"), "PM");
  assert.equal(seatInitials("sa"), "SA");
  assert.equal(seatInitials("engineer"), "ENG");
  assert.equal(seatInitials("travis"), "TRV");
});

/** The kit locked four letters and then said marks must read as unbounded. */
test("a fifth agent gets initials without anyone assigning them", () => {
  assert.equal(seatInitials("auth-engineer", "Auth Engineer"), "AE");
  assert.equal(seatInitials("qa", "QA Runner"), "QR");
  assert.equal(seatInitials("docs", "Docs"), "DOC");
  assert.equal(seatInitials("x", "Nightly Regression Bot"), "NRB");
});

test("punctuation and stray spacing do not leak into a mark", () => {
  assert.equal(seatInitials("x", "  auth   engineer!  "), "AE");
  assert.equal(seatInitials("x", "-- --"), "??");
  assert.equal(seatInitials(null, null), "??");
});

test("a tint is stable for an identity and inside the palette", () => {
  const n = mission.seatTints.length;
  const a = seatTintIndex("auth-engineer", n);
  assert.equal(a, seatTintIndex("auth-engineer", n));
  assert.equal(a >= 0 && a < n, true);
  assert.equal(seatTintIndex("anything", 0), 0);
});

test("the waiting chip never comes out blank for a new agent", () => {
  assert.equal(seatShortLabel("engineer"), "Eng");
  assert.equal(seatShortLabel("auth-engineer", "Auth Eng"), "Auth Eng");
  assert.equal(seatShortLabel("auth-engineer", null), "AE");
});

test("a long label is clipped rather than breaking the chip", () => {
  const out = seatShortLabel("x", "Nightly Regression Bot");
  assert.equal(out.length <= 11, true);
  assert.match(out, /…$/);
});
