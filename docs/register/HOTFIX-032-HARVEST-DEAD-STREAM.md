# Hotfix 032 — Harvest a dead Cursor stream into the log

**Number:** `032` — next engineer hotfix is `033`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived: dest Engineer “where are we now” reached this seat; Cursor answered; the phone log stopped on the user turn and still said Engineer was running).  
**When:** 2026-09-01  
**PR title shape:** `Hotfix 032 — harvest a dead Cursor stream`

---

## Why

Session `d87fccd5-…` seq 13 is the user turn. `seat_live_run` still holds `run-b8074778-…`. There is no thought, no `agent_post`, no `finished`. The phone SSE got `matched` + `running` and never `done`.

The Cursor work outlives the Travis serverless stream. 030 persists `post_delta` **if any arrived**. This run died in tools before a word. 030’s nudge only looks at seats with a queue, and only when the **latest** listRuns row is idle — a later follow-up on the same seat keeps the leftover row forever. The Room also leaves `liveStatus` on “is still running” when the SSE closes without `done`.

## Cut

1. Harvest **that stored run id** via `Agent.getRun` once it is no longer running. Write one `agent_post` (same row grain as 030) + `finished`, then release the live-run row. A newer follow-up on the same seat does not block this. Unknown ≠ idle.
2. Queue GET reaps leftover live-run rows for the session even when the queue is empty. The 4s poll paints the post.
3. Phone: SSE close without `done` / `queued` clears “is still running” and refreshes turns.

## Must-not

- Do not harvest a stored run that is still `running` / `creating`.
- Do not treat listRuns-unknown as idle.
- Do not re-add a busy guard that swallows a turn while a seat works (025).
- Do not append PM/SA logs.

## Verify

`npm test`.

On the phone after deploy: dest Engineer a turn that takes longer than the function. The log should gain the post after the run finishes (refresh or wait ~4s), and “is still running” should drop when the stream dies — not sit until you open Cursor.
