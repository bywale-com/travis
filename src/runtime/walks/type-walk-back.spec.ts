import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertThinkWorked,
  failUse,
  travisSpeakCount,
} from "../app-worked";
import { openFreshRoom, readTurns, runtimeBaseUrl } from "../desk";
import { send } from "../doors";

const haveUrl = Boolean(runtimeBaseUrl());
const FIRST = "The capsule word is lantern.";
const SECOND = "What was the last thing of substance we discussed in this chat?";

describe("type-walk-back", { skip: !haveUrl }, () => {
  it("Type a line, wait, ask what we discussed — Travis posts twice", async () => {
    const desk = await openFreshRoom();

    const first = await send(desk, FIRST, { chipSeatKeys: ["travis"] });
    const afterFirst = await readTurns(desk);
    if (!(first.status >= 200 && first.status < 500 && (first.kind === "sse" || first.kind === "json"))) {
      failUse("type-walk-back beat 1", `send was ${first.kind} ${first.status}`, afterFirst, first);
    }
    if (!afterFirst.some((t) => t.role === "user" && t.text.includes("lantern"))) {
      failUse("type-walk-back beat 1", "lantern line never landed", afterFirst, first);
    }
    assertThinkWorked(afterFirst, "type-walk-back beat 1", first);
    const firstCount = travisSpeakCount(afterFirst);

    const second = await send(desk, SECOND, { chipSeatKeys: ["travis"] });
    const afterSecond = await readTurns(desk);
    if (!(second.status >= 200 && second.status < 500 && (second.kind === "sse" || second.kind === "json"))) {
      failUse("type-walk-back beat 2", `send was ${second.kind} ${second.status}`, afterSecond, second);
    }
    if (!afterSecond.some((t) => t.role === "user" && t.text.includes("last thing of substance"))) {
      failUse("type-walk-back beat 2", "walk-back question never landed", afterSecond, second);
    }
    assertThinkWorked(afterSecond, "type-walk-back beat 2", second);
    const secondCount = travisSpeakCount(afterSecond);
    if (secondCount <= firstCount) {
      failUse(
        "type-walk-back beat 2",
        `second beat did not add a Travis post (count ${firstCount} → ${secondCount})`,
        afterSecond,
        second,
      );
    }
    assert.ok(true);
  });
});
