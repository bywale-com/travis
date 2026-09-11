import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertThinkWorked, failUse } from "../app-worked";
import { openFreshRoom, openRoom, readTurns, runtimeBaseUrl } from "../desk";
import { send } from "../doors";

const haveUrl = Boolean(runtimeBaseUrl());

describe("come-back", { skip: !haveUrl }, () => {
  it("re-opening the desk resumes the existing room and preserves a working turn", async () => {
    const desk1 = await openFreshRoom();
    assert.ok(desk1.sessionId.length > 0);

    const text = "Persistent note across visits.";
    const sent = await send(desk1, text, { chipSeatKeys: ["travis"] });
    const turns1 = await readTurns(desk1);
    if (!(sent.status >= 200 && sent.status < 500)) {
      failUse("come-back before leave", `send was ${sent.kind} ${sent.status}`, turns1, sent);
    }
    if (!turns1.some((t) => t.text.includes(text))) {
      failUse("come-back before leave", "line never landed", turns1, sent);
    }
    assertThinkWorked(turns1, "come-back before leave", sent);

    const desk2 = await openRoom(desk1);
    if (desk2.sessionId !== desk1.sessionId) {
      failUse(
        "come-back",
        `second open minted ${desk2.sessionId}, not ${desk1.sessionId}`,
        await readTurns(desk2),
      );
    }

    const turns2 = await readTurns(desk2);
    if (!turns2.some((t) => t.text.includes(text))) {
      failUse("come-back after return", "line gone after resume", turns2);
    }
    assertThinkWorked(turns2, "come-back after return");
    assert.ok(true);
  });
});
