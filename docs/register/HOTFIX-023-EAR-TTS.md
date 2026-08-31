# Hotfix 023 — Dest Engineer Talk/Voice keep one ear; STT waits out TTS

**Number:** `023` — next engineer hotfix is `024`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived dest Engineer: Voice talking dead; Type fine; back to Talk deaf; TTS/readback also kills capture).  
**When:** 2026-08-31  
**PR title shape:** `Hotfix 023 — dest Engineer ear + TTS`

---

## Why

022 still **aborted** Web Speech on every Talk ↔ Voice switch. Dest Engineer uses the **same** Chrome recognizer for both. Abort then `start()` throws invalid-state; the mic stays dead until refresh. Type has its own recognizer, so it looked fine.

TTS (`speechSynthesis`) also ends that ear. Room `onend` saw “speaking” and **quit**, so Voice readback and Play reply left Talk/Voice deaf.

## Cut

1. `modeSwitchEarAction`: Talk ↔ Voice dest Engineer → **keep** the live recognizer. Do not abort.
2. `sttOnEndAction`: while TTS is busy → **wait**; when idle → **restart**. Play reply and Voice readback wait for synthesis idle, then arm listen.
3. Chrome-invalid-state simulator in `ear.test.ts` covers the lived dest-Engineer switch and the TTS-kill path.

## Must-not

- Do not mint tables.
- Do not make dest-Travis Voice a phrase conductor when Live is actually connected.
- Do not append PM/SA logs.

## Verify (phone, dest Engineer)

1. Talk → Voice → Talk, no refresh — draft still grows; I’m done still sends.
2. I’m done, hear the reply (or Play reply) — Talk still hears you after the read.
3. Type stays independent.
