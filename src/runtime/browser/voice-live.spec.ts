import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertThinkWorked, destLeaveOnTape, destLeaveStarted, failUse } from "../app-worked";
import { readQueue, readTurns, runtimeBaseUrl } from "../desk";
import { closePhone, dumpFaceMiss, launchPhone, whichDoor } from "./harness";
import { REALTIME_USAGE_HOOK } from "./injections";

const haveUrl = Boolean(runtimeBaseUrl());

describe("browser voice-live", { skip: !haveUrl }, () => {
  it("real Voice canary: fake mic → Live → dest leave before I'm done → wrap", async () => {
    let phone: Awaited<ReturnType<typeof launchPhone>> | undefined;
    try {
      try {
        phone = await launchPhone({ fakeAudio: true, initScript: REALTIME_USAGE_HOOK });
      } catch (e) {
        const headed = process.env.DISPLAY || process.env.TRAVIS_BROWSER_HEADED === "1";
        if (headed) throw e;
        console.log("runtime: headless Voice launch missed; retrying headed under current DISPLAY/Xvfb");
        phone = await launchPhone({
          fakeAudio: true,
          headed: true,
          initScript: REALTIME_USAGE_HOOK,
        });
      }
      if (!phone) throw new Error("launchPhone did not return a phone");
      const liveLine = phone.page.getByText("Talking with Travis…");
      const unwired = phone.page.getByText("Travis isn’t wired");
      const first = await Promise.race([
        liveLine.waitFor({ timeout: 30_000 }).then(() => "live" as const),
        unwired.waitFor({ timeout: 30_000 }).then(() => "unwired" as const),
      ]).catch(() => "miss" as const);
      if (first === "unwired") {
        failUse("voice-live", "Live is unwired — canary is red", await readTurns(phone.desk));
      }
      if (first === "miss") {
        await dumpFaceMiss(phone.page, await whichDoor(phone.page));
        failUse("voice-live", "Voice never showed Talking with Travis…", await readTurns(phone.desk));
      }

      const destDeadline = Date.now() + 45_000;
      let leaveBeforeDone = false;
      while (Date.now() < destDeadline) {
        const face = await phone.page.innerText("body").catch(() => "");
        if (/Travis isn’t wired/i.test(face)) {
          failUse("voice-live", "unwired line appeared", await readTurns(phone.desk));
        }
        if (/Travis Live is down/i.test(face) || /Failed to fetch/i.test(face)) {
          await dumpFaceMiss(phone.page, await whichDoor(phone.page));
          failUse(
            "voice-live",
            "Live dropped before dest leave",
            await readTurns(phone.desk),
          );
        }
        const queue = await readQueue(phone.desk);
        const turns = await readTurns(phone.desk);
        if (destLeaveStarted(queue) || destLeaveOnTape(turns)) {
          leaveBeforeDone = true;
          break;
        }
        if (turns.some((row) => /i'?m done/i.test(row.text))) {
          break;
        }
        await phone.page.waitForTimeout(800);
      }
      if (!leaveBeforeDone) {
        await dumpFaceMiss(phone.page, await whichDoor(phone.page));
        const tx = await phone.page.evaluate(
          () =>
            (window as unknown as { __realtimeTx?: string[] }).__realtimeTx ?? [],
        );
        console.error(`runtime: voice-live dest miss tx=${JSON.stringify(tx)}`);
        failUse(
          "voice-live leave-before-wrap",
          "Engineer leave was not running/queued before I'm done",
          await readTurns(phone.desk),
        );
      }

      const wrapDeadline = Date.now() + 90_000;
      let turns = await readTurns(phone.desk);
      while (Date.now() < wrapDeadline) {
        const body = await phone.page.innerText("body");
        if (/Travis isn’t wired/i.test(body)) {
          failUse("voice-live", "unwired line appeared", turns);
        }
        const starts = await phone.page.evaluate(
          () => (window as unknown as { __travisSttStarts?: number }).__travisSttStarts ?? 0,
        );
        if (starts > 0) {
          failUse("voice-live", "both ears started — SpeechRecognition ran during Live", turns);
        }
        if (turns.some((row) => row.kind === "agent_post" && row.seatKey === "travis" && row.speakable)) {
          try {
            assertThinkWorked(turns, "voice-live");
            break;
          } catch {
            /* keep waiting */
          }
        }
        await phone.page.waitForTimeout(1500);
        turns = await readTurns(phone.desk);
      }
      assertThinkWorked(turns, "voice-live");
      if (turns.some((row) => row.kind === "status" && /error/i.test(row.text))) {
        failUse("voice-live", "run error on tape", turns);
      }
      const usage = await phone.page.evaluate(
        () => (window as unknown as { __realtimeUsage?: unknown }).__realtimeUsage ?? null,
      );
      console.log("realtime usage:", JSON.stringify(usage));
      assert.ok(usage, "response.done usage must be captured for the paid canary");
    } finally {
      if (phone) await closePhone(phone);
    }
  });
});
