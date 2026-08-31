# Hotfix 022 — Mic survives Voice / Talk / Type; Voice has an ear after refresh

**Number:** `022` — next engineer hotfix is `023`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived, 4th time: switching Talk/Type/Voice disables capture until refresh; after refresh only Talk hears, Voice is mute).  
**When:** 2026-08-31  
**PR title shape:** `Hotfix 022 — mic across Voice Talk Type`

---

## Why

021 held the draft and re-armed Talk. It did not give Voice an ear.

1. **Voice dest Travis killed Web Speech** and waited on Gemini Live. After refresh there is no user gesture, `AudioContext` stays suspended / `getUserMedia` fails, Live never comes up, and STT was forbidden — so Voice was mute. Talk still used Web Speech, so Talk worked.
2. **Live `getUserMedia` held the mic** after a Voice visit. Talk/Type then started STT against a track that had not been released.
3. **Resume treated leftover Type as “no listen” even in Voice**, so a Type session that later opened Voice never started the ear.

## Cut

1. Voice always has an ear: Live only while it is actually up; otherwise Web Speech (same as Talk), including dest Travis.
2. Mode switch fully stops Live tracks, waits, then arms the ear for the new mode. Type composer auto-starts its mic.
3. Leftover Type submode does not mute Voice on refresh.
4. Live: resume audio contexts, do not play the mic into the speaker, release tracks on stop, fall back to STT on failure.

## Must-not

- Do not mint tables.
- Do not make dest-Travis Voice a phrase conductor when Live is actually connected.
- Do not append PM/SA logs.

## Verify

1. Refresh on Voice (dest Travis or Engineer): speak — draft / Live hears you. No refresh needed after that.
2. Talk → Type → Voice → Talk: mic comes back each time without refresh.
3. Dest Travis Voice: Live if it connects; if it doesn’t, I’m done still sends like Talk.
4. Dest Engineer Voice: I’m done still sends.
