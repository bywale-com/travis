import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

function read(rel: string) {
  return readFileSync(new URL(`../../${rel}`, import.meta.url), "utf8");
}

const ignoreScript = fileURLToPath(
  new URL("../../.github/scripts/vercel-ignore.sh", import.meta.url),
);

test("runtime-doors holds fail-look while a blocker file or label is on", () => {
  const yml = read(".github/workflows/runtime-doors.yml");
  assert.match(yml, /Blocker file on deploy commit\. No fail-look\./);
  assert.match(yml, /has blocker active\. No fail-look\./);
  assert.match(yml, /repository_dispatch always runs THIS FILE FROM main/);
});

test("vercel.json ignoreCommand hangs the skip script", () => {
  const json = JSON.parse(read("vercel.json")) as { ignoreCommand?: string };
  assert.equal(json.ignoreCommand, "sh .github/scripts/vercel-ignore.sh");
});

test("[vercel skip] in the commit message skips the Vercel build", () => {
  const skip = spawnSync("sh", [ignoreScript], {
    env: { ...process.env, VERCEL_GIT_COMMIT_MESSAGE: "hold [vercel skip]" },
    encoding: "utf8",
  });
  assert.equal(skip.status, 0, skip.stderr + skip.stdout);

  const build = spawnSync("sh", [ignoreScript], {
    env: { ...process.env, VERCEL_GIT_COMMIT_MESSAGE: "Circuit breaker release" },
    encoding: "utf8",
  });
  assert.equal(build.status, 1, build.stderr + build.stdout);

  const noMsg = spawnSync("sh", [ignoreScript], {
    env: { ...process.env, VERCEL_GIT_COMMIT_MESSAGE: "" },
    encoding: "utf8",
  });
  assert.equal(noMsg.status, 1, noMsg.stderr + noMsg.stdout);
});
