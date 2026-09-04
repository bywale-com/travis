import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

function read(rel: string) {
  return readFileSync(new URL(`../../${rel}`, import.meta.url), "utf8");
}

test("one PR per initiative is written where seats will see it", () => {
  const law = read("docs/register/initiatives/README.md");
  assert.match(law, /One GitHub pull request is the door/);
  assert.match(law, /not.*travis\.initiative/);

  const agents = read("AGENTS.md");
  assert.match(agents, /One PR per initiative/);

  const eng = read("docs/seats/ENGINEER.md");
  assert.match(eng, /One PR per initiative/);

  const pm = read("docs/seats/PRODUCT-MANAGER.md");
  assert.match(pm, /One PR/);
  assert.match(pm, /Engineer.s open initiative PR/);

  const index = read("docs/register/HOTFIXES.md");
  assert.match(index, /HOTFIX-065-ONE-PR/);
  assert.match(index, /HOTFIX-066-PR-CLEANUP/);
  assert.match(index, /HOTFIX-069-HAND-TRUTH/);
  assert.match(index, /HOTFIX-070-GLANCE-TRUTH/);
  assert.match(index, /Next: \*\*071\*\*/);

  const house =
    read("docs/register/house-now/protocols/engineer.md") +
    read("docs/register/house-now/protocols/sa.md") +
    read("docs/register/house-now/protocols/pm.md");
  assert.match(house, /one GitHub PR|Engineer.s open PR/i);
  assert.match(house, /Do not open a second PR|Open a second PR because another seat sat down/);
});
