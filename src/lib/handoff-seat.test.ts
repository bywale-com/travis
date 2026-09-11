import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("Engineer Current names where the last bind stopped", () => {
  const handoff = readFileSync(
    new URL("../../docs/register/ENGINEER-HANDOFF.md", import.meta.url),
    "utf8",
  );
  assert.match(handoff, /This bind is done/);
  assert.match(handoff, /bc-f2fe0215-5f44-4b79-8052-ab84c911bcca/);
  assert.match(handoff, /036 circuit breaker/);
  assert.match(handoff, /send-blocker-letter\.py/);
  assert.match(handoff, /035 stream architecture/);
  assert.match(handoff, /076 dest closer/);
  assert.match(handoff, /031.*032.*033.*034/);
  assert.match(handoff, /086 runtime is the app/);
  assert.match(handoff, /020 runtime verify/);
  assert.match(handoff, /062/);
  assert.match(handoff, /Next hotfix number/);
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
