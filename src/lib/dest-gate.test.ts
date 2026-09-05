import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyDestPrompt,
  classifyOpenMember,
  destHeartbeatLabel,
  destHeartbeatState,
  hisWorkReceipt,
  isHisWork,
  nobodyReceipt,
} from "./dest-gate";

test("create sit prove unfold are his, not mail", () => {
  assert.equal(isHisWork("sit Pat on sa"), true);
  assert.equal(isHisWork("prove the box"), true);
  assert.equal(isHisWork("unfold the work-repo template"), true);
  assert.deepEqual(classifyDestPrompt("create a new PM"), { class: "his" });
  assert.equal(classifyDestPrompt("look at the queue drain"), null);
});

test("deprecate without an unseat write is nobody", () => {
  assert.equal(isHisWork("deprecate the existing PM"), false);
  assert.deepEqual(classifyDestPrompt("deprecate the existing PM"), {
    class: "nobody",
    hole: "unseat",
  });
});

test("a Cursor bc- rebind is nobody, not a send", () => {
  assert.deepEqual(
    classifyDestPrompt("rebind the PM to bc-1234-abcd"),
    { class: "nobody", hole: "rebind" },
  );
});

test("empty protocol is nobody — catalog slug does not become theirs", () => {
  assert.deepEqual(
    classifyOpenMember({
      binding: { protocolPath: "", cursorAgentId: "bc-aaa" },
    }),
    { class: "nobody", hole: "not_seated" },
  );
  assert.deepEqual(
    classifyOpenMember({ binding: null }),
    { class: "nobody", hole: "vacant" },
  );
  assert.deepEqual(
    classifyOpenMember({
      binding: { protocolPath: "/protocols/pm.md", cursorAgentId: "bc-aaa" },
    }),
    { class: "theirs" },
  );
});

test("nobody receipts name the hole and offer Engineer", () => {
  assert.match(
    nobodyReceipt({ hole: "catalog", label: "PM" }),
    /not seated/,
  );
  assert.match(nobodyReceipt({ hole: "catalog", label: "PM" }), /Engineer/);
  assert.match(nobodyReceipt({ hole: "unseat", label: "PM" }), /no unseat/);
  assert.match(hisWorkReceipt(), /will not send/);
});

test("null ping is quiet; old ping is stale; fresh is Ns ago", () => {
  const now = Date.parse("2026-09-05T04:00:00Z");
  assert.equal(destHeartbeatState(null, now), "quiet");
  assert.equal(destHeartbeatLabel(null, now), "");
  assert.equal(destHeartbeatState(new Date(now - 16_000), now), "stale");
  assert.equal(destHeartbeatLabel(new Date(now - 16_000), now), "stale");
  assert.equal(destHeartbeatState(new Date(now - 2_000), now), "live");
  assert.equal(destHeartbeatLabel(new Date(now - 2_000), now), "2s ago");
});
