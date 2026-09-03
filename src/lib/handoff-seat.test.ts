import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("Engineer always-on names the handoff ritual", () => {
  const agents = readFileSync(new URL("../../AGENTS.md", import.meta.url), "utf8");
  assert.match(agents, /Handoff seat/);
  assert.match(agents, /complete brief, one hop, stop/);
});

test("Engineer seat README has the four-step ritual", () => {
  const eng = readFileSync(
    new URL("../../docs/seats/ENGINEER.md", import.meta.url),
    "utf8",
  );
  assert.match(eng, /## Handoff seat/);
  assert.match(eng, /Name the seat/);
  assert.match(eng, /Write a complete brief/);
  assert.match(eng, /This Cloud Agent has no `dispatch_to_seat`/);
  assert.match(eng, /no PM→SA→Engineer auto-chain/);
});
