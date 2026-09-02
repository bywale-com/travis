# Hotfix 038 — Travis can look at the room

## The smoke

Room `48cf36fb`, 18:25:51. Travis, in Type:

> I’m ready, but I don’t have the two tasks you’re referring to. Please specify both actions.

It was executing those two tasks at that moment. The second had gone to SA
eight seconds earlier. And everything it needed was already in `voice_turn`:
the original ask at 18:25:06, the first send at 18:25:14, SA’s reply at
18:25:38, the second send at 18:25:43. Four rows, seconds old, one query away.

Twenty seconds before that, asked why it was waiting:

> I’m not intentionally waiting—I **may** have been processing the previous turn.

`seat_live_run` held that answer with a start time on it.

## Why

Travis had no read of the room at all. `send_to_seat` returns a receipt, never
the reply, so **Travis had never received a single word any seat had said** in
the entire life of the product. Talk builds each request from `input: prompt`
alone, so every typed message was a first message.

## Two operations, not one

A tool alone cannot fix this. Pulling requires knowing you need to pull, and
confabulation is by definition the case where the model does not know. At
18:25:51 Travis *did* notice its gap — a tool would have helped there. At
18:25:31 it did not notice, and no tool it must choose to call would ever have
fired.

So context arrives two ways.

**Pushed, unasked, bounded.** `roomContextFor()` builds a short room-state
block: what is running and for how long, then recent turns oldest-first.
Injected into every Talk request (in `input`, so the cached `instructions` +
tools prefix stays byte-stable) and into the Live session at connect — which
also means a reconnect after a drop no longer starts blank.

**Pulled, on demand, potentially large.** `read_seat_reply(seat, form?)` is the
only way Travis can see a seat’s words. Long replies are condensed on the cheap
text model server-side; `form: "full"` insists on the text.

## Cost

The window is bounded by construction, not by hope:

- at most 14 turns considered
- `agent_thought` never enters; `status` only when it is an error
- a seat reply becomes a receipt — size plus a 140-character quote — so a
  40,000-character Engineer post costs the same as a one-line SA post
- user and Travis lines clipped at 300 characters
- the whole block trimmed from the **oldest** end to 2,600 characters

A room running for hours costs the same per turn as one a minute old. Full
bodies only ever cross when Travis asks, and a gist costs less than the text —
so asking for a summary is cheaper than asking to hear it.

## What this unlocks

“What did the engineer say”, “summarize the last thing the SA said”, and the
report half of “ask X and tell me what it says” all become reachable. Travis
also stops asking the founder to repeat things that are already in the room,
and stops hedging about work it can see running.

## Not in this cut

`dispatch_to_seat` — sends still block until the seat finishes. Fan-out,
visible queueing from one utterance, and notify-on-landing need the write half.

## Verify

- `npm test` — 162 pass, eleven new in `room-context.test.ts`, including a
  regression built from the lived 18:25 turns and a 400-turn room asserted to
  stay under the ceiling.
- On the phone in Type: send two lines to one seat in one message, then ask
  “what were those two tasks?” It should answer from the window instead of
  asking you to repeat. Then ask what the seat said — it should read or
  summarize it rather than inventing.
