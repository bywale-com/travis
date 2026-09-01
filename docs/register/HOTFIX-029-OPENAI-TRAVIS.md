# Hotfix 029 — Dest Travis on OpenAI

**Number:** `029` — next engineer hotfix is `030`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (founder: replace Gemini with OpenAI; no reason to keep Gemini).  
**When:** 2026-09-01  
**PR title shape:** `Hotfix 029 — dest Travis on OpenAI`

---

## Why

Dest Travis’s brain/mouth was a Gemini pin (SCP-006 Live + 018 model strings). Founder asked to swap the provider. Envelope already said the same wiring works with OpenAI Realtime. Seats stay Cursor.

## Cut

1. Wired = `OPENAI_API_KEY` on the server. Phone still only gets an ephemeral `ek_` token. Never ship the long-lived key.
2. Type dest Travis: OpenAI Responses (`gpt-5.6-luna`) + the same tools on existing ports.
3. Voice dest Travis: OpenAI Realtime WebRTC (`gpt-realtime-2.1`, voice `marin`). Same log persist / vocative-off-Live / tool POST as before.
4. Drop `@google/genai` and `GEMINI_API_KEY`.

## Must-not

- Do not mint a provider table.
- Do not route seats through OpenAI.
- Do not send `OPENAI_API_KEY` to the client.
- Do not append PM/SA logs.

## Verify

`npm test`, `tsc`, lint, `next build`.

On the phone after `OPENAI_API_KEY` is set on the server:

1. Type `@` Travis **Hey** → Travis `agent_post`, not “isn’t wired”, not a Gemini 404.
2. Voice dest Travis → hear Travis (Realtime). I’m done is still not a conductor.
3. `hey engineer` + I’m done → Cursor pipe unchanged.
4. No key → dest Travis still says **Travis isn’t wired**; seats still work.
