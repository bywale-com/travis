import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

function read(rel: string) {
  return readFileSync(new URL(`../../${rel}`, import.meta.url), "utf8");
}

test("preview-when-clear holds on previewing and sets it before the empty commit", () => {
  const sh = read(".github/scripts/preview-when-clear.sh");
  assert.match(sh, /previewing/);
  assert.match(sh, /--add-label previewing/);
  assert.match(sh, /Preview \[vercel build\]/);
  const addAt = sh.indexOf("--add-label previewing");
  const commitAt = sh.indexOf("git commit --allow-empty");
  assert.ok(addAt > 0 && commitAt > addAt, "lock before green-light commit");
});

test("wake-packet-seats: hotfix wakes only on an added file; add_seat is a no-op while previewing", () => {
  const yml = read(".github/workflows/wake-packet-seats.yml");
  assert.match(yml, /diff-filter=A/);
  assert.match(yml, /echo "\$added"/);
  assert.match(yml, /previewing on #\$pr\. No new seat/);
  assert.match(yml, /outside-look on #\$pr\. No new seat/);
  assert.match(yml, /gh label create previewing/);
  assert.match(yml, /green-light-\$\{\{ github\.ref_name \}\}/);
  assert.match(yml, /cancel-in-progress: false/);
  assert.doesNotMatch(
    yml,
    /Do not re-wake Engineer\n# on later commits on the same PR \(file not in this push\)/,
  );
});

test("runtime-doors clears previewing then skips fail-look if it is still on", () => {
  const yml = read(".github/workflows/runtime-doors.yml");
  assert.match(yml, /Clear previewing after doors paint/);
  assert.match(yml, /--remove-label previewing/);
  const holds = yml.slice(yml.indexOf("for hold in"));
  assert.match(holds, /previewing/);
  assert.match(holds, /outside-look/);
  const clearAt = yml.indexOf("Clear previewing after doors paint");
  const armAt = yml.indexOf("Arm delayed outside-look from Look seed comment");
  const failAt = yml.indexOf("Fresh-add fail-look on the open PR");
  assert.ok(clearAt > 0 && failAt > clearAt, "clear previewing before fail-look");
  assert.ok(armAt > clearAt && armAt < failAt, "arm delayed outside-look before fail-look");
});

test("Engineer prompt recuts once and will not push while previewing", () => {
  const prompt = read(
    "docs/register/house-now/automations/sa-complete-engineer.prompt.md",
  );
  assert.match(prompt, /If \*\*`previewing`\*\* is on this PR/);
  assert.match(prompt, /Recut \*\*once\*\*/);
  assert.doesNotMatch(
    prompt,
    /fail-look` still on the PR → stay and recut/,
  );
  assert.match(prompt, /That is a new sitting/);
});
