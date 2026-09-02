# Hotfix 039 — Dispatch and leave

Second of the two operations. 038 was look; this is write.

## Why

`send_to_seat` holds the request open until Cursor says done. Everything
downstream follows from that one fact:

- Travis is mute for the entire run. Ask for a four-minute Engineer job in
  Voice and you get four minutes of silence.
- Two sends in one turn can never overlap, so the queue never trips from a
  single utterance — the second send always lands on a seat that just went
  idle. That is why room `48cf36fb` showed 29 seconds between two sends to SA
  and zero queue rows.
- Fan-out to three seats is the *sum* of three runs, not the longest of them,
  because the loop awaits each call regardless of which seat it targets.

## The cut

`dispatch_to_seat` stops at `run_started` and returns. The work lives in
`seat_live_run` — where it already lived — and 032's `reapFinishedLiveRuns`
pulls the reply into the log on the next 4-second poll. No new store, no
background worker, nothing that has to survive the serverless response.

Both tools stay mounted. `send_to_seat` is right when the founder asked one
thing and wants the answer in the same breath; `dispatch_to_seat` is right for
everything else, and `TRAVIS_SYSTEM` tells Travis to prefer it out loud.

## The race this had to avoid

The live-run row is written **before** the call returns. A second dispatch
reads that row to decide whether the seat is busy, so returning first would let
both sends slip through as sends and the queue would stay empty for a new
reason. Ordering here is load-bearing, not incidental.

## What changes on the phone

- "Send two to the SA, don't wait" — first runs, second **queues**, the chip
  lights up, and Travis says which is which.
- "Ask all three" — three seats genuinely at once.
- Travis stays available while a seat works, so you can correct it mid-run.
- Receipts never imply an answer: a started dispatch says *nothing came back
  yet* and points at `read_seat_reply`.

Two lines to the *same* seat are still sequential. One Cursor agent per seat is
a fact, not a limitation we hid. The difference is that the seriality is now a
visible queue row instead of a frozen HTTP call.

## Not in this cut

Notify-on-landing. Travis can see a finished run via `work_in_flight` and read
it on request, but nothing yet pushes into Travis the moment work lands, so
"tell me when the engineer's done" still needs asking.

## Verify

- `npm test` — 166 pass, four new in `tool-receipt.test.ts` asserting a started
  dispatch never claims a reply and a stand-in is never reported as running.
- On the phone: "send demo and demo two to the SA, don't wait." Expect one
  running, one waiting chip, and Travis saying so.
