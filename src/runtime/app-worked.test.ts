import assert from "node:assert/strict";
import { test } from "node:test";
import {
  destLeaveOnTape,
  destLeaveStarted,
  thinkMissReason,
  travisSpeakCount,
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

test("a generate miss fails the think-walk", () => {
  const turns: TapeTurn[] = [
    turn({ kind: "user", role: "user", text: "travis", seq: 1 }),
    turn({
      kind: "status",
      text: "Travis error: generate failed",
      seq: 2,
    }),
  ];
  assert.match(thinkMissReason(turns) ?? "", /run error/);
});

test("?? run error with empty-looking status still fails", () => {
  const turns: TapeTurn[] = [
    turn({ kind: "status", text: "run error", seq: 1 }),
  ];
  assert.match(thinkMissReason(turns) ?? "", /run error/);
});

test("named unwired is red on a think-walk", () => {
  const turns: TapeTurn[] = [
    turn({ kind: "user", role: "user", text: "hello", seq: 1 }),
    turn({ kind: "status", text: "Travis isn’t wired", seq: 2 }),
  ];
  assert.match(thinkMissReason(turns) ?? "", /isn.t wired/i);
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
  assert.equal(thinkMissReason(turns), null);
});

test("user line alone is not the think use", () => {
  const turns: TapeTurn[] = [
    turn({ kind: "user", role: "user", text: "One-line note on the tape.", seq: 1 }),
  ];
  assert.match(thinkMissReason(turns) ?? "", /did not speak/);
});

test("dest leave is running or queued, not a Travis essay", () => {
  assert.equal(destLeaveStarted({ queue: [], running: [] }), false);
  assert.equal(
    destLeaveStarted({ queue: [], running: [{ seatKey: "engineer" }] }),
    true,
  );
  assert.equal(
    destLeaveStarted({ queue: { seats: [{ seatKey: "engineer" }] }, running: [] }),
    true,
  );
});

test("dest leave on tape is a dest-seat user turn, not Travis wrap", () => {
  assert.equal(
    destLeaveOnTape([
      turn({
        kind: "user",
        role: "user",
        seatKey: "travis",
        speakable: true,
        text: "Engineer, inspect.",
        seq: 1,
      }),
      turn({
        kind: "agent_post",
        seatKey: "travis",
        speakable: true,
        text: "Engineer is already inspecting.",
        seq: 2,
      }),
    ]),
    false,
  );
  assert.equal(
    destLeaveOnTape([
      turn({
        kind: "user",
        role: "user",
        seatKey: "engineer",
        speakable: true,
        text: "Engineer, inspect.",
        seq: 2,
      }),
    ]),
    true,
  );
});

test("walk-back counts speakable Travis posts", () => {
  const turns: TapeTurn[] = [
    turn({ kind: "agent_post", seatKey: "travis", speakable: true, text: "one", seq: 1 }),
    turn({ kind: "agent_post", seatKey: "travis", speakable: false, text: "narration", seq: 2 }),
    turn({ kind: "agent_post", seatKey: "travis", speakable: true, text: "two", seq: 3 }),
  ];
  assert.equal(travisSpeakCount(turns), 2);
});
