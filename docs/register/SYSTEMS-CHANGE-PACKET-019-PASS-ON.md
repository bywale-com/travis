# SYSTEMS-CHANGE-PACKET-019 — Pass-on hangs on the named ticket

**Status:** **Signed.** Engineer already planted ([`HOTFIX-071-PASS-ON.md`](./HOTFIX-071-PASS-ON.md) · PR **#116**). This packet **signs**, it does not remint.

**Ascribed by:** Systems Analyst  
**Date:** 2026-09-04  
**Envelope:** [`ENVELOPE-TRAVIS-PASS-ON.md`](./ENVELOPE-TRAVIS-PASS-ON.md) — “SA signs the Story or names a silence.” Packet number **019** as locked on the envelope.

**Founder this pass:** only the newest envelope. Do not cut 016 / 017 / 018 from this seat.

---

## 1. Envelope (do not paraphrase)

> Bundle the named ticket and send it; last spoken line is not a new initiative; SA must actually receive it.

Lived: room `0e8875f8`, seq 635–640. “Bundle That’s fine. + the addition, send to SA” minted `Yes, that's the exact one.` That’s fine. untouched. “Calling the SA…” left no `user` turn, no live run, no person, no receipt.

---

## 2. Story (signed)

A pass-on to a **named ticket** does not mint a cousin from the last spoken line. The addition hangs on that ticket. A failed leave is a **receipt**. If spin dies, an idle catalog person of that role may take the line — **not a sit**.

`ensureViaTravis` stays the 008 fallback when **no** ticket is named (no `id`, no open title in the send or in Travis’s last speech). That is not dest-Travis chatter founding a cousin while a title is already named. `Agent.create` does not need a new port.

---

## 3. Machine (already planted — quote, do not remint)

| Lock | Where it lives now |
|------|-------------------|
| Named ticket first | `ticketForHand(sessionId, id, sendText)` — `src/server/initiative.ts` |
| `id` present | That row, same room. Stamp the unstamped latest founder→Travis line onto it. 404 if missing. |
| `id` absent | `namedTicketFromSpeech` — open titles, haystack = send text + last 12 Travis `agent_post`s. Last mention wins. Titles shorter than `NAMED_TITLE_MIN` (8) do not steal. |
| No named ticket | `ensureViaTravis` — 008. Latest founder→Travis line, or null. |
| Failed leave | `send_to_seat` / `dispatch_to_seat` catch → `postHandReceipt` with the throw text. |
| Catalog fallback | `idleCatalogRole` — same `seat_key` as the role, has `cursorAgentId`, no `seat_live_run`. Receipt: not seated. **Not** `sit_agent`. **Not** a protocol write. |

Do not remint 008 / 015 / 069 / 070. No new table. No `Agent.create` port.

---

## 4. Refused (named silences)

- Auto-sit catalog slugs (`pm` / `sa` / `engineer`).
- Computer use.
- Travis seeing Cursor PRs.
- A second founding grain that kills `via_travis` when nothing is named.

---

## 5. Engineer

**Nothing to plant.** PR **#116** is on `main`. If a later hotfix touches pass-on, keep the Story: named ticket wins; last spoken confirmation is not a cousin; a failed leave is a receipt; catalog fallback is not a sit.

Do not send **That’s fine.** from this bind.

---

## Verify (already true on `main`)

- Send that names an open title hangs there without `id`.
- A throw on send / dispatch / spin is a receipt.
- Catalog idle of that role can take the line; protocol_path is not written.
- No new migration.
