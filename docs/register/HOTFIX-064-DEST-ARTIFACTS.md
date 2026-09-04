# Hotfix 064 — Dest-seat artifacts, rich type, thought on the roster

**Number:** `064` — next engineer hotfix is `065`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (founder: no Hold to see artifacts; L1 signed; L3 stays the roster).  
**When:** 2026-09-04  
**PR title shape:** `Hotfix 064 — dest-seat artifacts`

---

## Why

009 hung only ticketed posts. Dest Engineer produced an image and a file; the Log stayed empty. Founder: if it is visible in Cursor chat, it is visible here. Hold is not the door.

L1: mid-line `**bold**` / `*italic*` and the ticket Messages door stayed marks.

L3 first cut replaced the glowing-mark tap. Roster already opens from the room title. Thought belongs **on that seat’s circle inside the roster**.

## Cut

- Hang on any `agent_post` this run touched. Ticket optional. Same kinds: `image` | `file`.
- `parseInline` eats bold and italic. Ticket Messages uses `AgentPostBody`.
- Roster: thinking seat’s mark glows; tap the mark to read the thought. Add / Create / Remove stay.

## Must-not

- Do not mint `link` or a structured kind.
- Do not store bytes.
- Do not give Travis a create-agent tool (V4 / roster **Create an agent** is already planted).
- Do not plant L2’s beat closer. SA.
- Do not append PM or SA logs.

## Verify

`npm test`. Dest Engineer, no ticket, produce a png and a txt: both appear under the Log post. Roster still adds and creates. Thinking ENG circle in the roster opens the thought.
