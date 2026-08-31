# Hotfix 022 — Mic survives Voice / Talk / Type; Voice has an ear after refresh

**Number:** `022` — next engineer hotfix is `023`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived, 4th time: switching Talk/Type/Voice disables capture until refresh; after refresh only Talk hears, Voice is mute).  
**When:** 2026-08-31  
**PR title shape:** `Hotfix 022 — mic across Voice Talk Type`

---

## Why

021 held the draft and re-armed Talk. It did not give Voice an ear.

1. **Voice dest Travis killed Web Speech** and waited on Gemini Live. After refresh there is no user gesture, Live never comes up, STT was forbidden — Voice mute, Talk still worked.
2. **Talk ↔ Voice dest Engineer share one Web Speech ear.** Every switch aborted it. Chrome will not give the mic back until refresh. Type is a different recognizer, so it looked fine.
3. **TTS (`speechSynthesis`) ends the recognizer.** Room `onend` saw “speaking” and **gave up**. Play reply and Voice readback left Talk/Voice deaf. Type retries on `onend`, so it survived.

## Cut

1. Voice always has an ear: Live only while it is actually up; otherwise Web Speech.
2. Talk ↔ Voice dest Engineer: **do not abort** the recognizer if it is already live. Unpause on mode switch.
3. After TTS (Voice readback or Play reply), wait until synthesis is idle, then restart listen. `onend` retries while the mouth is busy instead of quitting.
4. Type composer auto-starts its own mic. Leftover Type does not mute Voice on refresh.

## Must-not

- Do not mint tables.
- Do not make dest-Travis Voice a phrase conductor when Live is actually connected.
- Do not append PM/SA logs.

## Verify

1. Dest Engineer, Talk: speak, **I’m done**, hear the reply (or Play reply) — Talk still hears you after the read.
2. Talk → Voice → Talk without refresh: draft still grows; I’m done still sends.
3. Type stays independent. Voice dest Travis: Live if it connects; otherwise STT.
