# Hotfix 049 — Granular search_room

**Number:** `049` — next engineer hotfix is `050`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (founder: use the request log as last 10, today, everyone this week).  
**When:** 2026-09-03  
**PR title shape:** `Hotfix 049 — search grain`

---

## Why

048 gave Travis `search_room` with only `q` and `seat`. “Requests today”, “the last 10”, and “everyone this week” had no knobs. Travis could not answer those without inventing a slice.

## Cut

Same store. New filters:

| Founder says | Tool |
|---|---|
| Requests today | `when: "today"` (this UTC day) |
| Last 10 | `limit: 10` |
| Everyone this week | `when: "week"` (last 7 days), no seat |

Requests door gets the same Today / Week / All words. Times are UTC — no user timezone store.

## Must-not

- Do not mint a table.
- Do not invent a founder timezone.

## Verify

`npm test`. Ask Travis “what did we request today” and “the last 10.” It should call `search_room`, not guess.
