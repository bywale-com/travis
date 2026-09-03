import assert from "node:assert/strict";
import { test } from "node:test";
import { nextUniqueSlug, seatSlugFromLabel } from "./seat-slug";

test("Auth Engineer becomes a slug", () => {
  assert.equal(seatSlugFromLabel("Auth Engineer"), "auth-engineer");
});

test("junk collapses to agent", () => {
  assert.equal(seatSlugFromLabel("???"), "agent");
});

test("collision gets a suffix", () => {
  assert.equal(nextUniqueSlug("sa", new Set(["sa"])), "sa-2");
  assert.equal(nextUniqueSlug("sa", new Set(["sa", "sa-2"])), "sa-3");
});
