import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { openRoom, runtimeBaseUrl } from "../desk.ts";
import { send } from "../doors.ts";

const haveUrl = Boolean(runtimeBaseUrl());

describe("type-send", { skip: !haveUrl }, () => {
  it("opens a room and Type one line is a stream not HTML", async () => {
    const desk = await openRoom();
    const sent = await send(desk, "One-line note on the tape.");
    assert.ok(sent.status >= 200 && sent.status < 500);
    assert.ok(sent.kind === "sse" || sent.kind === "json", `send must not be HTML, got ${sent.kind}`);
  });
});
