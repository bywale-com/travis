import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { failUse } from "../app-worked";
import {
  openFreshRoom,
  readSession,
  readTurnsPayload,
  runtimeBaseUrl,
  runTravisTool,
} from "../desk";

const haveUrl = Boolean(runtimeBaseUrl());

describe("create-agent", { skip: !haveUrl }, () => {
  it("create_agent tool leaves a living member with a bc- bind — stream closes", async () => {
    const desk = await openFreshRoom();
    const label = `RtWalk${Date.now().toString(36)}`;
    const before = await readSession(desk);
    const beforeCount = before?.seats.length ?? 0;

    const tool = await runTravisTool(desk, "create_agent", {
      label,
      join: true,
    });

    const { turns, streams } = await readTurnsPayload(desk);
    if (!tool.ok) {
      failUse(
        "create-agent",
        `create_agent tool failed: ${tool.text}`,
        turns,
        { kind: "json", status: 400 },
      );
    }
    if (!/created/i.test(tool.text)) {
      failUse("create-agent", `unexpected tool receipt: ${tool.text}`, turns);
    }

    const after = await readSession(desk);
    if (!after) {
      failUse("create-agent", "session missing after create", turns);
    }
    const member = after.seats.find((s) => s.label === label);
    if (!member) {
      failUse(
        "create-agent",
        `new member ${label} not on roster (had ${beforeCount}, now ${after.seats.length})`,
        turns,
      );
    }

    if (streams.live.length > 0) {
      failUse(
        "create-agent",
        `travis stream still live after create_agent (${streams.live.length})`,
        turns,
      );
    }

    assert.ok(member.id.length > 0);
  });
});
