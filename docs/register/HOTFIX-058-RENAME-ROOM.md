# Hotfix 058 — Rename rooms

**Number:** `058` — next engineer hotfix is `059`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (founder: many rooms share a blank title; the live one is hard to find).  
**When:** 2026-09-03  
**PR title shape:** `Hotfix 058 — rename rooms`

---

## Why

`voice_session.title` already exists (SCP-007). Create can set it. Nothing could change it after. The index is a pile of Untitled.

## Cut

1. Same field. Empty stays Untitled. Clip 80. No new table.
2. Founder: selected row **Rename** on the index; tap the name on the roster.
3. Travis: `rename_room` on **this** room, only when asked. Window says the current name.
4. Write is operator-owned (`requireOwnedSession`). Shared seed inboxes share the pile.

## Must-not

- Do not invent names for empty rooms.
- Do not give Travis a rooms catalog or a rename of some other room.
- Do not append PM/SA logs.
