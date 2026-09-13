import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("createCursorAgent uses a bounded HTTP timeout", () => {
  const src = readFileSync(
    new URL("../server/cursor-port.ts", import.meta.url),
    "utf8",
  );
  assert.match(src, /CURSOR_CREATE_TIMEOUT_MS = 90_000/);
  assert.match(src, /AbortSignal\.timeout\(CURSOR_CREATE_TIMEOUT_MS\)/);
  assert.match(src, /Cursor create timed out/);
});

test("create doors keep the function open past the HTTP timeout", () => {
  const tool = readFileSync(
    new URL("../app/api/session/[id]/live/tool/route.ts", import.meta.url),
    "utf8",
  );
  const agents = readFileSync(
    new URL("../app/api/agents/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(tool, /export const maxDuration = 120/);
  assert.match(agents, /export const maxDuration = 120/);
});

test("runTravisTool closes a live stream after tool finish", () => {
  const src = readFileSync(
    new URL("../server/travis-tools.ts", import.meta.url),
    "utf8",
  );
  assert.match(src, /liveStreamForBinding/);
  assert.match(src, /closeStream\(/);
});
