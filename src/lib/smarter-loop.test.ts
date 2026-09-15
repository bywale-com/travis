import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

function read(rel: string) {
  return readFileSync(new URL(`../../${rel}`, import.meta.url), "utf8");
}

test("runtime-doors-red-label counts fail-look before outside-look at N=4", () => {
  const sh = read(".github/scripts/runtime-doors-red-label.sh");
  assert.match(sh, /outside-look/);
  assert.match(sh, /fail-look/);
  assert.match(sh, /RUNTIME_DOORS_ESCALATE_N:-4/);
  assert.match(sh, /issues\/\$\{pr\}\/timeline/);
  const yml = read(".github/workflows/runtime-doors.yml");
  assert.match(yml, /runtime-doors-red-label\.sh/);
  const redStep = yml.slice(
    yml.indexOf("Fresh-add fail-look or outside-look"),
  );
  assert.match(redStep, /outside-look/);
  assert.doesNotMatch(
    redStep.slice(0, redStep.indexOf("Emerge packet")),
    /add-label fail-look.*\n.*add-label fail-look/s,
  );
});
