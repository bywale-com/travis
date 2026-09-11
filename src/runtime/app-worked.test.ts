import assert from "node:assert/strict";
import { test } from "node:test";
import {
  appWorkedReason,
  type TapeTurn,
} from "./app-worked";

function turn(partial: Partial<TapeTurn> & Pick<TapeTurn, "kind" | "text">): TapeTurn {
  return {
    role: "assistant",
    seatKey: null,
    speakable: false,
    seq: 1,
    ...partial,
  };
}

test("a generate miss fails the app", () => {
  const turns: TapeTurn[] = [
    turn({ kind: "user", role: "user", text: "travis", seq: 1 }),
    turn({
      kind: "status",
      text: "Travis error: generate failed",
      seq: 2,
    }),
  ];
  assert.match(appWorkedReason(turns) ?? "", /run error/);
});

test("?? run error with empty-looking status still fails", () => {
  const turns: TapeTurn[] = [
    turn({ kind: "status", text: "run error", seq: 1 }),
  ];
  assert.match(appWorkedReason(turns) ?? "", /run error/);
});

test("named unwired is not a lie — the app named the miss", () => {
  const turns: TapeTurn[] = [
    turn({ kind: "user", role: "user", text: "hello", seq: 1 }),
    turn({ kind: "status", text: "Travis isn’t wired", seq: 2 }),
  ];
  assert.equal(appWorkedReason(turns), null);
});

test("Travis spoke — do not grade the sentence", () => {
  const turns: TapeTurn[] = [
    turn({ kind: "user", role: "user", text: "hello", seq: 1 }),
    turn({
      kind: "agent_post",
      seatKey: "travis",
      speakable: true,
      text: "…",
      seq: 2,
    }),
  ];
  assert.equal(appWorkedReason(turns), null);
});

test("user line alone is not the app", () => {
  const turns: TapeTurn[] = [
    turn({ kind: "user", role: "user", text: "One-line note on the tape.", seq: 1 }),
  ];
  assert.match(appWorkedReason(turns) ?? "", /did not speak/);
});
