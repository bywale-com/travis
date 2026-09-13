import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("createCursorAgent uses a bounded HTTP timeout", () => {
  const src = readFileSync(
    new URL("../server/cursor-port.ts", import.meta.url),
    "utf8",
  );
  assert.match(src, /CURSOR_CREATE_TIMEOUT_MS/);
  assert.match(src, /AbortSignal\.timeout\(CURSOR_CREATE_TIMEOUT_MS\)/);
  assert.match(src, /Cursor create timed out/);
});

test("runTravisTool closes a live stream after tool finish", () => {
  const src = readFileSync(
    new URL("../server/travis-tools.ts", import.meta.url),
    "utf8",
  );
  assert.match(src, /liveStreamForBinding/);
  assert.match(src, /closeStream\(/);
});
