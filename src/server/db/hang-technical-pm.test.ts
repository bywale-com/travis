import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const hang = readFileSync(new URL("./hang-technical-pm.sql", import.meta.url), "utf8");
const migrate = readFileSync(new URL("./migrate.ts", import.meta.url), "utf8");
const ensure = readFileSync(new URL("./ensure-bindings.ts", import.meta.url), "utf8");

const BIND = "bc-25c5c6bf-006f-4252-9f25-49ab183835b2";
const ROOM = "0e8875f8-283b-4dae-bf54-76c82a05b6ef";

test("074 hang SQL plants Technical PM, not catalog pm", () => {
  assert.match(hang, /Technical PM/);
  assert.match(hang, /technical-pm/);
  assert.match(hang, /\/protocols\/pm\.md/);
  assert.match(hang, new RegExp(BIND.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(hang, new RegExp(ROOM.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(hang, /Idempotent on cursor_agent_id/);
  assert.match(hang, /Never write catalog pm/);
  assert.match(hang, /AND seat_key <> 'pm'/);
  assert.match(hang, /Do not touch catalog pm/);
});

test("074 does not put the living PM bind in migrate or env fill", () => {
  assert.doesNotMatch(migrate, new RegExp(BIND.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(ensure, new RegExp(BIND.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});
