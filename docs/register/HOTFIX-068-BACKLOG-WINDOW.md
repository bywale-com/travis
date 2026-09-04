# Hotfix 068 — Backlog is already in the room window

**Number:** `068` — next engineer hotfix is `069`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived room `0e8875f8`, 19:11 UTC 2026-09-04).  
**When:** 2026-09-04  
**PR title shape:** `Hotfix 068 — backlog is already in the room window`

---

## Why

The founder could see the new ticket at the top of Backlog. Travis, in the same room:

> there are no initiatives in the backlog right now

Five open rows sat in `travis.initiative`, including `That's fine.` stamped two minutes earlier. After a break it listed five. Same store. The window never named the pile, so Travis had to pull. A `list_initiatives` search miss formats as “No initiatives in this room,” so a needle miss became an empty backlog. It also talked too long.

Same law as 038 / 048: push unasked, bounded. Do not make seeing the top of the list a judgment call.

## Cut

- Room-state glance: open titles (five), plus the count. Already true. Do not say empty.
- A `q` miss says no match, then how many are open.
- Travis is told to speak short and not invent an empty pile.

## Must-not

- Do not mint a table. The glance is `initiative` titles, same room.
- Do not dump founding lines or seat posts into the window.
- Do not remint 008 / 013 / 038 / 048.
- Do not append PM or SA logs.

## Verify

`npm test`. Lived: dest Travis, ask what’s on the backlog. It names the top ticket without claiming the pile is empty. It does not narrate a check.
