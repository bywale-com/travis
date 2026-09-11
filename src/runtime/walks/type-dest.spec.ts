import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { appWorkedReason } from "../app-worked";
import { openFreshRoom, readQueue, readTurns, runtimeBaseUrl } from "../desk";
import { send } from "../doors";

const haveUrl = Boolean(runtimeBaseUrl());

describe("type-dest", { skip: !haveUrl }, () => {
  it("dest to a seat starts a leave, and Travis mouth last does not die", async () => {
    const desk = await openFreshRoom();
    assert.ok(desk.sessionId.length > 0);

    const destPrompt = "Engineer, inspect the runtime verification check.";
    const sent = await send(desk, destPrompt, { chipSeatKeys: ["engineer"] });
    assert.ok(sent.status >= 200 && sent.status < 500);
    assert.ok(
      sent.kind === "sse" || sent.kind === "json",
      `dest send must not be HTML, got ${sent.kind}`,
    );

    const turns = await readTurns(desk);
    assert.ok(
      turns.some((t) => t.text.includes("inspect the runtime verification")),
      "dest prompt landed on the tape",
    );
    const mouth = appWorkedReason(turns);
    if (mouth) {
      throw new Error(`type-dest Travis mouth: ${mouth}`);
    }

    const queueData = await readQueue(desk);
    assert.ok(
      Array.isArray(queueData.queue) ||
        Array.isArray((queueData.queue as { seats?: unknown[] })?.seats) ||
        Array.isArray(queueData.running),
      "queue snapshot contains running or queue items",
    );
  });
});
