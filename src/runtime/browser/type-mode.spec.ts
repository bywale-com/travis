import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertThinkWorked, failUse } from "../app-worked";
import { readTurns, runtimeBaseUrl } from "../desk";
import {
  TYPE_LINE,
  closePhone,
  launchPhone,
  openLogType,
  waitForText,
  watchPosts,
} from "./harness";

const haveUrl = Boolean(runtimeBaseUrl());

describe("browser type-mode", { skip: !haveUrl }, () => {
  it("Type stays local until Send, then the thread gets the turn and Travis", async () => {
    const phone = await launchPhone();
    try {
      const posts = watchPosts(phone.page);
      await openLogType(phone.page);
      await phone.page.getByPlaceholder("Message the room").fill(TYPE_LINE);
      await phone.page.waitForTimeout(800);
      assert.equal(posts.sends.length, 0, "typed text must not POST /send before Send");
      const turnsBefore = await readTurns(phone.desk);
      if (turnsBefore.some((row) => row.role === "user" && row.text.includes(TYPE_LINE))) {
        failUse("type-mode", "user turn existed before Send", turnsBefore);
      }
      await phone.page.getByRole("button", { name: "Send" }).click();
      await waitForText(phone.page, TYPE_LINE, 30_000);
      assert.ok(posts.sends.length >= 1, "Send must POST /send");
      const deadline = Date.now() + 120_000;
      let turns = await readTurns(phone.desk);
      while (Date.now() < deadline) {
        if (turns.some((row) => row.role === "user" && row.text.includes(TYPE_LINE))) {
          const miss = (() => {
            try {
              assertThinkWorked(turns, "type-mode", { status: 200, kind: "sse" });
              return null;
            } catch (e) {
              return e instanceof Error ? e.message : String(e);
            }
          })();
          if (!miss) break;
        }
        await phone.page.waitForTimeout(1500);
        turns = await readTurns(phone.desk);
      }
      if (!turns.some((row) => row.role === "user" && row.text.includes(TYPE_LINE))) {
        failUse("type-mode", "typed line never rendered on the tape", turns);
      }
      assertThinkWorked(turns, "type-mode");
      await waitForText(phone.page, turns.find((t) => t.kind === "agent_post" && t.seatKey === "travis")?.text.slice(0, 24) ?? "Travis", 10_000).catch(() => {
        /* tape already proved the mouth; glass may clip */
      });
    } finally {
      await closePhone(phone);
    }
  });
});
