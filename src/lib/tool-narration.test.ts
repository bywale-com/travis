import assert from "node:assert/strict";
import test from "node:test";
import { narrateToolCall } from "./tool-narration";

test("a dispatch says it is calling, not that the run started", () => {
  assert.equal(
    narrateToolCall("dispatch_to_seat", { seat: "sa", text: "demomessages" }),
    "Calling the SA with “demomessages”.",
  );
});

test("a blocking send does not claim it is waiting on an answer", () => {
  assert.equal(
    narrateToolCall("send_to_seat", { seat: "engineer", text: "look at x" }),
    "Calling the Engineer with “look at x”.",
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
  assert.equal(narrateToolCall("read_seat_reply", { seat: "engineer" }), null);
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
  assert.equal(narrateToolCall("list_initiatives", {}), null);
  assert.equal(narrateToolCall("list_os", { path: "/" }), null);
  assert.equal(narrateToolCall("read_os", { path: "/protocols/pm.md" }), null);
  assert.equal(narrateToolCall("write_os", { path: "/protocols/pm.md" }), null);
  assert.equal(narrateToolCall("run_box", { cmd: "ls" }), null);
  assert.equal(narrateToolCall("read_box", { path: "/tmp/a" }), null);
  assert.equal(narrateToolCall("write_box", { path: "/tmp/a", body: "x" }), null);
  assert.equal(narrateToolCall("read_initiative", { id: "x" }), null);
  assert.equal(narrateToolCall("list_backlog", { view: "in_motion" }), null);
  assert.equal(narrateToolCall("file_plan", { steps: [] }), null);
  assert.equal(narrateToolCall("read_seat_reply", { seat: "sa" }), null);
});

test("creating an agent is announced by name", () => {
  assert.equal(
    narrateToolCall("create_agent", { label: "Eng 2" }),
    "Creating Eng 2.",
  );
});

test("sitting a person names who and the protocol", () => {
  assert.equal(
    narrateToolCall("sit_agent", { who: "pat", protocol: "pm" }),
    "Seating pat on pm.",
  );
});

test("marking done is announced", () => {
  assert.equal(
    narrateToolCall("mark_initiative_done", { id: "x" }),
    "Marking that initiative done.",
  );
  assert.equal(
    narrateToolCall("rename_initiative", { id: "x", title: "Artifact door" }),
    "Renaming that initiative.",
  );
  assert.equal(
    narrateToolCall("rename_room", { title: "Gang's all here" }),
    "Renaming the room.",
  );
});

test("an unknown seat does not produce a broken sentence", () => {
  assert.equal(
    narrateToolCall("barge_or_drop", { seat: "nobody", action: "send" }),
    "Pushing that seat's waiting line through now.",
  );
});
