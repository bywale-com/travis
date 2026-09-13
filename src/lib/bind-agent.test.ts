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
  assert.match(tools, /seat_key/);
  assert.match(tools, /requires no prompt and no protocol/);
  const create = read("src/server/create-agent.ts");
  assert.match(create, /export async function bindAgentBinding/);
  assert.match(create, /requestedBindSeatKey/);
  const walks = read("src/runtime/walks/README.md");
  assert.match(walks, /bind-agent\.spec\.ts/);
  assert.doesNotMatch(walks, /create-agent\.spec\.ts/);
});

test("direct bind skips sit unless protocol is given", () => {
  const tools = read("src/server/travis-tools.ts");
  const fn = tools.slice(tools.indexOf('if (name === "bind_agent")'));
  const body = fn.slice(0, fn.indexOf('if (name === "create_agent")'));
  assert.match(body, /args\.seat_key \?\? args\.seat/);
  assert.match(body, /if \(protocolRaw\)/);
  const sitAt = body.indexOf("sitBinding");
  const protocolAt = body.indexOf("if (protocolRaw)");
  assert.ok(protocolAt >= 0 && sitAt > protocolAt);
});
