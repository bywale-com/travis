import assert from "node:assert/strict";
import { test } from "node:test";
import { busySendDecision, isAgentBusyError, isRunNotCancellable } from "./cursor-busy";

test("isAgentBusyError matches the SDK busy envelope", () => {
  assert.equal(
    isAgentBusyError(
      new Error("[agent_busy] Agent already has an active run"),
    ),
    true,
  );
});

test("isAgentBusyError matches AgentBusyError name and code", () => {
  assert.equal(
    isAgentBusyError({ name: "AgentBusyError", message: "busy" }),
    true,
  );
  assert.equal(isAgentBusyError({ code: "agent_busy" }), true);
});

test("isAgentBusyError ignores unrelated send failures", () => {
  assert.equal(
    isAgentBusyError(new Error("Run stream is no longer available")),
    false,
  );
});

test("isRunNotCancellable treats 409 as barge success", () => {
  assert.equal(
    isRunNotCancellable(new Error("[run_not_cancellable] already terminal")),
    true,
  );
  assert.equal(isRunNotCancellable({ code: "run_not_cancellable" }), true);
  assert.equal(isRunNotCancellable(new Error("agent_busy")), false);
});

test("busySendDecision enqueues when a live run is known", () => {
  assert.equal(
    busySendDecision({ storedRunId: "run-1", discoveredRunId: null }),
    "enqueue",
  );
  assert.equal(
    busySendDecision({ storedRunId: null, discoveredRunId: "run-2" }),
    "enqueue",
  );
});

test("busySendDecision race-retries only when no run id exists", () => {
  assert.equal(
    busySendDecision({ storedRunId: null, discoveredRunId: null }),
    "race-retry",
  );
});
