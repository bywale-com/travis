import assert from "node:assert/strict";
import { test } from "node:test";
import {
  clipOsBody,
  OS_BODY_MAX,
  parentOsPath,
  parseOsPath,
} from "./os-path";

test("root is legal", () => {
  assert.deepEqual(parseOsPath("/"), {
    ok: true,
    path: "/",
    name: "",
    segments: [],
  });
});

test("convention file path is legal", () => {
  const parsed = parseOsPath("/protocols/pm.md");
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.name, "pm.md");
    assert.deepEqual(parsed.segments, ["protocols", "pm.md"]);
  }
});

test("relative, dots, and trailing slash are refused", () => {
  assert.equal(parseOsPath("protocols/pm.md").ok, false);
  assert.equal(parseOsPath("../secret").ok, false);
  assert.equal(parseOsPath("/protocols/../secret").ok, false);
  assert.equal(parseOsPath("/protocols/").ok, false);
  assert.equal(parseOsPath("/protocols//pm.md").ok, false);
  assert.equal(parseOsPath("/protocols/./pm.md").ok, false);
});

test("rooms and agents are not OS folders", () => {
  assert.equal(parseOsPath("/rooms").ok, false);
  assert.equal(parseOsPath("/rooms/0e8875f8-283b-4dae-bf54-76c82a05b6ef").ok, false);
  assert.equal(parseOsPath("/agents/maya").ok, false);
});

test("parent of a file is its dir", () => {
  assert.equal(parentOsPath("/protocols/pm.md"), "/protocols");
  assert.equal(parentOsPath("/protocols"), "/");
  assert.equal(parentOsPath("/"), null);
});

test("empty body is refused", () => {
  assert.equal(clipOsBody("   ").ok, false);
  assert.equal(clipOsBody("accept the seat").ok, true);
  assert.equal(clipOsBody("x".repeat(OS_BODY_MAX + 1)).ok, false);
});
