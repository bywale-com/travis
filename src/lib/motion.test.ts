import assert from "node:assert/strict";
import test from "node:test";
import {
  formatFiledPlan,
  formatMotionList,
  humanizeMotionTool,
  isMotionStepAllowed,
  isMotionStepRefused,
  motionStepN,
  motionUnder,
  parseBacklogView,
} from "./motion";

test("seat sends and nested file_plan cannot be motion steps", () => {
  for (const tool of [
    "send_to_seat",
    "dispatch_to_seat",
    "barge_or_drop",
    "end_session",
    "set_view",
    "file_plan",
    "create_agent",
    "sit_agent",
    "unfold_repo",
  ]) {
    assert.equal(isMotionStepRefused(tool), true, tool);
    assert.equal(isMotionStepAllowed(tool), false, tool);
  }
});

test("his house and catalog tools can be motion steps", () => {
  for (const tool of [
    "list_initiatives",
    "rename_initiative",
    "list_os",
    "write_os",
    "run_box",
    "write_box",
    "prove_box",
    "list_backlog",
  ]) {
    assert.equal(isMotionStepAllowed(tool), true, tool);
  }
});

test("backlog view defaults to all", () => {
  assert.equal(parseBacklogView(undefined), "all");
  assert.equal(parseBacklogView("in_motion"), "in_motion");
  assert.equal(parseBacklogView("nope"), "all");
});

test("step n is the running seq or last done plus one", () => {
  assert.equal(motionStepN({ stepM: 2, currentSeq: 1, doneCount: 0 }), 1);
  assert.equal(motionStepN({ stepM: 2, currentSeq: null, doneCount: 1 }), 2);
  assert.equal(motionStepN({ stepM: 2, currentSeq: null, doneCount: 2 }), 2);
});

test("under is Travis plus a humanized tool", () => {
  assert.equal(motionUnder("rename_initiative"), "Travis · Rename Initiative");
  assert.equal(humanizeMotionTool("list_os"), "List Os");
});

test("filed receipt names id title and count", () => {
  const text = formatFiledPlan({
    id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    title: "Rename those two",
    stepCount: 2,
  });
  assert.match(text, /aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/);
  assert.match(text, /Rename those two/);
  assert.match(text, /2 steps/);
});

test("motion list is processes only", () => {
  const text = formatMotionList([
    {
      kind: "motion",
      id: "m1",
      title: "Rename those two",
      status: "waiting",
      stepN: 1,
      stepM: 2,
      under: "Travis · Rename Initiative",
      updatedAt: new Date(),
    },
  ]);
  assert.match(text, /1 in motion/);
  assert.match(text, /step 1 of 2/);
  assert.doesNotMatch(text, /next engineer/i);
});
