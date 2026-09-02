# Hotfix 020 — Ear comes back; I’m done on Talk dest Travis

**Number:** `020` — next engineer hotfix is `021`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived: I’m done never sends; Voice↔Talk while speaking freezes the draft forever until refresh).  
**When:** 2026-08-30  
**PR title shape:** `Hotfix 020 — STT ear + I’m done`

---

## Why

1. **I’m done** is the Talk/Voice conductor for **seats** (seeded phrases). Dest Travis in **Voice** is Live — no done-phrase; he is the conversation. Dest Travis in **Talk** was returning before the conductor, so I’m done never finalized.
2. Mode switch (and Clear / pause) called `abort()` then `start()` on the same tick. Chrome throws; `onend` was already nulled; the ear stayed dead until refresh. That is why I’m done failed on Engineer too.

## Cut

1. Talk dest Travis: I’m done finalizes (`pipeTravisText`). Voice dest Travis: still Live, no conductor.
2. After halt, wait ~140ms and retry `start()` up to 6 times. Watchdog re-arms if listen is wanted and the rec is dead.
3. After a Voice read finishes, start the ear again.
4. STT `I am done` = `I'm done`.

## Must-not

- Do not mint tables.
- Do not make Voice dest Travis a phrase conductor.
- Do not append PM/SA logs.

## Verify

1. Dest Engineer, Talk: speak a line + **I’m done** → send.
2. Dest Travis, Talk: speak a line + **I’m done** → Travis post.
3. Dest Travis, Voice: talk; no I’m done required; Live answers.
4. Talk while speaking → View voice → keep talking → draft grows. Clear / pause / Talk again → ear works without refresh.
