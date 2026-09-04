import assert from "node:assert/strict";
import test from "node:test";
import {
  formatInitiativeList,
  formatInitiativeRead,
} from "@/server/initiative";

test("initiative list prints id so rename does not guess", () => {
  const text = formatInitiativeList([
    {
      id: "11111111-2222-3333-4444-555555555555",
      title: "Garbage title",
      foundingText: "rename this",
      status: "open",
      createdAt: new Date(),
      doneAt: null,
      source: "via_travis",
      litSeatKeys: ["pm"],
      next: "pm",
    },
  ]);
  assert.match(text, /11111111-2222-3333-4444-555555555555/);
  assert.match(text, /Garbage title/);
});

test("a q miss names the open pile instead of emptying the room", () => {
  const miss = formatInitiativeList([], { q: "compare UI", openCount: 5 });
  assert.match(miss, /No initiatives matching “compare UI”/);
  assert.match(miss, /5 open in this room/);
  assert.equal(miss.includes("No initiatives in this room."), false);
});

test("initiative read prints id", () => {
  const text = formatInitiativeRead({
    id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    title: "Artifact door",
    status: "open",
    source: "hold",
    createdAt: new Date(),
    doneAt: null,
    founding: null,
    posts: [],
    next: "travis",
    attachments: [],
  });
  assert.match(text, /aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/);
  assert.match(text, /Artifact door/);
});
