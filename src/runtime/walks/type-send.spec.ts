import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertThinkWorked, failUse } from "../app-worked";
import { openFreshRoom, readTurns, runtimeBaseUrl } from "../desk";
import { send } from "../doors";

const haveUrl = Boolean(runtimeBaseUrl());

describe("type-send", { skip: !haveUrl }, () => {
  it("Type to Travis waits for the mouth — speakable reply, not unwired, not a run error", async () => {
    const desk = await openFreshRoom();
    const line = "One-line note on the tape.";
    const sent = await send(desk, line, { chipSeatKeys: ["travis"] });
    const turns = await readTurns(desk);
    if (!(sent.status >= 200 && sent.status < 500 && (sent.kind === "sse" || sent.kind === "json"))) {
      failUse("type-send", `send was ${sent.kind} ${sent.status}`, turns, sent);
    }
    if (!turns.some((row) => row.role === "user" && row.text.includes(line))) {
      failUse("type-send", "typed line never landed on the tape", turns, sent);
    }
    assertThinkWorked(turns, "type-send", sent);
    assert.ok(true);
  });
});
