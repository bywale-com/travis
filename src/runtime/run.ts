/**
 * Branch-owned runtime entrypoint. `main`'s runtime-doors.yml only calls
 * `npm run test:runtime`. This file prepares Chromium, then runs server-pipe
 * walks, deterministic browser suites, then the real Voice canary.
 */

import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { preparePlaywrightChromium } from "./prepare-browser";
import { proveFakeAudioReachesWebRtc } from "./browser/prove-fake-audio";

const require = createRequire(import.meta.url);

function run(label: string, args: string[]): void {
  console.log(`runtime: ${label}`);
  const result = spawnSync(process.execPath, args, {
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function tsxBin(): string {
  return require.resolve("tsx/cli");
}

async function main(): Promise<void> {
  preparePlaywrightChromium();
  console.log("runtime: proving fake-audio capture reaches a WebRTC session");
  await proveFakeAudioReachesWebRtc();

  const tsx = tsxBin();
  run("server-pipe walks (HTTP contract, not microphone)", [
    tsx,
    "--test",
    "--test-concurrency=1",
    "src/runtime/walks/type-send.spec.ts",
    "src/runtime/walks/type-walk-back.spec.ts",
    "src/runtime/walks/type-dest.spec.ts",
    "src/runtime/walks/voice-wrap.spec.ts",
    "src/runtime/walks/voice-stream-arch.spec.ts",
    "src/runtime/walks/come-back.spec.ts",
    "src/runtime/walks/bind-agent.spec.ts",
  ]);
  run("browser type-mode / talk-mode / voice-own (deterministic)", [
    tsx,
    "--test",
    "--test-concurrency=1",
    "src/runtime/browser/type-mode.spec.ts",
    "src/runtime/browser/talk-mode.spec.ts",
    "src/runtime/browser/voice-own.spec.ts",
  ]);
  run("browser voice-live canary (real microphone → Realtime)", [
    tsx,
    "--test",
    "--test-concurrency=1",
    "src/runtime/browser/voice-live.spec.ts",
  ]);
}

void main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
