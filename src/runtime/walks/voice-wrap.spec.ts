import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertThinkWorked, failUse } from "../app-worked";
import { openFreshRoom, readTurns, runtimeBaseUrl } from "../desk";
import { finalize, token, transcript } from "../doors";

const FIRST = "are you able to do that now?";
const SECOND = "and also put this on the tape";
const haveUrl = Boolean(runtimeBaseUrl());

describe("voice-wrap", { skip: !haveUrl }, () => {
  it("two spoken lines, then I’m done — wrap is a Travis mouth", async () => {
    const desk = await openFreshRoom();
    assert.ok(desk.sessionId.length > 0);

    const tok = await token(desk);
    assert.equal(typeof tok.wired, "boolean");
    assert.ok(tok.status === 200 || tok.status === 500);

    const first = await transcript(desk, FIRST);
    if (first.kind !== "json" || first.ok !== true) {
      failUse("voice-wrap", `first transcript ${first.kind} ok=${first.ok}`, await readTurns(desk));
    }
    const afterFirst = await readTurns(desk);
    if (!afterFirst.some((row) => row.role === "user" && row.text.includes(FIRST))) {
      failUse("voice-wrap", "first line never landed", afterFirst);
    }
    const afterSeq = Math.max(0, ...afterFirst.map((row) => row.seq));

    const second = await transcript(desk, SECOND);
    if (second.kind !== "json" || second.ok !== true) {
      failUse("voice-wrap", `second transcript ${second.kind} ok=${second.ok}`, await readTurns(desk));
    }
    const incremental = await readTurns(desk, afterSeq);
    if (!incremental.some((row) => row.text.includes(SECOND))) {
      failUse("voice-wrap", "second line never landed", await readTurns(desk));
    }

    const fin = await finalize(desk, "I'm done");
    const afterWrap = await readTurns(desk);
    if (!(fin.status >= 200 && fin.status < 500 && (fin.kind === "sse" || fin.kind === "json"))) {
      failUse("voice-wrap", `finalize was ${fin.kind} ${fin.status}`, afterWrap, fin);
    }
    assertThinkWorked(afterWrap, "voice-wrap", fin);
    assert.ok(true);
  });
});
