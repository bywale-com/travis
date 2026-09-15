# Hotfix 099 — Cancelled doors are red; browser launch cannot leak

**Number:** `099` — next engineer hotfix is `100`. Never reuse.  
**Seat:** Engineer.  
**When:** 2026-09-13  
**PR title shape:** `Hotfix 099 — cancelled doors are red`  
**Test:** [`HOTFIX-099-CANCELLED-DOORS-ARE-RED-TEST.md`](./HOTFIX-099-CANCELLED-DOORS-ARE-RED-TEST.md)  
**Builds on:** [`HOTFIX-098-BROWSER-REAL-RUNTIME.md`](./HOTFIX-098-BROWSER-REAL-RUNTIME.md)  
**Same PR:** [#190](https://github.com/bywale-com/travis/pull/190) — this is the next cut on that timeline, not a cousin.

---

## Why

Playwright finally ran on [runtime-doors #34762697149](https://github.com/bywale-com/travis/actions/runs/34762697149). Chromium installed. Fake-mic proof passed. Every HTTP walk passed. Then browser Talk died, the job sat until the 30-minute cap, GitHub **cancelled** it, and the house went silent.

Founder wording (preserved): a cancelled run is similar to a blocker run, because it triggers the founder to look into it. This sitting already looked. The loop must not require that look next time.

Lived tape:

1. `src/runtime/browser/talk-mode.spec.ts` → `launchPhone` → `TimeoutError` at `harness.ts` waiting for `getByRole("button", { name: "View log" })` (45s).
2. No further TAP after 14:32:39. Job cancelled at 14:57:20 (`timeout-minutes: 30`).
3. Post-paint set Vercel `runtime-doors` to **success**.
4. `fail-look` skipped (`if: failure()` — cancelled is not failure).
5. Emerge skipped (`if: success()` — cancelled is not success).
6. `previewing` cleared. Engineer did not wake.

The green check is a false paint. 098 is not proven.

---

## Diagnosis (stood-up code)

### 1. Cancelled is neither red nor emerge

`.github/workflows/runtime-doors.yml` (this branch and the `main` launcher):

- Job `timeout-minutes: 30`.
- Walks: `if` implicit; cancel kills the step.
- Paint: `if: always()` + `vercel/repository-dispatch/actions/status@v1`. On this run the post-step wrote `state: success`.
- Fail-look: `if: failure()` only.
- Emerge: `if: success()` only.
- Clear `previewing`: `if: always()`.

A timeout therefore: fake green, no Engineer, no emerge, mutex gone.

### 2. `launchPhone` leaks Chromium, so a miss becomes a cancel

Planted `src/runtime/browser/harness.ts`: `chromium.launch` → `page.goto` → wait for View log. If that wait throws, **the browser is not closed**.

Planted `talk-mode.spec.ts`: `const phone = await launchPhone(...)`. If `launchPhone` throws, `phone` is never bound, `finally { closePhone(phone) }` does not run.

Leaked Chromium keeps the Node test process alive. `src/runtime/run.ts` `spawnSync` waits. The job hits the 30-minute cap and is **cancelled** instead of **failed**. That is why Playwright “working” produced a silent green instead of `fail-look`.

### 3. Why View log was missing

`View log` is only painted on the Voice chrome after a session is on the room plate (`src/components/Room.tsx` ~2962–2983). Index (`!session || plate === "index"`, ~2545) has no that button. Login is a different door (`Send login link`).

`launchPhone` treats “no Send login link” as “we are in.” A Vercel protection wall, room index, stay-enter miss, or a boot that never reaches Voice all look the same: 45s, then timeout, **no URL/title/body dump**.

Talk injects `STT_DOUBLE` before boot. Type does not. If the double blocks paint, Talk dies and Type might still run — or the leaked browser hangs first.

The locator is `getByRole("button", { name: "View log" })`. The face control is antd `Button type="link"` whose accessible role may not be `button`.

---

## Product lock

1. Cancelled or timed-out doors are **red**. They are not emerge. They wake Engineer (`fail-look`) when the PR is idle.
2. A browser launch miss fails the walk in seconds, not at the job cap.
3. The phone face used for Talk/Type/Voice is the real Voice/Log chrome. If it is not there, the log names the wall (URL, title, visible text).
4. 098 still stands: exclusive Live ear; Type/Talk/Voice browser proof; Voice canary. This cut makes that suite able to fail honestly.

---

## Technical cut

### Browser launch (preview-provable — this branch’s `npm run test:runtime`)

- **`src/runtime/browser/harness.ts`**
  - After `chromium.launch`, any throw closes the browser.
  - Face-ready means the room is entered and Voice chrome is up — not merely `domcontentloaded`.
  - Find the log door the way the face paints it (`View log` text), not only `role=button`.
  - On miss: print URL, title, a short visible-text dump, and which door is present (login / index / View log / none). Then throw.
- **`src/runtime/browser/*.spec.ts`** — `closePhone` in `finally` only after a successful launch; launch owns its own cleanup.
- **`src/runtime/run.ts`** — first browser failure exits 1 immediately. Do not leave `node:test` running until the job cap. `--test-fail-fast` or equivalent.

### House launcher (YAML on this PR; **cannot preview-prove** — `main` still loads the workflow)

- **`.github/workflows/runtime-doors.yml`**
  - `fail-look` on `failure()` **or** `cancelled()`.
  - Emerge stays `success()` only.
  - Paint `runtime-doors` **failure** when walks failed or the job was cancelled. Paint **success** only when the walks step succeeded.
  - Keep `timeout-minutes` high enough for Chromium + HTTP walks + deterministic browser + one Voice canary (60 is enough). The leak fix is what stops the hang; the cap is not the sensor.
- Engineer writes the static YAML contract in unit tests (`circuit-breaker` / launcher). Do not cite a branch-only YAML change as preview proof.

---

## Must-not

- Do not treat cancelled as green.
- Do not emerge on cancel or timeout.
- Do not leave Chromium open after a launch miss.
- Do not wait out `timeout-minutes` to “finish” a failed browser suite.
- Do not skip the Voice canary to buy time.
- Do not mint a table.
- Do not open a cousin PR.
- Do not claim this YAML change ran on this preview. Proof of the leak/fail-fast is the checkout’s `npm run test:runtime`. Proof of cancelled→red is the unit contract plus the next run after `main` has the YAML.

## Engineer proof

On the next preview of this same PR:

1. Action log shows Playwright started (already true on #34762697149).
2. If Talk/Type still cannot see the face, the walk is **red** within the first browser miss, the dump is in the log, and `fail-look` is added. It is not cancelled + green.
3. If the face is found, 098’s Type / Talk / Voice-own / Voice canary continue and are the only path to green.
4. Name the run URL and the paint (`failure` or honest `success`) on `ENGINEER-HANDOFF.md`.
