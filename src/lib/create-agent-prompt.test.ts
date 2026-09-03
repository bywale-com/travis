import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("create-agent prompt is still the one-line stub", () => {
  const src = readFileSync(
    new URL("../server/create-agent.ts", import.meta.url),
    "utf8",
  );
  assert.match(src, /prompt: `You are \$\{label\}\. You sit in a Travis room\.`/);
});
