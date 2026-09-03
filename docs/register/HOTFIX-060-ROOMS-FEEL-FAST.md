# Hotfix 060 — Rooms list and clicks feel heard

**Number:** `060` — next engineer hotfix is `061`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (founder: refresh sits on a blank index; taps feel dead; Travis “read the last reply” hangs).  
**When:** 2026-09-03  
**PR title shape:** `Hotfix 060 — rooms feel fast`

---

## Why

`/api/rooms` did one membership query **per room**. 64 rooms on a one-client pool is a serial parade. Live still refetched the whole turn list on every Travis audio tick. The index painted “No rooms yet” until that finished, so a tap looked like a miss.

`read_seat_reply` also wrote a “Reading…” receipt before the read.

## Cut

1. One member query for the whole index.
2. Live does not refetch turns on each audio delta — only when a line lands.
3. Index says **Loading rooms…** / **Entering…**. Backlog says **Loading…**. Door opens before the fetch.
4. `read_seat_reply` is silent. The wait is the read (and a gist if the post is long), not a fake receipt.

## Must-not

- Do not raise the DB pool (045).
- Do not mint a table.
- Do not add a spinner kit.
- Do not append PM/SA logs.
