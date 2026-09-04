# Hotfix 065 — One PR per initiative

**Number:** `065` — next engineer hotfix is `066`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (founder: singular PR; seats share it; initiatives get a folder).  
**When:** 2026-09-04  
**PR title shape:** `Hotfix 065 — one PR per initiative`

---

## Why

Everyone was minting a PR. Envelope, SA packet, Engineer plant, leftover drafts. Walking could not tell which object was the work. Some merged. Some sat. Cousins of planted packets stayed open.

Founder: **one PR per initiative.** Engineer usually opens it. SA works inside it. Engineer works inside it and merges. Hotfixes stay their own cuts and **do get merged**. Envelopes, pockets, and packets are roles of that one PR — not three GitHub objects.

## Cut

- Law: [`initiatives/README.md`](./initiatives/README.md).
- First folders: [`initiatives/014-log-beats/`](./initiatives/014-log-beats/) · [`initiatives/015-disposable-seats/`](./initiatives/015-disposable-seats/). Short context. What changed. Pointers. Not a second packet.
- Seats and always-on name the one-PR rule. Hotfix receipts stay `HOTFIX-NNN-*.md`.

## Must-not

- Do not mint a table. This is register trail, not `travis.initiative`.
- Do not move hotfixes into the initiative folders.
- Do not open a second PR because a second seat sat down.
- Do not append PM or SA logs.
- Do not close leftover historical PRs in this cut.

## Verify

`npm test`. One PR for this hotfix. Engineer and SA would both push this branch. Folder exists. Index lists 014 and 015.
