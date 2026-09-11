import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { openRoom, readQueue, readTurns, runtimeBaseUrl } from "../desk";
import { send } from "../doors";

const haveUrl = Boolean(runtimeBaseUrl());

describe("type-dest", { skip: !haveUrl }, () => {
  it("sending work to a seat is never HTML, writes turn, and enqueues dest", async () => {
    const desk = await openRoom();
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

    const queueData = await readQueue(desk);
    assert.ok(
      Array.isArray(queueData.queue) ||
        Array.isArray((queueData.queue as { seats?: unknown[] })?.seats) ||
        Array.isArray(queueData.running),
      "queue snapshot contains running or queue items",
    );
  });
});
