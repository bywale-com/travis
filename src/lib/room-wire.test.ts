import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  ROOM_WIRE_CLIENT_ROTATE_MS,
  ROOM_WIRE_LIFETIME_MS,
  ROOM_WIRE_MAX_DURATION_SEC,
} from "./room-wire";

function read(rel: string) {
  return readFileSync(new URL(`../../${rel}`, import.meta.url), "utf8");
}

test("room wire rotates before Hobby maxDuration", () => {
  assert.equal(ROOM_WIRE_MAX_DURATION_SEC, 60);
  assert.ok(ROOM_WIRE_LIFETIME_MS < ROOM_WIRE_MAX_DURATION_SEC * 1000);
  assert.ok(ROOM_WIRE_CLIENT_ROTATE_MS < ROOM_WIRE_LIFETIME_MS);
});

test("events route schedules lifetime close and exports maxDuration", () => {
  const route = read("src/app/api/session/[id]/events/route.ts");
  assert.match(route, /ROOM_WIRE_LIFETIME_MS/);
  assert.match(route, /ROOM_WIRE_MAX_DURATION_SEC/);
  assert.match(route, /rotateTimer/);
});

test("Room holds the wire with client rotate abort", () => {
  const room = read("src/components/Room.tsx");
  assert.match(room, /ROOM_WIRE_CLIENT_ROTATE_MS/);
});
