import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { openRoom, readTurns, runtimeBaseUrl } from "../desk";
import { finalize, token, transcript } from "../doors";

const FIRST = "are you able to do that now?";
const SECOND = "and also put this on the tape";
const haveUrl = Boolean(runtimeBaseUrl());

describe("voice-wrap", { skip: !haveUrl }, () => {
  it("opens one room, takes a token, writes two user turns, then finalize is a stream not HTML", async () => {
    const desk = await openRoom();
    assert.ok(desk.sessionId.length > 0);

    const tok = await token(desk);
    assert.equal(typeof tok.wired, "boolean");
    assert.ok(tok.status === 200 || tok.status === 500);

    const first = await transcript(desk, FIRST);
    assert.equal(first.kind, "json");
    assert.equal(first.ok, true);

    const afterFirst = await readTurns(desk);
    assert.ok(
      afterFirst.some((row) => row.role === "user" && row.text.includes(FIRST)),
    );
    const afterSeq = Math.max(0, ...afterFirst.map((row) => row.seq));

    const second = await transcript(desk, SECOND);
    assert.equal(second.kind, "json");
    assert.equal(second.ok, true);

    const incremental = await readTurns(desk, afterSeq);
    assert.ok(incremental.some((row) => row.text.includes(SECOND)));

    const all = await readTurns(desk);
    assert.ok(all.some((row) => row.role === "user" && row.text.includes(FIRST)));
    assert.ok(all.some((row) => row.role === "user" && row.text.includes(SECOND)));

    const fin = await finalize(desk, "I'm done");
    assert.ok(fin.status >= 200 && fin.status < 500);
    assert.ok(fin.kind === "sse" || fin.kind === "json", `finalize must not be HTML, got ${fin.kind}`);
  });
});
