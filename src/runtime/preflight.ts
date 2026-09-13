/**
 * Local first sensor. Unit tests, Chromium, then phone-face doors on a
 * loopback fixture. No Vercel. No OpenAI. Engineer runs this before push.
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { PREFLIGHT_COOKIE, startPreflightFace } from "./preflight-face";
import { runPreflightFaceWalks } from "./preflight-walks";

const require = createRequire(import.meta.url);

function playwrightCli(): string {
  const pkg = require.resolve("playwright/package.json");
  const cli = join(dirname(pkg), "cli.js");
  if (!existsSync(cli)) {
    throw new Error(`playwright cli.js missing next to ${pkg}`);
  }
  return cli;
}

function run(
  label: string,
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv = process.env,
): void {
  console.log(`preflight: ${label}`);
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function prepareChromium(): void {
  const cli = playwrightCli();
  console.log("preflight: installing or locating Playwright Chromium");
  const installed = spawnSync(process.execPath, [cli, "install", "chromium"], {
    stdio: "inherit",
  });
  if (installed.status !== 0) {
    throw new Error(`playwright install chromium failed (${installed.status ?? 1})`);
  }
}

function assertRunnerContract(): void {
  if (!existsSync("src/runtime/run.ts")) return;
  const src = require("node:fs").readFileSync("src/runtime/run.ts", "utf8") as string;
  const failFast = `--test-${"fail-fast"}`;
  if (src.includes(failFast)) {
    throw new Error(`src/runtime/run.ts still passes ${failFast}; Node 22 rejects that flag`);
  }
  if (/^await\s/m.test(src)) {
    throw new Error("src/runtime/run.ts has top-level await; tsx CJS cannot transform it");
  }
}

async function main(): Promise<void> {
  run("unit tests", "npm", ["test"]);
  assertRunnerContract();
  prepareChromium();

  const face = await startPreflightFace();
  process.env.RUNTIME_BASE_URL = face.url;
  process.env.TRAVIS_TEST_OPERATOR_COOKIE =
    process.env.TRAVIS_TEST_OPERATOR_COOKIE?.trim() || PREFLIGHT_COOKIE;
  console.log(`preflight: face fixture ${face.url}`);
  try {
    await runPreflightFaceWalks();
  } finally {
    await face.close();
  }
  console.log("preflight: green");
}

void main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
