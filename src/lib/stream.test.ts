import assert from "node:assert/strict";
import { test } from "node:test";
import {
  decideTravisStreamClose,
  glowFromLive,
  nextStreamMessage,
  pickAnsweringPost,
  pickFoundingFallbackPost,
  processEventValues,
  processFloorAt,
  processFromCursorEvent,
  streamPollMs,
  streamShowsCard,
} from "./stream";

test("card hangs only when a close post landed", () => {
  assert.equal(
    streamShowsCard({ status: "live", closeTurnId: null }),
    false,
  );
  assert.equal(
    streamShowsCard({ status: "failed", closeTurnId: null }),
    false,
  );
  assert.equal(
    streamShowsCard({ status: "completed", closeTurnId: "turn-1" }),
    true,
  );
});

test("glow is the live row, or dest live-run until the first event", () => {
  assert.equal(glowFromLive(null, false), false);
  assert.equal(glowFromLive(null, true), true);
  assert.equal(
    glowFromLive({ bindingId: "b", seatKey: "pm" }, false),
    true,
  );
});

test("message grow stays one seq; a new beat inserts", () => {
  const last = {
    id: "e1",
    seq: 1,
    kind: "message" as const,
    body: "Hi there.",
    tool: "",
  };
  const grow = nextStreamMessage(last, "Hi there. More.", "dest");
  assert.equal(grow.mode, "update");
  assert.match(grow.text, /More/);

  const neu = nextStreamMessage(last, "Second thought.", "dest");
  assert.equal(neu.mode, "insert");
  assert.equal(neu.text, "Second thought.");
});

test("empty tool is forbidden on process", () => {
  assert.equal(processEventValues({ tool: "  " }), null);
  assert.deepEqual(processEventValues({ tool: "run_box", body: "" }), {
    tool: "run_box",
    body: "",
  });
});

test("Cursor tool_call yields the name the event actually has", () => {
  assert.equal(processFromCursorEvent({ type: "status" }), null);
  const ev = processFromCursorEvent({
    type: "tool_call",
    name: "ReadFile",
    text: "src/lib/stream.ts",
  });
  assert.deepEqual(ev, { tool: "ReadFile", body: "src/lib/stream.ts" });

  const leftover = processFromCursorEvent({
    type: "tool_use",
    tool: "Shell",
    command: "ls",
  });
  assert.equal(leftover?.tool, "Shell");
  assert.match(leftover?.body ?? "", /command/);
});

test("phone poll stays in the 1–3s jitter", () => {
  assert.equal(streamPollMs(0), 1000);
  const high = streamPollMs(0.999);
  assert.ok(high >= 1000 && high < 3000);
});

test("answering post is after this trigger and after this process, not session-latest", () => {
  const triggerSeq = 746;
  const processFloor = processFloorAt("2026-09-05T16:32:35.000Z", "2026-09-05T16:32:35.000Z");
  const old = {
    id: "745",
    seq: 745,
    createdAt: "2026-09-05T10:41:00.000Z",
  };
  const answer = {
    id: "747",
    seq: 747,
    createdAt: "2026-09-05T16:32:46.000Z",
  };
  assert.equal(
    pickAnsweringPost([old, answer], triggerSeq, processFloor)?.id,
    "747",
  );
  assert.equal(pickAnsweringPost([old], triggerSeq, processFloor), null);
  assert.equal(
    pickFoundingFallbackPost([old, answer], triggerSeq)?.id,
    "747",
  );
  assert.equal(pickFoundingFallbackPost([old], triggerSeq), null);
});

test("founding fallback hangs after the trigger when he never spoke after tools", () => {
  const founding = {
    id: "founding",
    seq: 800,
    createdAt: "2026-09-05T16:40:00.000Z",
  };
  const floor = processFloorAt(
    "2026-09-05T16:40:10.000Z",
    "2026-09-05T16:39:50.000Z",
  );
  assert.equal(pickAnsweringPost([founding], 799, floor), null);
  assert.equal(pickFoundingFallbackPost([founding], 799)?.id, "founding");
});

test("close stays live until the answering post; failed with no post has no card", () => {
  assert.deepEqual(
    decideTravisStreamClose({
      laborOpen: true,
      answeringPostId: "747",
      foundingFallbackPostId: null,
    }),
    { action: "stay" },
  );
  assert.deepEqual(
    decideTravisStreamClose({
      laborOpen: false,
      answeringPostId: null,
      foundingFallbackPostId: null,
    }),
    { action: "stay" },
  );
  assert.deepEqual(
    decideTravisStreamClose({
      laborOpen: false,
      answeringPostId: "747",
      foundingFallbackPostId: "745",
    }),
    { action: "close", closeTurnId: "747" },
  );
  assert.deepEqual(
    decideTravisStreamClose({
      laborOpen: false,
      failed: true,
      answeringPostId: "747",
      foundingFallbackPostId: null,
    }),
    { action: "close", closeTurnId: "747" },
  );
  assert.deepEqual(
    decideTravisStreamClose({
      laborOpen: false,
      failed: true,
      answeringPostId: null,
      foundingFallbackPostId: null,
    }),
    { action: "fail-without-card" },
  );
  assert.deepEqual(
    decideTravisStreamClose({
      laborOpen: false,
      foundingFallback: true,
      answeringPostId: null,
      foundingFallbackPostId: "founding",
    }),
    { action: "close", closeTurnId: "founding" },
  );
});
