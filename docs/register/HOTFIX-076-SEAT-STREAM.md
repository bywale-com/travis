# Hotfix 076 — Seat Stream closer; Log is one finished message

**Number:** `076` — next engineer hotfix is `077`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer. Technical PM cut. Skip SA.  
**When:** 2026-09-06  
**PR title shape:** stay `Hotfix 074 — skip SA, hang this bind` on this PR. Do not retitle.

---

## Why this is a hotfix, not a packet

008 / 024 already locked: live work is Stream; the Log is completed turns; same door / card for every working seat, including Travis. 014 then landed every dest `message` beat as a Log row. Lived walk: Log quiet while they work, then **boom** every chat on the tape. Only the last row gets a card.

No new face. No new store. No new plates. Same `StreamCard` as Travis. Recut the dest closer. Packet would wake SA for a grain already named.

Founder 2026-09-06: only the finished message on the Log. Everything else in the card. For everyone. Card looks the way Travis’s looks.

## Cut — Engineer

Dest **done** (and harvest/reap of a finished dest run) lands **one** speakable `agent_post` — the finished message (last stream `message` body, or `postText` if there is no event). `closeStream.closeTurnId` = that row. Stream events stay. The card is those events.

Named sites (quote, then recut):

1. `src/server/seat-pipe.ts` `driveDestCursorEvents` — the `for (const beat of beats)` over `messageBodies`.
2. `src/server/seat-pipe.ts` `reapFinishedLiveRuns` — the same loop over `harvested.beats`.

`dispatch.ts` stand-in already lands one post. Leave it.

Grain test next to the dest closer: N stream messages → one Log `agent_post` → card hangs on that id.

## Must-not

- Do not remint `travis.stream` / `stream_event`. Do not remint 023 MotionCard. Do not remint 025 Travis close.
- Do not mint a seat-stream plate. Same `StreamCard` / `StreamDoor`.
- Do not dump thought or process onto the Log. They stay events.
- Do not write a PM packet. Do not wake SA. Do not open a cousin PR.
- Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.
- Do not plant the hang tool. Do not touch catalog `pm`.

## Verify

1. Dest a seat. Log does not grow their chats while they work. In this room: their mark glows; Stream has trigger + events.
2. When they finish: **one** finished bubble on the Log. Card **above** that line. Tap = same Stream.
3. Travis card / 025 close unchanged.

## Out of scope

- Role dest `pm` vs `technical-pm` (02:00). Hang tool. 007. Initiative curate. 014 insert-vs-update during a live dump (this cut does not live-dump).
