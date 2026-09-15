import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertThinkWorked, failUse } from "../app-worked";
import { readTurns, runtimeBaseUrl } from "../desk";
import { closePhone, launchPhone, openLogTalk, watchPosts } from "./harness";
import { STT_DOUBLE } from "./injections";

const haveUrl = Boolean(runtimeBaseUrl());

describe("browser talk-mode", { skip: !haveUrl }, () => {
  it("Talk interim/final stay local until I'm done, then /finalize", async () => {
    const phone = await launchPhone({ initScript: STT_DOUBLE });
    try {
      const posts = watchPosts(phone.page);
      await openLogTalk(phone.page);
      await phone.page.waitForFunction(
        () => ((window as unknown as { __travisSttStarts?: number }).__travisSttStarts ?? 0) >= 1,
        { timeout: 20_000 },
      );
      const started = await phone.page.evaluate(() => (window as unknown as { __travisSttStarts?: number }).__travisSttStarts ?? 0);
      assert.ok(started >= 1, "Talk must start the SpeechRecognition double");

      await phone.page.evaluate(() => {
        (window as unknown as { __travisEmitStt: (f: string[], i: string) => void }).__travisEmitStt(
          [],
          "hello there",
        );
      });
      await phone.page.getByText("hello there", { exact: false }).first().waitFor({ timeout: 10_000 });
      await phone.page.waitForTimeout(600);
      assert.equal(posts.finalizes.length, 0, "interim text must not POST /finalize");

      await phone.page.evaluate(() => {
        (window as unknown as { __travisEmitStt: (f: string[], i: string) => void }).__travisEmitStt(
          ["hello there"],
          "",
        );
      });
      await phone.page.waitForTimeout(800);
      assert.equal(posts.finalizes.length, 0, "final text without I'm done must not send");

      await phone.page.evaluate(() => {
        (window as unknown as { __travisEmitStt: (f: string[], i: string) => void }).__travisEmitStt(
          ["hello there I'm done"],
          "",
        );
      });
      await phone.page.waitForFunction(
        () => (window as unknown as { __travisEmitStt?: unknown }).__travisEmitStt,
      );
      const deadline = Date.now() + 120_000;
      let turns = await readTurns(phone.desk);
      while (Date.now() < deadline) {
        if (posts.finalizes.length > 0 && turns.some((row) => row.role === "user")) {
          try {
            assertThinkWorked(turns, "talk-mode");
            break;
          } catch {
            /* keep waiting for the mouth */
          }
        }
        await phone.page.waitForTimeout(1500);
        turns = await readTurns(phone.desk);
      }
      assert.ok(posts.finalizes.length >= 1, "I'm done must POST /finalize");
      if (!turns.some((row) => row.role === "user" && /hello there/i.test(row.text))) {
        failUse("talk-mode", "talk line never landed", turns);
      }
      assertThinkWorked(turns, "talk-mode");
    } finally {
      await closePhone(phone);
    }
  });
});
