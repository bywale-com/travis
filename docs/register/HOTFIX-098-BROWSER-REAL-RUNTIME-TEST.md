# Hotfix 098 — Test sheet

**Hotfix:** [`HOTFIX-098-BROWSER-REAL-RUNTIME.md`](./HOTFIX-098-BROWSER-REAL-RUNTIME.md)  
**When:** 2026-09-13  
**PR title shape:** `Hotfix 098 — browser-real runtime verification`

## Automated deployment gate

1. Unit tests pass, including exclusive ear transitions: Live connecting/connected excludes Web Speech; Live close never silently becomes Talk.
2. Server-pipe walks pass and are identified as server contract coverage, not microphone coverage.
3. Playwright opens the actual Vercel deployment at phone dimensions using the isolated test operator.
4. **Type:** enter `One-line note on the tape.` in the visible composer. Before Send, no user turn/request exists. After Send, the rendered thread receives the turn and Travis result.
5. **Talk:** deterministic SpeechRecognition emits interim and final text. Nothing sends before the completion gate. The gate sends through `/finalize`; the rendered thread receives the result.
6. **Voice ownership:** while Travis Live is connecting and connected, injected SpeechRecognition records zero starts and no Talk draft appears.
7. **Voice real canary:** Chromium’s fake microphone plays `stream-arch-cue.wav` through real `getUserMedia` → WebRTC → OpenAI Realtime. `/live/token` is wired.
8. During the fixture silence after `Engineer, put this on the notes: stream-arch cue.`, the Engineer leave is already running/queued/drainable—before the fixture says `I’m done`.
9. After `I’m done`, Travis produces a speakable/rendered wrap. No HTML, unwired line, run error, dual-ear state, or silent fallback.
10. Runtime jobs are serialized; two deployments cannot consume the shared operator concurrently.
11. Test output prints Realtime usage for the paid Voice canary.

## Human phone smoke

1. Open the deployed URL on Android Chrome and enter Voice with Travis active.
2. Confirm the face says `Talking with Travis…`; speak naturally. No Talk-style draft/subtitles populate while Live owns the microphone.
3. Say: `Engineer, put this on the notes: stream-arch cue.` Pause, then say: `I’m done.`
4. Confirm the Engineer leave starts before the wrap and Travis remains the Voice mouth.
5. Switch to Talk. Confirm recognized text composes visibly and only sends at the completion gate.
6. Switch to Type. Confirm text remains local until Send.
7. I saw: ________
