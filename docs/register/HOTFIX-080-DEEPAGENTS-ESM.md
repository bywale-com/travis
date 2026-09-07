# Hotfix 080 — Deep Agents must answer on the live app

**Number:** `080` — next engineer hotfix is `081`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer. Lived smoke after [#149](https://github.com/bywale-com/travis/pull/149) / 079.  
**When:** 2026-09-07  
**PR title shape:** `Hotfix 080 — Deep Agents must answer`  
**Test:** [`HOTFIX-080-DEEPAGENTS-ESM-TEST.md`](./HOTFIX-080-DEEPAGENTS-ESM-TEST.md)

---

## Why

Room Travis (`0e8875f8-283b-4dae-bf54-76c82a05b6ef`). After 079, two sends landed. Travis did not answer.

| seq | kind | when UTC | text |
|-----|------|----------|------|
| 899 | user | 14:39:23 | `what was the last thing we just you know I asked you a couple chats ago to do something what how was that what was that` |
| 900 | status | 14:39:27 | `Travis: Cannot use import statement outside a module` · **speakable false** |
| 901 | user | 14:40:12 | same question again |
| 902 | status | 14:40:27 | same import line · **speakable false** |

Calling `Travis` (seq 897) still answered in one second — that path never loads Deep Agents. A real line hits `invokeDeepAgent` and dies.

The Log **hides** that status: `threadTurns` only keeps `kind=status` when `/error/i` matches the text. This message has no word “error.” He sees two of his lines and silence. That is the unreliability.

079 fixed HTML 500 at **function load**. This is the **invoke**: `deepagents` ESM (`Cannot use import statement outside a module`) on the Vercel Node function.

## Cut

1. **Deep Agents must run** on the live send. `generateTravisText` → `invokeDeepAgent` must not throw `Cannot use import statement outside a module`. Fix the hang (external package / `deepagents/node` / whatever Next needs). Quote a successful `agent_post` on a real line. Do not remint dest-with-context grain.
2. **Mouth if the kit throws.** If import/invoke still throws, do not leave a mute status as the only write. Restore the OpenAI Responses loop as **fallback for this generate** (same tools, same `OPENAI_API_KEY` / `TRAVIS_TEXT_MODEL`). Dest-with-context in `runTravisTool` stays. Delete the six-step loop as the primary hang only after the kit actually answers.
3. **Visible miss.** A failed Travis generate must show on the Log as a real line (speakable post or status that is not filtered out). Do not keep `speakable: false` + no `/error/` as the only record.

## Must-not

- Do not remint 014 / 030 dest-with-context.
- Do not unclip Here.
- Do not swap dest seats for Deep Agents `task` / subagents.
- Do not put Hear it / Skip buttons back.
- Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.
- Do not treat “buy another platform” as this cut.

## Verify

Sheet: [`HOTFIX-080-DEEPAGENTS-ESM-TEST.md`](./HOTFIX-080-DEEPAGENTS-ESM-TEST.md). Live Travis app. A real line to Travis gets an `agent_post`, not silence.
