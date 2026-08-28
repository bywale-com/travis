# Hotfix 012 — Talk pause + clear accumulated draft

**Number:** `012` — next engineer hotfix is `013`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived Talk smoke: once STT is accumulating there is no pause/mute and no way to dump the line without sending or ending the session; same missing clear in voice).  
**When:** 2026-08-28  
**PR title shape:** `Hotfix 012 — Talk pause and clear draft`

---

## Why (smoke)

Founder:

1. **Talk:** start speaking, no way to **pause / mute** the mic (voice has tap-on-orb). End session was the only stop.
2. **Talk:** no way to **clear** what is on screen without sending.
3. **Voice:** pause exists; the accumulated buffer still cannot be cleared without sending (`I'm done`) or ending the session.

Clearing the React `draft` string is not enough while Web Speech is live — `onresult` still holds the session finals and would paint the line back. Halt without persisting, wipe refs, start a fresh recognizer if still listening.

## Cut

1. Talk (log, not Type): Pause / Resume on a quiet listen strip. Same `presence` pause as the voice orb. Disabled while Travis is speaking.
2. Talk + voice: **Clear** when a draft exists. Does not send. Does not end the session. Pause still keeps the line (Hotfix 009 carry).
3. Voice: show the accumulated line (muted) so Clear has a target.

## Must-not

- Do not mint tables.
- Do not put this chrome on Type (field already deletes; mic already stops).
- Do not recut C3/C4 or the voice orb.
- Do not append PM/SA logs.

## Verify

1. Talk: Pause → mic stops, draft stays. Resume → line still there, listen continues.
2. Talk: speak a bit → Clear → draft gone, not sent. Keep talking → new line only.
3. Voice: same Clear on the accumulated line. Orb pause unchanged.
4. Type unchanged.
