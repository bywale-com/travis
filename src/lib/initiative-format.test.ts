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
  assert.match(miss, /Do not substitute another ticket/);
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
    destLines: [],
    streams: [],
    next: "travis",
    attachments: [],
  });
  assert.match(text, /aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/);
  assert.match(text, /Artifact door/);
});

test("ticket read names dest lines, every seat post, and Stream", () => {
  const text = formatInitiativeRead({
    id: "bbbbbbbb-cccc-dddd-eeee-ffffffffffff",
    title: "Serve plates",
    status: "open",
    source: "via_travis",
    createdAt: new Date(),
    doneAt: null,
    founding: {
      id: "f1",
      text: "Do the serve walk",
      seatKey: "travis",
      createdAt: new Date(),
    },
    destLines: [
      {
        id: "d1",
        seatKey: "engineer",
        text: "Put a short note on this ticket",
        createdAt: new Date(),
      },
    ],
    posts: [
      {
        id: "p1",
        kind: "agent_post",
        seatKey: "engineer",
        text: "First note",
        createdAt: new Date(),
      },
      {
        id: "p2",
        kind: "agent_post",
        seatKey: "engineer",
        text: "Second note",
        createdAt: new Date(),
      },
    ],
    streams: [
      {
        id: "s1",
        closeTurnId: "p2",
        triggerText: "Put a short note on this ticket",
        status: "completed",
      },
    ],
    next: "travis",
    attachments: [],
  });
  assert.match(text, /dest engineer/);
  assert.match(text, /First note/);
  assert.match(text, /Second note/);
  assert.match(text, /Stream:/);
  assert.equal(text.includes("No seat has posted"), false);
});

test("empty read stays honest when no cursor seat posted and no Stream", () => {
  const text = formatInitiativeRead({
    id: "cccccccc-dddd-eeee-ffff-000000000000",
    title: "Empty",
    status: "open",
    source: "hold",
    createdAt: new Date(),
    doneAt: null,
    founding: null,
    posts: [],
    destLines: [],
    streams: [],
    next: "travis",
    attachments: [],
  });
  assert.match(text, /No seat has posted on this ticket/);
});
