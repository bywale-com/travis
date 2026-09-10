import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { openRoom, readTurns, runtimeBaseUrl } from "../desk.ts";
import { send } from "../doors.ts";

const haveUrl = Boolean(runtimeBaseUrl());

describe("come-back", { skip: !haveUrl }, () => {
  it("re-opening the desk resumes the existing room and preserves turns", async () => {
    const desk1 = await openRoom();
    assert.ok(desk1.sessionId.length > 0);

    const text = "Persistent note across visits.";
    const sent = await send(desk1, text);
    assert.ok(sent.status >= 200 && sent.status < 500);

    const turns1 = await readTurns(desk1);
    assert.ok(turns1.some((t) => t.text.includes(text)));

    // Emulate navigating away / refreshing and reopening the session
    const desk2 = await openRoom();
    assert.equal(desk2.sessionId, desk1.sessionId, "same session resumed");

    const turns2 = await readTurns(desk2);
    assert.ok(
      turns2.some((t) => t.text.includes(text)),
      "turns preserved after coming back",
    );
  });
});
