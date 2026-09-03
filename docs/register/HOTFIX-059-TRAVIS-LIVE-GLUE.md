# Hotfix 059 — Stop Travis gluing every reply onto the last one

**Number:** `059` — next engineer hotfix is `060`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (founder, room `0e8875f8`: Travis answers the same wrong sentence twenty times, then says he has no rename tool).  
**When:** 2026-09-03  
**PR title shape:** `Hotfix 059 — Travis live glue`

---

## Why

Live wrote every transcript delta into the last Travis row. A new spoken reply that did not share a prefix was concatenated (`acc + incoming`). One post hit 14k characters. The room window then handed those copies back as “You said,” so the next answer was the last wrong one.

He also invented an elevation rule instead of Hold / pass-on, and a long-lived Live session never picked up `rename_room`.

## Cut

1. A new Live utterance inserts a new Travis post. A growing snapshot still updates the same one.
2. Persist on flush, not on every delta.
3. The room window keeps only the latest Travis line.
4. System: elevation is Hold or pass-on. `list_initiatives` / `rename_room` when asked.

## Must-not

- Do not mint a table.
- Do not invent triage about which request “deserves” a ticket.
- Do not append PM/SA logs.
