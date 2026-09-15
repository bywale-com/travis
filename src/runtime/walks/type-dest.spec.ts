import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { destLeaveOnTape, destLeaveStarted, failUse } from "../app-worked";
import { DEST_CANARY } from "../dest-canary";
import { openFreshRoom, readQueue, readTurns, runtimeBaseUrl } from "../desk";
import { send } from "../doors";

const haveUrl = Boolean(runtimeBaseUrl());

describe("type-dest", { skip: !haveUrl }, () => {
  it("dest to a seat starts a leave — not the Engineer essay, not Travis wrap", async () => {
    const desk = await openFreshRoom();
    assert.ok(desk.sessionId.length > 0);

    const destPrompt = DEST_CANARY;
    const sent = await send(desk, destPrompt, { chipSeatKeys: ["engineer"] });
    const turns = await readTurns(desk);
    if (!(sent.status >= 200 && sent.status < 500 && (sent.kind === "sse" || sent.kind === "json"))) {
      failUse("type-dest", `send was ${sent.kind} ${sent.status}`, turns, sent);
    }
    if (!turns.some((t) => t.text.includes("runtime canary"))) {
      failUse("type-dest", "dest prompt never landed on the tape", turns, sent);
    }

    const queueData = await readQueue(desk);
    if (!destLeaveStarted(queueData) && !destLeaveOnTape(turns)) {
      failUse(
        "type-dest",
        `no dest leave on queue or tape (sse error=${sent.error ?? "none"})`,
        turns,
        sent,
      );
    }
    assert.ok(true);
  });
});
