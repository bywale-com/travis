import assert from "node:assert/strict";
import { test } from "node:test";
import { ROOM_TITLE_CAP, clipRoomTitle } from "./room-title";

test("empty and whitespace stay empty — Untitled is legal", () => {
  assert.equal(clipRoomTitle(""), "");
  assert.equal(clipRoomTitle("   "), "");
});

test("a short name is kept", () => {
  assert.equal(clipRoomTitle("  Gang's all here  "), "Gang's all here");
});

test("a long name is clipped on a word", () => {
  const raw = "x".repeat(20) + " " + "y".repeat(80);
  const title = clipRoomTitle(raw);
  assert.ok(title.length <= ROOM_TITLE_CAP, title);
  assert.ok(!title.endsWith(" "), title);
  assert.ok(title.startsWith("xxxxxxxxxx"), title);
});
