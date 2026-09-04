# Hotfix 069 — The receipt is the send

**Number:** `069` — next engineer hotfix is `070`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived room `0e8875f8`, 19:09–20:00 UTC 2026-09-04).  
**When:** 2026-09-04  
**PR title shape:** `Hotfix 069 — the receipt is the send`  
**Envelope:** [`ENVELOPE-TRAVIS-HAND.md`](./ENVELOPE-TRAVIS-HAND.md)

---

## Why

The founder asked Travis to hand **That’s fine.** to the Systems Analyst (look at the face, then resend with delete / complete). Travis posted “Starting the SA…” and later “still in progress.”

The room:

- No `user` turn to `sa` after 2026-09-03
- No `seat_live_run`
- No queue
- Last SA post in the room was the September 3 cost-panel essay

Travis then *read that essay* as if it were this ticket. The founder said “What are you talking about?”

Narration fires when the tool is *called*. Dispatch receipts were not written to the log. `read_seat_reply` is last-by-slug. Here named idle and still let Travis invent a wait.

Do not touch the ticket. The founder completes it inside Travis.

---

## Cut

- Send / dispatch narration is “Calling…”, not “Starting…” / “waiting for the answer.”
- The **receipt** (started / failed / busy / sit error) is posted to the log. That is the send.
- `read_seat_reply` takes optional initiative `id`. No post on that ticket says so. A send after the last post is not yesterday’s essay. A room-wide last line is labeled not a ticket read.
- `read_initiative` with no posts: “No seat has posted on this ticket.”
- Here names **not seated** and **No seat is running** when `seat_live_run` is empty. Do not say a handoff is in progress.
- “How is that coming?” → `work_in_flight`. Ticket questions → `read_initiative`.

## Must-not

- Do not mint a table.
- Do not auto-sit the catalog `pm` / `sa` / `engineer` rows.
- Do not send **That’s fine.** from this cut. Do not sit the old `sa` slug.
- Do not remint 015 / 016 / 037 / 041.
- Do not append PM or SA logs.

## Verify

`npm test`. Lived: dest Travis, ask whether SA posted on **That’s fine.** — it must not read the cost-panel essay. Ask if the handoff is still going — Here empty of a run means no. Then you send the ticket from Voice. Role dest (`seat=sa`, no `who`) spins and sits a new person.
