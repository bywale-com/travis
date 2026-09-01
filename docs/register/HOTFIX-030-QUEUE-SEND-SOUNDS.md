# Hotfix 030 — Queue drain, hold live posts, send/queue sounds

**Number:** `030` — next engineer hotfix is `031`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived: a follow-up queued while Engineer was on 029 never sent; live posts that sit with the thought bubble vanished; the log still looked like the same ticket. Founder also asked for a swoosh on send and a different cue when a turn is queued).  
**When:** 2026-09-01  
**PR title shape:** `Hotfix 030 — drain stuck queue, hold live posts, send sounds`

029 (dest Travis on OpenAI) is a separate in-flight PR. This cut does not depend on it.

---

## Why

The queue only drained at the end of the Cursor SSE that owned the live-run row. If that stream died, `seat_live_run` could sit while Cursor was already idle, and the 4s queue poll never sent the waiting line.

Assistant text lived in client `streamingPosts` until the run finished. A refresh, remount, or `refreshTurns` that blanked `liveThoughts` left the thought strip and an old first line, and dropped everything said after.

There was no ear-feedback that a turn had actually left the phone versus parked on the queue.

## Cut

1. Persist a growing `agent_post` during `post_delta` (same row for that user turn + seat). A dropped SSE still leaves the log with what had already been said. Room polls turns with the queue so a remount paints them.
2. `refreshTurns` merges streaming thoughts instead of wiping `liveThoughts` to `{}`.
3. Queue GET nudges a leftover live-run row when Cursor is idle, and names drainable seats. The phone POSTs `/queue/drain` as SSE and consumes it. Drain does not run while Cursor still has an active run, and does not drain when listRuns fails (unknown ≠ idle). Claim-delete + a per-binding drain lock so two pollers cannot double-send the same line.
4. Swoosh when a turn actually sends (Talk, Type, Voice I’m-done, dest Travis Live user flush). Two-note cue when it is queued. Same across modes. Generated WAV on `HTMLAudioElement`, armed on tap — Web Audio scheduled on the later SSE is silent on a phone.

## Must-not

- Do not drain a seat whose Cursor run is still active.
- Do not mint a sound table or a `run_id` column.
- Do not re-add a busy guard that swallows a turn while a seat works (025).
- Do not append PM/SA logs.

## Verify

1. Dest Engineer working: send a follow-up (Talk I’m done, Type Send, or Voice I’m done). Hear the cue. The line sits on the queue rail, not as a vanished bubble.
2. When that Engineer run actually finishes (not merely “the SSE dropped”), the waiting line sends without another tap. Hear the swoosh. Live posts from the first run are still in the log after a refresh mid-stream.
3. Dest Travis Talk/Type/Voice send → swoosh, never queued.
4. `npm test` covers drainable-seat grain and the sound helpers no-op without `AudioContext`.
