import assert from "node:assert/strict";
import { test } from "node:test";
import { parseReadFacilitator } from "./read-facilitator";

test("stop / wait / hold on are facilitator stop", () => {
  assert.equal(parseReadFacilitator("stop"), "stop");
  assert.equal(parseReadFacilitator("Wait."), "stop");
  assert.equal(parseReadFacilitator("hey travis hold on"), "stop");
});

test("say that again is replay", () => {
  assert.equal(parseReadFacilitator("say that again"), "replay");
  assert.equal(parseReadFacilitator("okay travis say it again"), "replay");
});

test("simplify is simplify", () => {
  assert.equal(parseReadFacilitator("simplify"), "simplify");
  assert.equal(parseReadFacilitator("please simplify"), "simplify");
  assert.equal(parseReadFacilitator("say that simpler"), "simplify");
});

test("a real turn is not stolen", () => {
  assert.equal(parseReadFacilitator("stop the engineer from merging"), null);
  assert.equal(parseReadFacilitator("can you simplify the packet later"), null);
});
