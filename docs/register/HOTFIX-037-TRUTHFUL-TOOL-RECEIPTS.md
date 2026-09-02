# Hotfix 037 — Tools tell Travis what actually happened

## The smoke

Room `48cf36fb`, 18:25. One utterance asked for two sends to SA. The log:

| Time | Event |
|------|-------|
| 18:25:14 | first `demomessages` → SA |
| 18:25:40 | SA finished (26s later) |
| 18:25:43 | second `demomessages` → SA |
| 18:25:54 | Travis: “Sent two parallel messages to SA” |

They were 29 seconds apart. Travis called them parallel.

Asked mid-run why it was waiting, it said “I’m not intentionally waiting—I
**may** have been processing the previous turn.” It was guessing about itself.

## Why

Travis was told nothing. `send_to_seat` returned the bare string
`Sent to SA.` whether it returned instantly or blocked for 26 seconds, and its
declaration never said the call blocks at all. The model emitted both calls in
one response — genuinely meaning “together” — and the server’s `for … await`
loop serialized them without telling it. It reported its intent because intent
was the only thing it could see.

This is not the model being wrong. It is the tool contract giving it no way to
be right.

## The cut

Three changes, all additive. No change to when anything sends.

**1. `send_to_seat` says what it did.** `src/lib/tool-receipt.ts` builds the
string from the real outcome:

- `Sent to Systems Analyst. The run finished and the reply is in the room log (312 characters). This call blocked for 26s.`
- `Queued for Systems Analyst — 2 waiting ahead of it. Not sent yet.`
- `Sent to Product Manager. The run errored. This call blocked for 8s.`

**2. The declaration states the blocking contract**, so the model knows before
it plans: “This call blocks until that seat’s Cursor run finishes, so two calls
in one turn go one after the other — never at the same time.”

**3. New `work_in_flight` tool** — what is running, for how long, and what is
waiting behind it. `queue_snapshot` only ever saw *waiting* lines, so “what are
you doing right now” had no truthful answer available. Reads `seat_live_run`
and the queue; no new grain.

`TRAVIS_SYSTEM` now says to report what the tools returned, not to call sends
parallel, and to call `work_in_flight` rather than guess.

## Cost

Receipts are bounded and carry no reply bodies — a reply of any size costs the
same handful of tokens, since only its character count crosses. `work_in_flight`
is one short line. Nothing here grows with room length.

## Not in this cut

Non-blocking dispatch, seat replies flowing back to Travis as events, and a
Talk thread that survives between messages. Those change the tool contract and
want a packet. This cut only stops the pipe from lying.

## Verify

- `npm test` — 151 pass, nine new in `tool-receipt.test.ts` covering elapsed
  wording, blocked-duration disclosure, receipts staying receipts at 40k-char
  replies, errored runs, empty replies, queue depth, and the in-flight line.
- On the phone: ask Travis for two sends to one seat in a single message. It
  should now say they went one after the other, and say how long it waited.
