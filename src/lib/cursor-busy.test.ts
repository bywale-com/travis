import assert from "node:assert/strict";
import { test } from "node:test";
import { isAgentBusyError } from "./cursor-busy";

test("isAgentBusyError matches the SDK busy envelope", () => {
  assert.equal(
    isAgentBusyError(
      new Error("[agent_busy] Agent already has an active run"),
    ),
    true,
  );
});

test("isAgentBusyError ignores unrelated send failures", () => {
  assert.equal(
    isAgentBusyError(new Error("Run stream is no longer available")),
    false,
  );
});
