import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("one PR per initiative is written where seats will see it", () => {
  const law = readFileSync(
    new URL("../../docs/register/initiatives/README.md", import.meta.url),
    "utf8",
  );
  assert.match(law, /One GitHub pull request is the door/);
  assert.match(law, /not.*travis\.initiative/);
  const agents = readFileSync(new URL("../../AGENTS.md", import.meta.url), "utf8");
  assert.match(agents, /One PR per initiative/);
  const eng = readFileSync(
    new URL("../../docs/seats/ENGINEER.md", import.meta.url),
    "utf8",
  );
  assert.match(eng, /One PR per initiative/);
  const index = readFileSync(
    new URL("../../docs/register/HOTFIXES.md", import.meta.url),
    "utf8",
  );
  assert.match(index, /HOTFIX-065-ONE-PR/);
  assert.match(index, /Next: \*\*066\*\*/);
});
