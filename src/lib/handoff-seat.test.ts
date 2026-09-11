import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("Engineer Current names where the last bind stopped", () => {
  const handoff = readFileSync(
    new URL("../../docs/register/ENGINEER-HANDOFF.md", import.meta.url),
    "utf8",
  );
  assert.match(handoff, /This bind is (living|done)/);
  assert.match(handoff, /Do not start from a transcript/);
  assert.match(handoff, /036 circuit breaker/);
  assert.match(handoff, /#180/);
  assert.match(handoff, /088 fail-look skip/);
  assert.match(handoff, /086 runtime is the app/);
  assert.match(handoff, /035 stream architecture/);
  assert.match(handoff, /Next number \*\*089\*\*/);
  assert.match(handoff, /One PR per initiative/);
  assert.match(handoff, /Pickup file:/);
  assert.match(handoff, /You are Travis's Engineer/);
  assert.match(handoff, /Read docs\/register\/ENGINEER-HANDOFF\.md first/);
});

test("always-on and seat README point at the pickup file", () => {
  const agents = readFileSync(new URL("../../AGENTS.md", import.meta.url), "utf8");
  const eng = readFileSync(
    new URL("../../docs/seats/ENGINEER.md", import.meta.url),
    "utf8",
  );
  const readme = readFileSync(new URL("../../docs/README.md", import.meta.url), "utf8");
  assert.match(agents, /ENGINEER-HANDOFF\.md/);
  assert.match(eng, /## Handoff the seat/);
  assert.match(eng, /ENGINEER-HANDOFF\.md/);
  assert.match(readme, /The pipe is planted/);
  assert.match(readme, /ENGINEER-HANDOFF\.md/);
});

test("create-agent prompt is still the one-line stub", () => {
  const src = readFileSync(
    new URL("../server/create-agent.ts", import.meta.url),
    "utf8",
  );
  assert.match(src, /prompt: `You are \$\{label\}\. You sit in a Travis room\.`/);
});
