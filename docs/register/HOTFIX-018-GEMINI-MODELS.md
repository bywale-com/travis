# Hotfix 018 — Gemini model pins

**Number:** `018` — next engineer hotfix is `019`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived: dest Travis **Hey** after the key landed).  
**When:** 2026-08-30  
**PR title shape:** `Hotfix 018 — Gemini 3.6 text + 3.1 Live pins`

---

## Why

Session `e9b2c402-…` seq 9: key was wired; Type dest-Travis called `gemini-2.5-flash`; Gemini 404’d — new users must use `gemini-3.6-flash`. Live was still on `gemini-2.5-flash-native-audio-preview-12-2025` (Google’s migrate-from string).

## Cut

1. One pin file: `src/lib/travis-models.ts`.
2. Text (Type dest-Travis, simplify once 017 lands): `gemini-3.6-flash`.
3. Live: `gemini-3.1-flash-live-preview`.
4. Same generateContent / Live connect. No Interactions API splice.

## Must-not

- Do not mint tables.
- Do not ship the key to the client.
- Do not append PM/SA logs.

## Verify

1. Dest Travis, Type, **Hey** → Travis `agent_post`, not a 404 status.
2. Dest Travis, Voice → Live connects (not the old 2.5 native-audio id).
3. Dest Engineer still sends as today.
