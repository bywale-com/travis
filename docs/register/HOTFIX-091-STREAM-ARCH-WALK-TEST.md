# Hotfix 091 — Test sheet

**Hotfix:** [`HOTFIX-091-STREAM-ARCH-WALK.md`](./HOTFIX-091-STREAM-ARCH-WALK.md)  
**When:** 2026-09-12  
**PR title shape:** `Hotfix 091 — Stream architecture runtime walk`

## Smoke

1. `npm test` — lib still green. `handoff-seat.test.ts` unchanged. Transcript door still never `pipeTravisText`.
2. `runtime-doors` on this deploy URL, sequential, including `voice-stream-arch`:
   - `POST /live/transcript` — `Engineer, put this on the notes: stream-arch cue.`
   - `GET /queue` **before** finalize — leave started (`running` / queued / drainable).
   - `POST /finalize` — `I'm done`. Travis has a speakable post.
   - Red: queue empty after transcript. Wrap with no mouth. HTML / unwired / run error.
   - Do not wait for the Engineer essay.
3. Existing walks still run: type-send, type-walk-back, type-dest, voice-wrap, come-back.
4. I saw: ________
