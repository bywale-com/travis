# Hotfix 061 — Rooms ordered by last line

**Number:** `061` — next engineer hotfix is `062`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (founder: the index is not most-recent-conversation-first).  
**When:** 2026-09-03  
**PR title shape:** `Hotfix 061 — rooms by last line`

---

## Why

The index ordered by `voice_session.created_at`. The busy room sat under empty newer ones.

## Cut

Default order is last `voice_turn.created_at` in that room. No turns → created. The age on the row is that time. Same tables. No sort modal.

## Must-not

- Do not mint a last-active column.
- Do not add a sort door.
- Do not append PM/SA logs.
