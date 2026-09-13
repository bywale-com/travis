/**
 * Locate or install the Playwright Chromium this checkout declared.
 * Called by `npm run test:runtime` so a branch-only YAML step is not required.
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

export function playwrightCli(): string {
  // Playwright's exports map does not publish `./cli.js`. Resolve the
  // exported package.json, then take the sibling bin.
  const pkg = require.resolve("playwright/package.json");
  const cli = join(dirname(pkg), "cli.js");
  if (!existsSync(cli)) {
    throw new Error(`playwright cli.js missing next to ${pkg}`);
  }
  return cli;
}

export function preparePlaywrightChromium(): void {
  const cli = playwrightCli();
  const locate = spawnSync(process.execPath, [cli, "install", "--dry-run", "chromium"], {
    encoding: "utf8",
  });
  const already =
    locate.status === 0 &&
    /chromium/i.test(`${locate.stdout}\n${locate.stderr}`) &&
    !/will be installed|Install location/i.test(`${locate.stdout}\n${locate.stderr}`);

  const args = already
    ? [cli, "install", "chromium"]
    : [cli, "install", "--with-deps", "chromium"];
  console.log(
    already
      ? "runtime: Playwright Chromium already on this runner"
      : "runtime: installing Playwright Chromium and Linux deps",
  );
  const installed = spawnSync(process.execPath, args, { stdio: "inherit" });
  if (installed.status !== 0) {
    const retry = spawnSync(process.execPath, [cli, "install", "chromium"], {
      stdio: "inherit",
    });
    if (retry.status !== 0) {
      throw new Error(`playwright install chromium failed (${retry.status ?? installed.status})`);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  preparePlaywrightChromium();
}
