import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

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

test("stream-arch cue fixture is checked in", () => {
  const wav = fileURLToPath(
    new URL("./fixtures/stream-arch-cue.wav", import.meta.url),
  );
  assert.equal(existsSync(wav), true);
});
