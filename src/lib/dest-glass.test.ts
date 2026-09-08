import assert from "node:assert/strict";
import test from "node:test";
import {
  destGlassName,
  hideCatalogPm,
  isCatalogPm,
  isLivingCursorId,
  quoteAuthorLabel,
  quoteRailText,
  replyToLabel,
  roleDestPick,
} from "./dest-glass";

test("role dest spins only when nobody living", () => {
  assert.equal(
    roleDestPick({ idleInRoomId: "idle", livingId: "live" }),
    "idle",
  );
  assert.equal(roleDestPick({ idleInRoomId: null, livingId: "live" }), "living");
  assert.equal(roleDestPick({ idleInRoomId: null, livingId: null }), "spin");
  assert.equal(isLivingCursorId("bc-00000000-0000-0000-0000-000000000001"), true);
  assert.equal(isLivingCursorId(""), false);
  assert.equal(isLivingCursorId("pm"), false);
});

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

test("quote names who — author label, then clipped text", () => {
  assert.equal(
    quoteAuthorLabel({ kind: "agent_post", seatKey: "engineer" }),
    "Engineer",
  );
  assert.equal(
    quoteAuthorLabel({
      kind: "agent_post",
      seatKey: "technical-pm",
      label: "Technical PM",
    }),
    "Technical PM",
  );
  assert.equal(quoteAuthorLabel({ kind: "user", seatKey: "engineer" }), "You");
  assert.equal(
    quoteRailText({ authorLabel: "Engineer", text: "Stay on that line." }),
    "Engineer — Stay on that line.",
  );
  assert.equal(replyToLabel("Engineer"), "Reply to Engineer");
});
