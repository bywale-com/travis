import assert from "node:assert/strict";
import test from "node:test";
import { destGlassName, hideCatalogPm, isCatalogPm } from "./dest-glass";

test("catalog pm is hidden; Technical PM person stays", () => {
  assert.equal(isCatalogPm("pm"), true);
  assert.equal(isCatalogPm("technical-pm"), false);
  assert.deepEqual(
    hideCatalogPm([
      { seatKey: "pm", label: "PM" },
      { seatKey: "technical-pm", label: "Technical PM" },
      { seatKey: "engineer", label: "Engineer" },
    ]).map((s) => s.seatKey),
    ["technical-pm", "engineer"],
  );
});

test("glass name is the person label, never catalog PM", () => {
  assert.equal(destGlassName("pm"), "Technical PM");
  assert.equal(destGlassName("pm", "PM"), "Technical PM");
  assert.equal(destGlassName("technical-pm", "Technical PM"), "Technical PM");
  assert.equal(destGlassName("engineer"), "Engineer");
});
