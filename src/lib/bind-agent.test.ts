import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

function read(rel: string) {
  return readFileSync(new URL(`../../${rel}`, import.meta.url), "utf8");
}

test("bind_agent is wired on server and in runtime inventory", () => {
  const tools = read("src/server/travis-tools.ts");
  assert.match(tools, /name: "bind_agent"/);
  assert.match(tools, /bindAgentBinding/);
  const create = read("src/server/create-agent.ts");
  assert.match(create, /export async function bindAgentBinding/);
  const walks = read("src/runtime/walks/README.md");
  assert.match(walks, /bind-agent\.spec\.ts/);
  assert.doesNotMatch(walks, /create-agent\.spec\.ts/);
});
