import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertAppWorked } from "../app-worked";
import { openFreshRoom, openRoom, readTurns, runtimeBaseUrl } from "../desk";
import { send } from "../doors";

const haveUrl = Boolean(runtimeBaseUrl());

describe("come-back", { skip: !haveUrl }, () => {
  it("re-opening the desk resumes the existing room and preserves a working turn", async () => {
    const desk1 = await openFreshRoom();
    assert.ok(desk1.sessionId.length > 0);

    const text = "Persistent note across visits.";
    const sent = await send(desk1, text, { chipSeatKeys: ["travis"] });
    assert.ok(sent.status >= 200 && sent.status < 500);
    const turns1 = await readTurns(desk1);
    assert.ok(turns1.some((t) => t.text.includes(text)));
    assertAppWorked(turns1, "come-back before leave");

    const desk2 = await openRoom();
    assert.equal(desk2.sessionId, desk1.sessionId, "same session resumed");

    const turns2 = await readTurns(desk2);
    assert.ok(
      turns2.some((t) => t.text.includes(text)),
      "turns preserved after coming back",
    );
    assertAppWorked(turns2, "come-back after return");
  });
});
