# Hotfix 072 — A dead box step is not still in motion

**Number:** `072` — next engineer hotfix is `073`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived room `0e8875f8`, 2026-09-05).  
**When:** 2026-09-05  
**PR title shape:** `Hotfix 072 — a dead box step is not still in motion`

---

## Why

Voice showed **1 in motion**. Backlog All showed **Production redeploy machine check · step 2 of 2**. Travis already wrote the file and confirmed `ls` last night.

Step 1 `write_box` was `done`. Step 2 `run_box` sat `running` with an empty result since 21:57 UTC. The serverless request died after claim. The runner only claims `pending`, so a leftover `running` row is a dead lock. The count never goes to zero.

A second one-step `run_box` from this morning’s “I’ve read the transcript” hung the same way.

The All list’s “Not the request log” footer was pinned under the scroll. Older tickets (`こう。`, Clarify, Directly pass) sat below the fold. The footer made the pile look finished after **That’s fine.** / **It doesn't go to the PM anymore, just.**

---

## Cut

- A `running` step with no result older than 60s is dead. Reset it to `pending` and run it again.
- Do that at the start of each motion and if claim finds nothing.
- Backlog footer rides in the scroll, after the rows. The end of the pile is the end of the pile.

---

## Must-not

- Do not mint a table. Do not remint 013 / 023.
- Do not complete **That’s fine.** or its restates.
- Do not append PM or SA logs.

## Verify

`npm test`. Lived: Voice **N in motion** gone when those tapes finish. Backlog All scrolls to `こう。` and the older tickets before the request-log line.
