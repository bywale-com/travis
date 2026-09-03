import assert from "node:assert/strict";
import test from "node:test";
import { narrateToolCall } from "./tool-narration";

test("a dispatch says which seat and what it is starting", () => {
  assert.equal(
    narrateToolCall("dispatch_to_seat", { seat: "sa", text: "demomessages" }),
    "Starting the SA on “demomessages”.",
  );
});

test("a blocking send says it is going to wait", () => {
  assert.match(
    narrateToolCall("send_to_seat", { seat: "engineer", text: "look at x" }) ?? "",
    /Sending “look at x” to the Engineer and waiting for the answer\./,
  );
});

test("a long line is clipped so the narration stays one line", () => {
  const line = narrateToolCall("dispatch_to_seat", {
    seat: "pm",
    text: "x".repeat(500),
  });
  assert.equal((line ?? "").length < 110, true);
  assert.match(line ?? "", /…/);
});

test("reads and barges announce themselves", () => {
  assert.equal(
    narrateToolCall("read_seat_reply", { seat: "engineer" }),
    "Reading what the Engineer said.",
  );
  assert.equal(
    narrateToolCall("barge_or_drop", { seat: "pm", action: "delete" }),
    "Dropping the PM's waiting line.",
  );
  assert.equal(
    narrateToolCall("barge_or_drop", { seat: "pm", action: "send" }),
    "Pushing the PM's waiting line through now.",
  );
});

test("instant lookups stay silent", () => {
  assert.equal(narrateToolCall("work_in_flight", {}), null);
  assert.equal(narrateToolCall("queue_snapshot", {}), null);
  assert.equal(narrateToolCall("list_seats", {}), null);
  assert.equal(narrateToolCall("set_view", { viewMode: "log" }), null);
  assert.equal(narrateToolCall("search_room", { q: "voice" }), null);
});

test("an unknown seat does not produce a broken sentence", () => {
  assert.equal(
    narrateToolCall("read_seat_reply", { seat: "nobody" }),
    "Reading what that seat said.",
  );
});
