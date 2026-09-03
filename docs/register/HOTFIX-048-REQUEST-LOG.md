# Hotfix 048 — Request log (same room)

**Number:** `048` — next engineer hotfix is `049`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (founder, room `0e8875f8`: Travis keeps losing the initiatives just routed; they want a detailed log they can see and Travis can always search — no more sessions).  
**When:** 2026-09-03  
**PR title shape:** `Hotfix 048 — request log`

---

## Why

The room already has every send in `voice_turn`. Travis is only handed a 14-turn receipt window (038), so after a few routes it cannot answer “what did we just spec.” The founder asked for a timestamped log of requests — not a new kind of request — that Travis can search and that they can open.

## Cut

No new table. The log **is** `kind = user` on `voice_turn` in this session.

- `search_room` — Travis lists or searches that log (stamp, dest, text). Always, not just the window.
- Room-state pointer: “this room has N requests… call search_room.”
- Face: quiet **Requests** in the header. Door with search. Tap a row to jump to it in the thread (switches to Log if needed).

Stay in this room. Do not open another session.

## Must-not

- Do not mint a request / initiative / backlog table.
- Do not dump the whole log into the unasked window.
- Do not append PM/SA logs.

## Verify

`npm test`. On the live room: header **Requests** lists the routed briefs (TTS voice, cost, output types, barge/mediation, …) with times. Ask Travis what is in motion — it should `search_room`, not say it forgot.
