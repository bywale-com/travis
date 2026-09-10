import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { openRoom, readTurns, runtimeBaseUrl } from "../desk";
import { send } from "../doors";

const haveUrl = Boolean(runtimeBaseUrl());

describe("type-send", { skip: !haveUrl }, () => {
  it("opens a room, Type one line is a stream not HTML, and lands on tape", async () => {
    const desk = await openRoom();
    const line = "One-line note on the tape.";
    const sent = await send(desk, line);
    assert.ok(sent.status >= 200 && sent.status < 500);
    assert.ok(sent.kind === "sse" || sent.kind === "json", `send must not be HTML, got ${sent.kind}`);

    const turns = await readTurns(desk);
    assert.ok(
      turns.some((row) => row.role === "user" && row.text.includes(line)),
      "typed line landed on the tape",
    );
  });
});
