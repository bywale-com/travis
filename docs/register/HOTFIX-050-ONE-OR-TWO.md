# Hotfix 050 — One seat, two at most

**Number:** `050` — next engineer hotfix is `051`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (founder: Travis kicks a beat to everyone; seats work it in silos).  
**When:** 2026-09-03  
**PR title shape:** `Hotfix 050 — one seat, two at most`

---

## Why

Tonight the same founder beats (Voice quiet, cost, output types, barge/hear-queue) went to PM, SA, and Engineer. Each seat wrote its own spec. 039 taught Travis that different seats run at once. The tool descriptions still said “several things sent.”

Founder law: kick it to **one** person at a time, **two at most** if two different jobs were named.

## Cut

- `TRAVIS_SYSTEM` and `dispatch_to_seat`: one seat; two only for two jobs; never everyone; never the same initiative twice.
- Hard guard on `send_to_seat` / `dispatch_to_seat`: dest user turns since the last founder→Travis line. Same text to a second seat → refuse. A third dest → refuse.
- No new table. The room log is the beat.

## Not this cut

PM-PACKET-007 hear-queue / barge. That is locked on the PM living PR. Do not plant it here.

## Must-not

- Do not mint a routing table.
- Do not append the PM or SA logs.

## Verify

`npm test`. Ask Travis to send the same line to PM and Engineer. The second call must refuse. A third dest in the same beat must refuse.
