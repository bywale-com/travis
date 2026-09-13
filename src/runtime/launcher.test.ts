import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { classifyFaceText } from "./browser/harness";
import { playwrightCli } from "./prepare-browser";

function read(rel: string) {
  return readFileSync(new URL(`../../${rel}`, import.meta.url), "utf8");
}

test("runtime-doors.yml stays a generic launcher and serializes globally", () => {
  const yml = read(".github/workflows/runtime-doors.yml");
  assert.match(yml, /npm run test:runtime/);
  assert.match(yml, /concurrency:/);
  assert.match(yml, /group: runtime-doors/);
  assert.match(yml, /cancel-in-progress: false/);
  assert.doesNotMatch(yml, /playwright install/);
  assert.doesNotMatch(yml, /type-mode/);
  assert.doesNotMatch(yml, /talk-mode/);
  assert.doesNotMatch(yml, /voice-live/);
  assert.doesNotMatch(yml, /voice-own/);
  assert.doesNotMatch(yml, /src\/runtime\/browser/);
});

test("package.json test:runtime prepares the browser and delegates pipe then browser", () => {
  const pkg = JSON.parse(read("package.json")) as {
    scripts: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  assert.equal(pkg.scripts["test:runtime"], "tsx src/runtime/run.ts");
  assert.match(pkg.scripts["test:runtime:prepare"], /prepare-browser/);
  assert.match(pkg.scripts["test:runtime:pipe"], /src\/runtime\/walks/);
  assert.match(pkg.scripts["test:runtime:browser"], /src\/runtime\/browser/);
  assert.ok(pkg.devDependencies.playwright, "Playwright is a declared devDependency");
  const run = read("src/runtime/run.ts");
  assert.match(run, /preparePlaywrightChromium/);
  assert.match(run, /server-pipe walks/);
  assert.match(run, /type-mode\.spec\.ts/);
  assert.match(run, /talk-mode\.spec\.ts/);
  assert.match(run, /voice-own\.spec\.ts/);
  assert.match(run, /voice-live\.spec\.ts/);
  assert.match(run, /async function main/);
  assert.match(run, /one spec per spawn/);
  assert.doesNotMatch(
    run,
    /--test-fail-fast/,
    "Node 22 rejects --test-fail-fast; first miss exits via one spec per spawn",
  );
  assert.doesNotMatch(
    run,
    /^await\s/m,
    "tsx CJS cannot transform top-level await; keep the runner inside async main",
  );
  const pipeAt = run.indexOf("server-pipe walks");
  const ownAt = run.indexOf("voice-own.spec.ts");
  const liveAt = run.indexOf("voice-live.spec.ts");
  assert.ok(pipeAt > 0 && ownAt > pipeAt && liveAt > ownAt, "pipe, then deterministic browser, then Voice canary");
});

test("playwright CLI is the sibling bin of the exported package.json", () => {
  const src = read("src/runtime/prepare-browser.ts");
  assert.doesNotMatch(
    src,
    /require\.resolve\(["']playwright\/cli\.js["']\)/,
    "playwright/cli.js is not an exports subpath; tsx dies before any walk",
  );
  assert.match(src, /playwright\/package\.json/);
  const cli = playwrightCli();
  assert.match(cli, /cli\.js$/);
  assert.equal(existsSync(cli), true);
});

test("runtime-doors cancelled or a walks miss is red, not emerge", () => {
  const yml = read(".github/workflows/runtime-doors.yml");
  assert.match(yml, /timeout-minutes: 60/);
  assert.match(yml, /Paint red unless walks succeeded/);
  assert.match(yml, /steps\.walks\.outcome != 'success'/);
  const failLook = yml.slice(yml.indexOf("Fresh-add fail-look on the open PR"));
  assert.match(failLook, /if: failure\(\) \|\| cancelled\(\)/);
  const emerge = yml.slice(yml.indexOf("Emerge packet on success"));
  assert.match(emerge, /if: success\(\)/);
  assert.doesNotMatch(emerge.slice(0, 80), /cancelled/);
});

test("launchPhone closes Chromium on throw and finds View log by text", () => {
  const src = read("src/runtime/browser/harness.ts");
  const character = read("src/theme/character.tsx");
  assert.match(src, /await browser\.close\(\)\.catch/);
  assert.match(src, /dumpFaceMiss/);
  assert.match(src, /classifyFaceText/);
  assert.match(src, /getByText\("View log"/);
  assert.match(src, /travis-character/);
  assert.match(src, /name: "Continue"/);
  assert.doesNotMatch(src, /getByRole\("button", \{ name: "View log" \}\)/);
  assert.match(character, /travis-character/);
  assert.equal(classifyFaceText("Send login link"), "login");
  assert.equal(classifyFaceText("TRAVIS\nRooms\nNew room"), "index");
  assert.equal(classifyFaceText("Talking with Travis…\nView log"), "view-log");
  assert.equal(
    classifyFaceText(
      "TRAVIS\nPick a character, not a brightness.\nMission\nCarbon\nMatch system\nContinue",
    ),
    "mode",
  );
  assert.equal(classifyFaceText("Vercel Authentication"), "none");
});

test("stream-arch cue fixture is checked in", () => {
  const wav = fileURLToPath(
    new URL("./fixtures/stream-arch-cue.wav", import.meta.url),
  );
  assert.equal(existsSync(wav), true);
});
