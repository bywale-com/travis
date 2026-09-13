/**
 * In-process phone-face walks for preflight. Not a node:test file —
 * the runner calls these so Chromium and the fixture share one process.
 */

import assert from "node:assert/strict";
import { chromium, type Browser, type Page } from "playwright";
import { OPERATOR_COOKIE } from "@/lib/operator-auth";
import { STAY_KEY } from "@/lib/stay";
import { assertThinkWorked } from "./app-worked";
import { openFreshRoom, readTurns, type Desk } from "./desk";

const TYPE_LINE = "One-line note on the tape.";
const CHARACTER_KEY = "travis-character";

const STT_DOUBLE = `
(() => {
  window.__travisSttStarts = 0;
  const instances = [];
  class FakeSpeechRecognition {
    constructor() {
      this.onresult = null;
      instances.push(this);
    }
    start() { window.__travisSttStarts += 1; }
    abort() {}
    stop() {}
  }
  window.SpeechRecognition = FakeSpeechRecognition;
  window.webkitSpeechRecognition = FakeSpeechRecognition;
  window.__travisEmitStt = function (finals, interim) {
    const rec = instances[instances.length - 1];
    if (!rec || !rec.onresult) return;
    const results = [];
    for (let i = 0; i < finals.length; i++) {
      results.push({ 0: { transcript: finals[i] }, isFinal: true, length: 1 });
    }
    if (interim) results.push({ 0: { transcript: interim }, isFinal: false, length: 1 });
    rec.onresult({ results: results });
  };
})();
`;

type Phone = { browser: Browser; page: Page; desk: Desk };

async function launchFace(opts?: {
  character?: boolean;
  initScript?: string;
}): Promise<Phone> {
  const desk = await openFreshRoom();
  const browser = await chromium.launch({
    headless: true,
    timeout: 15_000,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const base = process.env.RUNTIME_BASE_URL?.replace(/\/$/, "") ?? "";
    const origin = new URL(base);
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const cookie = process.env.TRAVIS_TEST_OPERATOR_COOKIE?.trim() ?? "";
    if (cookie) {
      await context.addCookies([
        { name: OPERATOR_COOKIE, value: cookie, domain: origin.hostname, path: "/" },
      ]);
    }
    await context.addInitScript(
      ({ stayKey, characterKey, sessionId, seedCharacter }) => {
        localStorage.setItem(stayKey, JSON.stringify({ sessionId, plate: "room" }));
        if (seedCharacter) localStorage.setItem(characterKey, "mission");
      },
      {
        stayKey: STAY_KEY,
        characterKey: CHARACTER_KEY,
        sessionId: desk.sessionId,
        seedCharacter: opts?.character !== false,
      },
    );
    if (opts?.initScript) await context.addInitScript(opts.initScript);
    const page = await context.newPage();
    await page.goto(base, { waitUntil: "domcontentloaded", timeout: 10_000 });
    return { browser, page, desk };
  } catch (err) {
    await browser.close().catch(() => {});
    throw err;
  }
}

function watchPosts(page: Page): { sends: string[]; finalizes: string[] } {
  const sends: string[] = [];
  const finalizes: string[] = [];
  page.on("request", (req) => {
    if (req.method() !== "POST") return;
    const u = req.url();
    if (u.includes("/send")) sends.push(u);
    if (u.includes("/finalize")) finalizes.push(u);
  });
  return { sends, finalizes };
}

async function walk(name: string, fn: (phone: Phone) => Promise<void>, opts?: {
  character?: boolean;
  initScript?: string;
}): Promise<void> {
  console.log(`preflight: ${name}`);
  const phone = await launchFace(opts);
  try {
    await fn(phone);
  } finally {
    await phone.browser.close();
  }
}

export async function runPreflightFaceWalks(): Promise<void> {
  await walk("Continue on the Mode door reaches View log", async (phone) => {
    await phone.page.getByText("Pick a character", { exact: false }).waitFor();
    assert.equal(await phone.page.getByText("View log", { exact: true }).count(), 0);
    await phone.page.getByRole("button", { name: "Continue" }).click();
    await phone.page.getByText("View log", { exact: true }).waitFor({ timeout: 10_000 });
  }, { character: false });

  await walk("Voice Listening is not enough — Talk needs the Talk/Pause door", async (phone) => {
    await phone.page.getByText("Listening...", { exact: false }).waitFor();
    assert.equal(await phone.page.getByRole("button", { name: "Talk" }).count(), 0);
    await phone.page.getByText("View log", { exact: true }).click();
    await phone.page.getByRole("button", { name: "Talk", pressed: true }).waitFor();
    await phone.page.getByRole("button", { name: "Pause" }).waitFor();
    await phone.page.waitForFunction(
      () => ((window as unknown as { __travisSttStarts?: number }).__travisSttStarts ?? 0) >= 1,
      { timeout: 10_000 },
    );
  }, { initScript: STT_DOUBLE });

  await walk("Type stays local until Send", async (phone) => {
    const posts = watchPosts(phone.page);
    await phone.page.getByText("View log", { exact: true }).click();
    await phone.page.getByRole("button", { name: "Type" }).click();
    await phone.page.getByPlaceholder("Message the room").fill(TYPE_LINE);
    await phone.page.waitForTimeout(300);
    assert.equal(posts.sends.length, 0, "typed text must not POST /send before Send");
    const before = await readTurns(phone.desk);
    assert.equal(before.some((row) => row.text.includes(TYPE_LINE)), false);
    await phone.page.getByRole("button", { name: "Send" }).click();
    await phone.page.getByText(TYPE_LINE, { exact: false }).first().waitFor({ timeout: 10_000 });
    assert.ok(posts.sends.length >= 1, "Send must POST /send");
    assertThinkWorked(await readTurns(phone.desk), "preflight-type");
  });

  await walk("Talk interim stays local until I'm done", async (phone) => {
    const posts = watchPosts(phone.page);
    await phone.page.getByText("View log", { exact: true }).click();
    await phone.page.getByRole("button", { name: "Talk", pressed: true }).waitFor();
    await phone.page.waitForFunction(
      () => ((window as unknown as { __travisSttStarts?: number }).__travisSttStarts ?? 0) >= 1,
    );
    await phone.page.evaluate(() => {
      (window as unknown as { __travisEmitStt: (f: string[], i: string) => void }).__travisEmitStt(
        [],
        "hello there",
      );
    });
    await phone.page.getByText("hello there", { exact: false }).first().waitFor({ timeout: 10_000 });
    assert.equal(posts.finalizes.length, 0, "interim must not POST /finalize");
    await phone.page.evaluate(() => {
      (window as unknown as { __travisEmitStt: (f: string[], i: string) => void }).__travisEmitStt(
        ["hello there I'm done"],
        "",
      );
    });
    await phone.page.waitForTimeout(400);
    assert.ok(posts.finalizes.length >= 1, "I'm done must POST /finalize");
    assertThinkWorked(await readTurns(phone.desk), "preflight-talk");
  }, { initScript: STT_DOUBLE });

  await walk("Voice does not start SpeechRecognition", async (phone) => {
    await phone.page.getByText("Talking with Travis", { exact: false }).waitFor();
    await phone.page.waitForTimeout(800);
    const starts = await phone.page.evaluate(
      () => (window as unknown as { __travisSttStarts?: number }).__travisSttStarts ?? 0,
    );
    assert.equal(starts, 0, "SpeechRecognition must not start on Voice");
  }, { initScript: STT_DOUBLE });
}
