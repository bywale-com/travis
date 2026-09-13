import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

function read(rel: string) {
  return readFileSync(new URL(`../../${rel}`, import.meta.url), "utf8");
}

test("package.json exposes test:preflight as the local first sensor", () => {
  const pkg = JSON.parse(read("package.json")) as {
    scripts: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  assert.equal(pkg.scripts["test:preflight"], "tsx src/runtime/preflight.ts");
  assert.notEqual(
    pkg.scripts["test:runtime"],
    pkg.scripts["test:preflight"],
    "preflight is local; runtime-doors still calls test:runtime",
  );
  assert.ok(pkg.devDependencies.playwright, "Playwright is a declared devDependency");
});

test("preflight runner boots from async main and does not use a Node 22 fail-fast flag", () => {
  const src = read("src/runtime/preflight.ts");
  assert.match(src, /async function main/);
  assert.match(src, /startPreflightFace/);
  assert.match(src, /runPreflightFaceWalks/);
  const walks = read("src/runtime/preflight-walks.ts");
  assert.match(walks, /Pick a character/);
  assert.match(walks, /Talk\/Pause/);
  assert.match(walks, /TYPE_LINE/);
  assert.doesNotMatch(src, /"--test-fail-fast"/);
  assert.doesNotMatch(src, /^await\s/m);
  assert.match(src, /playwright\/package\.json/);
  assert.doesNotMatch(src, /require\.resolve\(["']playwright\/cli\.js["']\)/);
});

test("playwright CLI is the sibling bin of the exported package.json", () => {
  const pkg = require.resolve("playwright/package.json");
  const cli = join(dirname(pkg), "cli.js");
  assert.equal(existsSync(cli), true);
});

test("Engineer prompt and seats require preflight before push", () => {
  const prompt = read("docs/register/house-now/automations/sa-complete-engineer.prompt.md");
  const seats = read("docs/seats/ENGINEER.md");
  const agents = read("AGENTS.md");
  const protocol = read("docs/register/house-now/protocols/engineer.md");
  for (const src of [prompt, seats, agents, protocol]) {
    assert.match(src, /npm run test:preflight/);
  }
});
