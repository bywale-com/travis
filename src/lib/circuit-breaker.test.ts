import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

function read(rel: string) {
  return readFileSync(new URL(`../../${rel}`, import.meta.url), "utf8");
}

const ignoreScript = fileURLToPath(
  new URL("../../.github/scripts/vercel-ignore.sh", import.meta.url),
);

function runIgnore(env: Record<string, string>) {
  return spawnSync("sh", [ignoreScript], {
    env: { ...process.env, ...env },
    encoding: "utf8",
  });
}

test("vercel.json ignoreCommand hangs the skip script", () => {
  const json = JSON.parse(read("vercel.json")) as { ignoreCommand?: string };
  assert.equal(json.ignoreCommand, "sh .github/scripts/vercel-ignore.sh");
});

test("preview skips unless the subject is exactly the Action green light", () => {
  const skip = runIgnore({
    VERCEL_ENV: "preview",
    VERCEL_GIT_COMMIT_MESSAGE: "SA-036 packet",
  });
  assert.equal(skip.status, 0, skip.stderr + skip.stdout);

  const empty = runIgnore({
    VERCEL_ENV: "preview",
    VERCEL_GIT_COMMIT_MESSAGE: "",
  });
  assert.equal(empty.status, 0, empty.stderr + empty.stdout);

  const namedSkip = runIgnore({
    VERCEL_ENV: "preview",
    VERCEL_GIT_COMMIT_MESSAGE: "hold [vercel skip]",
  });
  assert.equal(namedSkip.status, 0, namedSkip.stderr + namedSkip.stdout);

  const mention = runIgnore({
    VERCEL_ENV: "preview",
    VERCEL_GIT_COMMIT_MESSAGE:
      "Plant send-blocker-letter.py\n\nNo [vercel build] on this commit.\n",
  });
  assert.equal(mention.status, 0, mention.stderr + mention.stdout);

  const go = runIgnore({
    VERCEL_ENV: "preview",
    VERCEL_GIT_COMMIT_MESSAGE: "Preview [vercel build]",
  });
  assert.equal(go.status, 1, go.stderr + go.stdout);
});

test("production always builds", () => {
  const prod = runIgnore({
    VERCEL_ENV: "production",
    VERCEL_GIT_COMMIT_MESSAGE: "Merge pull request",
  });
  assert.equal(prod.status, 1, prod.stderr + prod.stdout);
});

test("ignoreCommand reads only VERCEL_GIT_COMMIT_MESSAGE", () => {
  const sh = read(".github/scripts/vercel-ignore.sh");
  assert.doesNotMatch(sh, /git log/);
  assert.match(sh, /VERCEL_GIT_COMMIT_MESSAGE/);
  assert.match(sh, /VERCEL_ENV/);
  assert.match(sh, /NR==1/);
});

test("preview-when-clear waits on handoff and hold labels", () => {
  const sh = read(".github/scripts/preview-when-clear.sh");
  for (const lab of [
    "wake-sa",
    "wake-engineer",
    "wake-pm-look",
    "fail-look",
    "blocker",
  ]) {
    assert.match(sh, new RegExp(lab));
  }
  assert.match(sh, /\[vercel build\]/);
  assert.match(sh, /--allow-empty/);
});

test("wake-packet-seats: one seat at a time; green light after clear", () => {
  const yml = read(".github/workflows/wake-packet-seats.yml");
  assert.match(yml, /add_seat\(\)/);
  assert.match(yml, /strip_seats_except\(\)/);
  assert.match(yml, /blocker already on/);
  assert.match(yml, /Stripped leftover seat labels/);
  assert.match(yml, /preview-when-clear:/);
  assert.match(yml, /preview-when-clear\.sh/);
  assert.doesNotMatch(yml, /VERCEL_DEPLOY_HOOK_URL/);
  assert.doesNotMatch(yml, /--remove-label blocker/);
});

test("runtime-doors does not fail-look during handoff", () => {
  const yml = read(".github/workflows/runtime-doors.yml");
  assert.match(yml, /wake-sa/);
  assert.match(yml, /wake-engineer/);
  assert.match(yml, /wake-pm-look/);
  assert.match(yml, /fail-look/);
  assert.match(yml, /blocker/);
  assert.match(yml, /handoff\/hold/);
});

test("Engineer prompt never green-lights a seat commit", () => {
  const prompt = read(
    "docs/register/house-now/automations/sa-complete-engineer.prompt.md",
  );
  assert.match(prompt, /without.*preview green-light tag/);
  assert.match(prompt, /Never use the exact subject `Preview \[vercel build\]`/);
  assert.doesNotMatch(prompt, /\[vercel skip\]/);
  assert.doesNotMatch(prompt, /\[skip ci\] so Vercel/);
});

test("blocker mailer exists and wake workflow invokes it", () => {
  const yml = read(".github/workflows/wake-packet-seats.yml");
  const script = read(".github/scripts/send-blocker-letter.py");
  assert.match(yml, /send-blocker-letter\.py/);
  assert.match(script, /EMERGE_EMAIL/);
  assert.match(script, /RESEND_API_KEY/);
  assert.match(script, /\[BLOCKER\]/);
  assert.doesNotMatch(yml, /VERCEL_DEPLOY_HOOK_URL/);
});

test("blocker mailer shapes subject from markdown without Resend", () => {
  const dir = mkdtempSync(join(tmpdir(), "blocker-"));
  const blocker = join(dir, "BLOCKER-021-cursor-limit.md");
  writeFileSync(
    blocker,
    `# Blocker 021 — Cursor hard limit

**Pocket** Packet 021 circuit breaker · PR #181

**Cause**
Background Agent create hit the $2 hard spend limit on preview.

**Required action**
1. Top up Cursor spend at the dashboard.

**URL**
https://www.cursor.com/dashboard?tab=settings

**Tape excerpt**
\`\`\`
hard limit reached
\`\`\`
`,
    "utf8",
  );
  const script = fileURLToPath(
    new URL("../../.github/scripts/send-blocker-letter.py", import.meta.url),
  );
  const run = spawnSync("python3", [script, blocker], {
    env: {
      ...process.env,
      EMERGE_EMAIL: "",
      RESEND_API_KEY: "",
      RESEND_FROM_EMAIL: "",
    },
    encoding: "utf8",
  });
  assert.equal(run.status, 0, run.stderr + run.stdout);
  assert.match(
    run.stdout,
    /\[BLOCKER\] Packet 021 circuit breaker · PR #181 blocked — Background Agent create hit the \$2 hard spend limit on preview\./,
  );
});
