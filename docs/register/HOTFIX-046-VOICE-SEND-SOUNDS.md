# Hotfix 046 — No send/queue shots in Voice

**Number:** `046` — next engineer hotfix is `047`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (founder: suppress sent/queued notification sounds in Voice; keep them in Talk/Type).  
**When:** 2026-09-03  
**PR title shape:** `Hotfix 046 — quiet Voice send sounds`

---

## Why

Voice is already an ear — TTS and Live. The send swoosh and queue cue land on top of that. Talk and Type have no mouth of their own, so those shots stay.

PM did not lock a toggle. Default: Voice off, Talk/Type on. A setting is a later PM pocket.

## Cut

`shouldPlaySendSound` / `sendSoundSurfaceFromView` in `src/lib/send-sounds.ts`. Room passes the current surface into `playSendSwoosh` / `playQueuedCue`. Dest Travis Live user-flush is Voice and stays silent.

## Must-not

- Do not mint a sound table or a settings store.
- Do not append PM/SA logs.

## Risks / rollout

- Client-only. No migration. Lands with the next production deploy.
- A Talk send whose SSE `matched`/`queued` arrives after the founder has already flipped to Voice will stay quiet. The reverse (Voice send, then Talk) can play a late shot. Surface is read at event time, not send time.
- The silent unlock bed still arms on tap so Talk/Type after Voice can play. That is not a send notification.

## Verify

`npm test` covers Voice suppress / Talk+Type allow. After deploy: Voice I’m-done and Live send are silent; Type send still swooshes; a queued Type line still cues.
