# Hotfix 063 — Handoff seat

**Number:** `063` — next engineer hotfix is `064`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (founder: update yourself to be able to handoff seat).  
**When:** 2026-09-03  
**PR title shape:** `Hotfix 063 — handoff seat`

---

## Why

The Engineer Cloud Agent could name a missing PM or SA grain and wait, or ask the founder to seat them. It had no ritual for writing the brief, handing one seat, and stopping. Lived: this seat kept the job instead of handing it.

## Cut

- `AGENTS.md` standing law + [`docs/seats/ENGINEER.md`](../seats/ENGINEER.md) § Handoff seat: name the seat, write a complete brief, hand it, stop. One hop. This Cloud Agent prints the brief; Travis `dispatch_to_seat`s in a room.
- Engineer paste / identity name the same stop.
- PM and SA seat READMEs: a landed brief is a job. Do not become the next seat.
- `TRAVIS_SYSTEM`: a brief that belongs to another seat is dispatched whole, one hop, stay.

## Must-not

- Do not mint a handoff table.
- Do not grow the create-agent one-line stub (012 / envelope).
- Do not auto-seed `os_node` from seat files (012).
- Do not plant PM→SA→Engineer auto-wake (PACKET-001).
- Do not append the PM or SA logs.

## Verify

`npm test`. Boundary asserts the one-hop lines. Create-agent prompt is still the one-line stub.
