import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertAppWorked } from "../app-worked";
import { openFreshRoom, readTurns, runtimeBaseUrl } from "../desk";
import { send } from "../doors";

const haveUrl = Boolean(runtimeBaseUrl());

describe("type-send", { skip: !haveUrl }, () => {
  it("Type to Travis waits for the mouth — user line and a speakable reply, not a run error", async () => {
    const desk = await openFreshRoom();
    const line = "One-line note on the tape.";
    const sent = await send(desk, line, { chipSeatKeys: ["travis"] });
    assert.ok(sent.status >= 200 && sent.status < 500);
    assert.ok(sent.kind === "sse" || sent.kind === "json", `send must not be HTML, got ${sent.kind}`);

    const turns = await readTurns(desk);
    assert.ok(
      turns.some((row) => row.role === "user" && row.text.includes(line)),
      "typed line landed on the tape",
    );
    assertAppWorked(turns, "type-send");
  });
});
