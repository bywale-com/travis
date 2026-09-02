# Hotfix 041 — Travis says what it is about to do

## The observation

Voice feels much smarter than Type. Same model, same tools, same room.

The difference is boring: in Voice you hear Travis continuously, and in Type
you watch nothing happen for thirty seconds while a tool blocks. One of them
talks and the other does not. That reads as intelligence and it is really just
narration.

## The cut

`narrateToolCall(name, args)` returns one plain line, and `runTravisTool`
writes it to the room log **before** running the tool.

- `Starting the SA on “demomessages”.`
- `Sending “look at the stream” to the Engineer and waiting for the answer.`
- `Reading what the Engineer said.`
- `Dropping the PM's waiting line.`

Written here rather than asked of the model on purpose: it is deterministic, it
costs no tokens, it cannot be forgotten, and it appears identically on both
ears. Asking the model to narrate would add a turn of latency in Voice and
would be skipped whenever it felt terse.

## Never spoken

The line lands in the log and is not read aloud. Reading tool chatter aloud is
the spam we already ruled out — and in Voice you can hear Travis anyway, which
is the whole reason Voice never had this problem.

## Silence where a line would be noise

`list_seats`, `queue_snapshot`, `work_in_flight` and `set_view` get no
narration. They are instant and their answer says more than the announcement
would. A narration for everything is a slower way to say nothing.

## Verify

- `npm test` — 182 pass, six new in `tool-narration.test.ts` covering seat
  naming, clipping a 500-character line, both barge directions, silence on
  instant lookups, and an unknown seat not producing a broken sentence.
- On the phone in Type: ask for two sends. The log should show
  “Starting the SA on …” immediately rather than sitting blank until the run
  finishes.
