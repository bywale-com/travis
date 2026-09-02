# Hotfix 034 — Male voice when the engine has one

**Number:** `034` — next engineer hotfix is `035`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived: founder asked for a male voice if available; this reply in chat).  
**When:** 2026-09-02  
**PR title shape:** `Hotfix 034 — Male voice if available`

---

## Why

Dest Travis Live was pinned to `marin` (female). Seat readback used the browser default, often female. Founder asked for male if the engine offers one.

## Cut

1. Dest Travis Realtime voice is `cedar` (OpenAI’s recommended pair to marin; reads male).
2. Facilitator `speechSynthesis` picks a named male English voice when the browser lists one. No name → leave default.

## Must-not

- Do not mint a voice store.
- Do not ship a voice picker UI.
- Do not append PM/SA logs.

## Verify

`npm test`. After merge: dest Travis Voice should sound like cedar. Engineer/PM readback should use a male system voice when the phone lists one.
