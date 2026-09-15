import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertThinkWorked, destLeaveStarted, failUse } from "../app-worked";
import { openFreshRoom, readQueue, readTurns, runtimeBaseUrl } from "../desk";
import { DEST_CANARY } from "../dest-canary";
import { finalize, token, transcript } from "../doors";

const DEST_LINE = DEST_CANARY;
const haveUrl = Boolean(runtimeBaseUrl());

describe("voice-stream-arch", { skip: !haveUrl }, () => {
  it("dest on live transcript starts the leave before I’m done wraps", async () => {
    const desk = await openFreshRoom();
    assert.ok(desk.sessionId.length > 0);

    const tok = await token(desk);
    assert.equal(typeof tok.wired, "boolean");
    assert.ok(tok.status === 200 || tok.status === 500);

    const flushed = await transcript(desk, DEST_LINE);
    const afterFlush = await readTurns(desk);
    if (!(flushed.status >= 200 && flushed.status < 500 && (flushed.kind === "sse" || flushed.kind === "json"))) {
      failUse("voice-stream-arch flush", `transcript was ${flushed.kind} ${flushed.status}`, afterFlush, flushed);
    }
    if (flushed.kind === "json" && flushed.ok !== true) {
      failUse("voice-stream-arch flush", "transcript JSON was not ok", afterFlush, flushed);
    }
    if (flushed.error) {
      failUse("voice-stream-arch flush", `transcript sse error: ${flushed.error}`, afterFlush, flushed);
    }
    if (!afterFlush.some((row) => row.role === "user" && row.text.includes("runtime canary"))) {
      failUse("voice-stream-arch flush", "dest line never landed", afterFlush, flushed);
    }

    const queueBeforeWrap = await readQueue(desk);
    if (!destLeaveStarted(queueBeforeWrap)) {
      failUse(
        "voice-stream-arch leave-before-wrap",
        "queue empty after transcript — leave did not start before I’m done",
        afterFlush,
        flushed,
      );
    }

    const fin = await finalize(desk, "I'm done");
    const afterWrap = await readTurns(desk);
    if (!(fin.status >= 200 && fin.status < 500 && (fin.kind === "sse" || fin.kind === "json"))) {
      failUse("voice-stream-arch wrap", `finalize was ${fin.kind} ${fin.status}`, afterWrap, fin);
    }
    assertThinkWorked(afterWrap, "voice-stream-arch wrap", fin);
    assert.ok(true);
  });
});
