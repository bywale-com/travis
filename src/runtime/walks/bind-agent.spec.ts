import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
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

describe("bind-agent", { skip: !haveUrl }, () => {
  it("bind_agent tool leaves a living member — no Cursor HTTP create", async () => {
    const desk = await openFreshRoom();
    const label = `RtBind${Date.now().toString(36)}`;
    const cursorAgentId = `bc-${randomUUID()}`;
    const before = await readSession(desk);
    const beforeCount = before?.seats.length ?? 0;

    const tool = await runTravisTool(desk, "bind_agent", {
      label,
      cursor_agent_id: cursorAgentId,
      join: true,
    });

    const { turns, streams } = await readTurnsPayload(desk);
    if (!tool.ok) {
      failUse(
        "bind-agent",
        `bind_agent tool failed: ${tool.text}`,
        turns,
        { kind: "json", status: tool.status },
      );
    }
    if (!/bound/i.test(tool.text)) {
      failUse("bind-agent", `unexpected tool receipt: ${tool.text}`, turns);
    }

    const after = await readSession(desk);
    if (!after) {
      failUse("bind-agent", "session missing after bind", turns);
    }
    const member = after.seats.find((s) => s.label === label);
    if (!member) {
      failUse(
        "bind-agent",
        `new member ${label} not on roster (had ${beforeCount}, now ${after.seats.length})`,
        turns,
      );
    }

    if (streams.live.length > 0) {
      failUse(
        "bind-agent",
        `travis stream still live after bind_agent (${streams.live.length})`,
        turns,
      );
    }

    assert.ok(member.id.length > 0);
  });
});
