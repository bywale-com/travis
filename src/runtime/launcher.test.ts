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
  assert.match(src, /grantPermissions/);
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

test("voice-live dumps the face when Talking never shows", () => {
  const live = read("src/runtime/browser/voice-live.spec.ts");
  assert.match(live, /dumpFaceMiss/);
  assert.match(live, /Talking with Travis/);
  assert.match(live, /leave-before-wrap/);
  assert.match(live, /Live dropped before dest leave/);
});

test("Live opens the mic after the Realtime peer can receive", () => {
  const src = read("src/lib/travis-live-client.ts");
  const remoteAt = src.indexOf("await pc.setRemoteDescription");
  const dcWaitAt = src.indexOf("dc.readyState !== \"open\"");
  const armAt = src.lastIndexOf("await attachMicAfterPeerReady()");
  assert.ok(remoteAt >= 0 && armAt > remoteAt, "dest line must not play during ICE");
  assert.ok(dcWaitAt >= 0 && armAt > dcWaitAt, "arm the fixture after session.update");
  assert.match(src, /replaceTrack/);
  assert.match(src, /waitTrackUnmuted/);
  assert.match(src, /getUserMedia\(\{ audio: true \}\)/);
  assert.match(src, /addTransceiver/);
  assert.doesNotMatch(src, /echoCancellation: true/);
  assert.doesNotMatch(src, /createMediaStreamDestination/);
  assert.match(src, /\/live\/sdp/);
  assert.match(src, /realtimeSdpAnswer/);
  assert.doesNotMatch(src, /sdpData\.sdp\?\.trim/);
  assert.doesNotMatch(src, /api\.openai\.com/);
});

test("Live SDP exchanges through Travis", () => {
  const route = read("src/app/api/session/[id]/live/sdp/route.ts");
  const openai = read("src/server/travis-openai.ts");
  const grain = read("src/lib/travis-openai.ts");
  assert.match(route, /exchangeRealtimeSdp/);
  assert.match(route, /runtime = "nodejs"/);
  assert.match(openai, /\/v1\/realtime\/calls/);
  assert.match(openai, /httpsRequest/);
  assert.match(openai, /Content-Length/);
  assert.match(openai, /realtimeSdpMultipart/);
  assert.match(openai, /realtimeSdpAnswer/);
  assert.match(openai, /Bearer \$\{key\}/);
  assert.doesNotMatch(openai, /Bearer \$\{opts\.token\}/);
  assert.match(grain, /application\/sdp/);
  assert.match(grain, /multipart\/form-data/);
  assert.match(grain, /name="sdp"/);
  assert.match(grain, /name="session"/);
  assert.match(grain, /realtimeSdpAnswer/);
  assert.doesNotMatch(grain, /new File/);
  assert.doesNotMatch(grain, /FormData/);
  assert.doesNotMatch(openai, /fetch\("https:\/\/api\.openai\.com\/v1\/realtime\/calls"/);
});

test("attachSession writes listening on the presence ref before armEar", () => {
  const room = read("src/components/Room.tsx");
  const attach = room.slice(room.indexOf("const attachSession"), room.indexOf("const loadRooms"));
  const refAt = attach.lastIndexOf('presenceRef.current = "listening"');
  const armAt = attach.lastIndexOf("void armEar()");
  assert.ok(refAt >= 0 && armAt > refAt, "ended presence on first enter must not block Live");
});

test("non-mutating Engineer canary fixture is checked in", () => {
  const wav = fileURLToPath(
    new URL("./fixtures/stream-arch-cue.wav", import.meta.url),
  );
  assert.equal(existsSync(wav), true);
});
