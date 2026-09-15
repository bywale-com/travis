/**
 * Phone-sized Playwright context for the deployed face.
 * Passes the same bypass + test-operator cookie the HTTP walks use.
 */

import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { fileURLToPath } from "node:url";
import { OPERATOR_COOKIE } from "@/lib/operator-auth";
import { STAY_KEY } from "@/lib/stay";
import { doorFetch, openFreshRoom, runtimeBaseUrl, type Desk } from "../desk";

/** Same key as `src/theme/character.tsx` — returning operator already picked. */
export const CHARACTER_KEY = "travis-character";

export const PHONE = { width: 390, height: 844 };

export const TYPE_LINE = "One-line note on the tape.";
export const DEST_LINE =
  "Engineer, this is a Travis runtime canary. Acknowledge only. Do not edit files, commit, push, or update the handoff.";

export function streamArchWavPath(): string {
  return fileURLToPath(new URL("../fixtures/stream-arch-cue.wav", import.meta.url));
}

export async function addressTravis(desk: Desk): Promise<void> {
  const { res, bodyText, kind } = await doorFetch(
    `/api/session/${desk.sessionId}/address`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ seatKey: "travis" }),
    },
  );
  if (kind !== "json" || !res.ok) {
    throw new Error(`addressTravis ${res.status}: ${bodyText.slice(0, 140)}`);
  }
}

export type PhoneBrowser = {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  desk: Desk;
  base: string;
};

function bypassHeaders(): Record<string, string> {
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();
  if (!bypass) return {};
  return {
    "x-vercel-protection-bypass": bypass,
    "x-vercel-set-bypass-cookie": "samesitenone",
  };
}

export type FaceDoor = "login" | "mode" | "index" | "view-log" | "none";

export function classifyFaceText(text: string): FaceDoor {
  if (/Send login link/i.test(text)) return "login";
  if (/Pick a character/i.test(text)) return "mode";
  if (/\bView log\b/.test(text)) return "view-log";
  if (/\bRooms\b/.test(text) && /TRAVIS/.test(text)) return "index";
  return "none";
}

export async function whichDoor(page: Page): Promise<FaceDoor> {
  const text = await page.locator("body").innerText().catch(() => "");
  return classifyFaceText(text);
}

export async function dumpFaceMiss(page: Page, door: FaceDoor): Promise<void> {
  const url = page.url();
  const title = await page.title().catch(() => "");
  const text = (await page.locator("body").innerText().catch(() => "")).slice(0, 800);
  console.error(
    `runtime: face miss door=${door} url=${url} title=${title}\n${text}`,
  );
}

const FACE_READY_MS = 20_000;

export async function launchPhone(opts?: {
  fakeAudio?: boolean;
  headed?: boolean;
  initScript?: string;
}): Promise<PhoneBrowser> {
  const base = runtimeBaseUrl();
  if (!base) throw new Error("RUNTIME_BASE_URL is not set.");
  const desk = await openFreshRoom();
  await addressTravis(desk);

  const args = [
    "--use-fake-ui-for-media-stream",
    "--autoplay-policy=no-user-gesture-required",
  ];
  if (opts?.fakeAudio) {
    args.push("--use-fake-device-for-media-stream");
    args.push(`--use-file-for-fake-audio-capture=${streamArchWavPath()}`);
    args.push("--allow-file-access-from-files");
  }

  const browser = await chromium.launch({
    headless: opts?.headed ? false : true,
    args,
  });
  try {
    const origin = new URL(base);
    const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim() ?? "";
    const cookie = process.env.TRAVIS_TEST_OPERATOR_COOKIE?.trim() ?? "";
    const context = await browser.newContext({
      viewport: PHONE,
      extraHTTPHeaders: bypassHeaders(),
    });
    if (bypass) {
      await context.addCookies([
        {
          name: "x-vercel-protection-bypass",
          value: bypass,
          domain: origin.hostname,
          path: "/",
        },
      ]);
    }
    if (cookie) {
      await context.addCookies([
        {
          name: OPERATOR_COOKIE,
          value: cookie,
          domain: origin.hostname,
          path: "/",
        },
      ]);
    }
    await context.addInitScript(
      ({ stayKey, characterKey, sessionId }) => {
        localStorage.setItem(
          stayKey,
          JSON.stringify({ sessionId, plate: "room" }),
        );
        localStorage.setItem(characterKey, "mission");
      },
      {
        stayKey: STAY_KEY,
        characterKey: CHARACTER_KEY,
        sessionId: desk.sessionId,
      },
    );
    if (opts?.initScript) {
      await context.addInitScript(opts.initScript);
    }
    await context.grantPermissions(["microphone"], { origin: origin.origin });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: "domcontentloaded" });
    const deadline = Date.now() + FACE_READY_MS;
    let door: FaceDoor = "none";
    while (Date.now() < deadline) {
      door = await whichDoor(page);
      if (door === "view-log") {
        return { browser, context, page, desk, base };
      }
      if (door === "login") {
        await dumpFaceMiss(page, door);
        throw new Error("Login door — test operator cookie did not open the desk");
      }
      if (door === "mode") {
        const cont = page.getByRole("button", { name: "Continue" });
        if (await cont.count()) await cont.click();
      }
      await page.waitForTimeout(250);
    }
    await dumpFaceMiss(page, door);
    throw new Error(`Phone face miss — door=${door}`);
  } catch (err) {
    await browser.close().catch(() => {});
    throw err;
  }
}

export async function closePhone(phone: PhoneBrowser): Promise<void> {
  await phone.browser.close();
}

export async function openLogType(page: Page): Promise<void> {
  await page.getByText("View log", { exact: true }).click();
  await page.getByRole("button", { name: "Type" }).click();
  await page.getByPlaceholder("Message the room").waitFor();
}

export async function openLogTalk(page: Page): Promise<void> {
  await page.getByText("View log", { exact: true }).click();
  const talk = page.getByRole("button", { name: "Talk" });
  try {
    await talk.waitFor({ timeout: 20_000 });
  } catch (err) {
    await dumpFaceMiss(page, await whichDoor(page));
    throw err;
  }
  if ((await talk.getAttribute("aria-pressed")) !== "true") {
    await talk.click();
  }
  await page.getByRole("button", { name: "Talk", pressed: true }).waitFor();
  await page.getByRole("button", { name: "Pause" }).waitFor();
}

export function watchPosts(page: Page): { sends: string[]; finalizes: string[] } {
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

export async function waitForText(page: Page, text: string, timeoutMs = 120_000): Promise<void> {
  await page.getByText(text, { exact: false }).first().waitFor({ timeout: timeoutMs });
}
