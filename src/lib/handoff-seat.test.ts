import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("Engineer Current names where the last bind stopped", () => {
  const handoff = readFileSync(
    new URL("../../docs/register/ENGINEER-HANDOFF.md", import.meta.url),
    "utf8",
  );
  assert.match(handoff, /This bind is living/);
  assert.match(handoff, /bc-925e2ab1-3e97-43bc-b45e-2527302de811/);
  assert.match(handoff, /025 is planted/);
  assert.match(handoff, /Hotfix 062/);
  assert.match(handoff, /next hotfix number/);
  assert.match(handoff, /One PR per initiative/);
  assert.match(handoff, /You are a NEW bind/);
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
