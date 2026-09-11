import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertAppWorked, travisSpoke } from "../app-worked";
import { openFreshRoom, readTurns, runtimeBaseUrl } from "../desk";
import { send } from "../doors";

const haveUrl = Boolean(runtimeBaseUrl());
const FIRST = "The capsule word is lantern.";
const SECOND = "What was the last thing of substance we discussed in this chat?";

describe("type-walk-back", { skip: !haveUrl }, () => {
  it("Type a line, wait, ask what we discussed — Travis speaks twice, never run error", async () => {
    const desk = await openFreshRoom();

    const first = await send(desk, FIRST, { chipSeatKeys: ["travis"] });
    assert.ok(first.status >= 200 && first.status < 500);
    assert.ok(first.kind === "sse" || first.kind === "json", `first send must not be HTML, got ${first.kind}`);
    const afterFirst = await readTurns(desk);
    assert.ok(afterFirst.some((t) => t.role === "user" && t.text.includes("lantern")));
    assertAppWorked(afterFirst, "type-walk-back beat 1");
    const firstSpoke = afterFirst.filter(
      (t) => t.kind === "agent_post" && t.seatKey === "travis" && t.speakable,
    ).length;

    const second = await send(desk, SECOND, { chipSeatKeys: ["travis"] });
    assert.ok(second.status >= 200 && second.status < 500);
    assert.ok(second.kind === "sse" || second.kind === "json", `walk-back send must not be HTML, got ${second.kind}`);
    const afterSecond = await readTurns(desk);
    assert.ok(afterSecond.some((t) => t.role === "user" && t.text.includes("last thing of substance")));
    assertAppWorked(afterSecond, "type-walk-back beat 2");
    assert.ok(travisSpoke(afterSecond), "walk-back still has a Travis post");
    const spoke = afterSecond.filter(
      (t) => t.kind === "agent_post" && t.seatKey === "travis" && t.speakable,
    ).length;
    assert.ok(
      spoke > firstSpoke,
      "second beat added a Travis post — the lived miss was run error here",
    );
  });
});
