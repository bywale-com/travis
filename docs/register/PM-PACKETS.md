# PM packets — index

**Seat:** Product Manager.  
**Law:** Same as Om Coda Tower — PM packets live on **one reusable PR**. Do not open a new PR for every packet. Append the next numbered file on that branch / PR. When the living PR is **merged**, the next packet opens the **next** living PR (same branch `pm/packets` is fine) — still not one-PR-per-packet while a living PR is open.

## Numbering

| Rule | Detail |
|------|--------|
| Format | `PM-PACKET-NNN-SLUG.md` (three-digit, zero-padded) |
| Next | Always `max(existing NNN) + 1`. **Never reuse** a number, even if a packet is abandoned. |
| On main | Index + FACE / plates / PLATE-READ may land on `main`. **Living packet bodies** stay on the PM packets PR until the founder merges. |
| After merge | Merged packets are on `main`. Open a new living PR for `NNN+1`… and reuse *that* PR until the next merge. |

## Living PR

- **Status:** none open — [#1](https://github.com/bywale-com/travis/pull/1) **merged** 2026-08-26 (001 on `main`).  
- **Branch:** `pm/packets` (reuse for the next living PR).  
- **Next open:** when cutting **002** — `git pull` / fetch first, then push `PM-PACKET-002-…` and open the new living PR; record its number here and in [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **Current**.

## Packets

| # | File | Pocket | Where |
|---|------|--------|-------|
| 001 | [`PM-PACKET-001-VOICE-SESSION.md`](./PM-PACKET-001-VOICE-SESSION.md) | Smartphone continuous voice session (v1 pipe) | `main` (via [#1](https://github.com/bywale-com/travis/pull/1)) |
