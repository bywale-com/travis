import assert from "node:assert/strict";
import { test } from "node:test";
import {
  glowFromLive,
  nextStreamMessage,
  processEventValues,
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
