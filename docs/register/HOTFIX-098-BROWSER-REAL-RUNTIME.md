# Hotfix 098 — Browser-real runtime verification and one microphone owner

**Number:** `098` — next engineer hotfix is `099`. Never reuse.  
**Seat:** Engineer.  
**When:** 2026-09-13  
**PR title shape:** `Hotfix 098 — browser-real runtime verification`  
**Test:** [`HOTFIX-098-BROWSER-REAL-RUNTIME-TEST.md`](./HOTFIX-098-BROWSER-REAL-RUNTIME-TEST.md)  
**Builds on:** [`HOTFIX-086-RUNTIME-IS-THE-APP.md`](./HOTFIX-086-RUNTIME-IS-THE-APP.md) and [`HOTFIX-091-STREAM-ARCH-WALK.md`](./HOTFIX-091-STREAM-ARCH-WALK.md)

---

## Why

The current runtime walks call session HTTP doors with prepared text. They prove the server pipe, but they do not open the phone face, select a mode, acquire a microphone, establish Travis Live, or prove which ear owns speech. They therefore cannot detect the lived failure where Voice looks active while Talk/Web Speech populates a draft and barges into the Travis Live conversation.

The planted race is visible in `src/components/Room.tsx`: Voice + Travis starts `connectLive`, but `liveRef` remains empty while WebRTC connects. The recognition watchdog and `startRecognition` guard only exclude an established `liveRef`, not `liveConnectingRef`. A Live close also silently starts Web Speech while the face remains Voice.

Runtime verification must represent the human use through the rendered application. Type/Talk and Voice are different input environments:

- **Type/Talk:** composed input reaches the server only after Send / the conductor gate.
- **Voice:** microphone audio reaches Travis Live incrementally; a destination leave can start before “I’m done.”

---

## Product lock

1. Voice + Travis has exactly one microphone owner: Live while connecting or connected. Talk/Web Speech must not arm, show a draft, or silently replace Live.
2. If Live drops, Voice shows a clear reconnecting/down state. It does not quietly become Talk.
3. Type never dispatches text before Send.
4. Talk never dispatches transcript before its completion gate.
5. Voice stream architecture is proved through microphone audio on the rendered phone face: the Engineer leave starts before the fixture says “I’m done.”
6. Endpoint walks remain server-pipe contract checks. They are not sufficient evidence that Voice works.

---

## Technical cut

### Application ownership

- **`src/lib/ear.ts`** — model exclusive ear states (`none`, `stt`, `live-connecting`, `live`) and transitions. Connecting counts as Live ownership.
- **`src/components/Room.tsx`** — use that state for the watchdog, `startRecognition`, `armEar`, Live close, mode switches, subtitles, and drafts. No branch may run Web Speech while Voice + Travis is connecting or connected. Live close paints a truthful state and reconnects or waits for explicit user action.
- **`src/lib/ear.test.ts`** — executable transition coverage, including watchdog ticks and Live close. Engineer writes this code; the Architect writes only this test specification.

### Browser runtime

- Add the latest **Playwright** as a development dependency and a dedicated runtime browser configuration.
- **`src/runtime/browser/type-mode.spec.ts`** — open the deployed UI at phone dimensions, enter the real composer, type, prove no request before Send, press Send, then observe the rendered turn/reply.
- **`src/runtime/browser/talk-mode.spec.ts`** — install a deterministic `SpeechRecognition` browser double before app boot, drive the real Talk face, prove interim/final text does not send before the conductor gate, then observe `/finalize` and the rendered result.
- **`src/runtime/browser/voice-live.spec.ts`** — grant microphone permission and launch Chromium with a fake media device plus a checked-in WAV. Open the real Voice face. Use the real preview `/live/token`, WebRTC, OpenAI Realtime, transcript persistence, and rendered UI.
- **`src/runtime/fixtures/stream-arch-cue.wav`** — one intelligible fixture generated once by Engineer (for example `espeak-ng` + FFmpeg), containing:
  1. “Engineer, put this on the notes: stream-arch cue.”
  2. enough silence to inspect the leave;
  3. “I’m done.”
  Commit the WAV. CI does not synthesize it.
- Add a deterministic browser ownership test with mocked `RTCPeerConnection`, `getUserMedia`, and `SpeechRecognition`. It must fail if STT starts while Live is connecting/connected. This test has no model cost.
- The real Voice canary must fail if Live is unwired, if a Talk draft appears, if both ears start, if the destination leave waits for “I’m done,” or if no final Travis mouth/thread result appears.
- Do not wait for a Cursor agent essay and do not create an agent. Assert the leave/dispatch starts.

### CI/CD

- **`.github/workflows/runtime-doors.yml`**:
  - serialize all runtime jobs globally with `cancel-in-progress: false`; the suite shares one test operator and must not overlap;
  - install/cache Playwright Chromium;
  - run unit tests, server-pipe walks, deterministic browser mode tests, then one real Voice canary against the Vercel deployment URL;
  - pass the existing Vercel bypass and test-operator credentials into the browser context;
  - preserve red → `fail-look` and green → latest-sheet emerge behavior.
- **`package.json`** — separate scripts for server-pipe and browser runtime; the aggregate runtime command runs both.
- **`src/runtime/README.md` and `src/runtime/walks/README.md`** — state exactly what each layer proves. Remove claims that endpoint injection proves microphone/Voice behavior.
- Capture Realtime `response.done` usage in test output so the paid canary cost is observable.

---

## Existing prerequisites

- `OPENAI_API_KEY` is already configured server-side for Vercel Preview.
- `TRAVIS_TEST_OPERATOR_COOKIE` and `VERCEL_AUTOMATION_BYPASS_SECRET` already exist in GitHub Actions.
- No founder secret, recording, browser operator, or Cursor agent is required.

---

## Must-not

- Do not ship an OpenAI key to GitHub Actions or the client.
- Do not call a direct transcript/finalize endpoint and label that a Voice browser test.
- Do not silently fall back from Voice Live to Talk/STT.
- Do not run browser jobs concurrently against the shared test operator.
- Do not add a database table.
- Do not use an AI agent to operate the browser.
- Do not weaken the real canary to mocks if headless media fails; validate headed Chromium under Xvfb instead.

## Engineer proof

Before plant, prove fake-audio capture reaches the current WebRTC session in Chromium. After plant, name the Vercel preview URL and green `runtime-doors` check in `ENGINEER-HANDOFF.md`. A green unit suite alone is not completion.
