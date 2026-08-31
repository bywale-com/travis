# Hotfix 027 — Travis stops failing silently in the log

**Number:** `027` — next engineer hotfix is `028`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived: Type mode works across PM / SA / Engineer including multi-message, but Travis never answers).  
**When:** 2026-08-31  
**PR title shape:** `Hotfix 027 — show Travis status turns`

---

## Why

Travis was answering. The answer was a **status turn**, and the log threw it away.

`pipeTravisText` writes a `status` turn on every failure path:

| path | text |
|---|---|
| `!travisIsWired()` — no `GEMINI_API_KEY` | `Travis isn’t wired` |
| `generateTravisText` throws — bad model id, quota, bad key | `Travis: <error>` |
| `noteTravisUnwired` | `Travis isn’t wired` |

The thread rendered only `user`, `agent_post`, and `travis_prompt`. `status` was filtered out, so the seat produced **nothing on the glass** — exactly "Travis isn't responding". The Cursor seats never hit this because their replies land as `agent_post`.

An empty model reply was also disguised: `if (!reply) reply = "…"` posted an ellipsis that looked like Travis speaking.

## Cut

1. Render `status` turns as a **quiet centered muted line** — no avatar, no bubble, no border. Per parametric elimination, a placeholder gets a muted line, not an equal section bar.
2. `isLoggedTurn` / `isQuietStatus` in `src/lib/turn-view.ts` so the filter is testable and cannot silently drop a kind again.
3. Replace the `"…"` placeholder with an explicit status turn: *Travis had no reply — the model returned nothing.*

## Must-not

- Do not render thinking or tool spam. `agent_thought` stays off the log — hygiene, not triage.
- Do not speak status aloud (`speakable: false` is unchanged).
- Do not mint tables. Do not append PM/SA logs.

## Verify

`npm test` 117/117, `tsc` clean, lint clean, `next build` clean. **Mutation-tested**: dropping `status` from `LOG_TURN_KINDS` fails the test.

On the phone, Type mode, `@TRV`:

- If the deploy has no `GEMINI_API_KEY` you now see **Travis isn’t wired** instead of silence.
- If the model id is wrong or the key is out of quota you see **Travis: …** with the real error.
- If it is wired and healthy, the reply posts as before.

That tells us which thing to fix next — the seat is not mute, it was being censored.
