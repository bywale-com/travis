# Hotfix 066 — One-PR trail + leftover cleanup

**Number:** `066` — next engineer hotfix is `067`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (founder: update everywhere the one-PR law should live; merge what needs merging; close leftover cousins).  
**When:** 2026-09-04  
**PR title shape:** `Hotfix 066 — one-PR trail and leftover cleanup`

---

## Why

065 wrote the law. House protocols, the PM pickup, and leftover cousin PRs still pointed at a second object. 003–007 lived only on [#15](https://github.com/bywale-com/travis/pull/15). Packet 002 lived only on [#4](https://github.com/bywale-com/travis/pull/4). Closing those without bringing the trail would lose founder wording.

## Cut

- House `/protocols` and work-repo templates name one PR. Seated sit stays planted (015).
- PM trail 003–007 + packets 002–007 + signed plates that were only on leftover #15 / #4 land on this tree.
- Pickup files (`ENGINEER-HANDOFF.md`, `PM-HANDOFF.md`, `PM-PACKETS.md`) stop sending a new seat to a cousin branch.
- Leftover cousin PRs close after this lands. Stale remote branches delete. Do not squash already-merged `main` history.

## Must-not

- Do not rewrite merged commits on `main`.
- Do not edit a past Phase One stamp. Current may move.
- Do not append SYSTEMS-ANALYST-LOG.
- Do not remint 012 / 013 / 014 / 015 / 062 / 064 / 065.
- Do not auto-seed house from migrate. Refile with `file-house.ts`.

## Verify

`npm test`. House protocols mention one GitHub PR. Leftover cousin PRs closed. Next hotfix is **067**.
