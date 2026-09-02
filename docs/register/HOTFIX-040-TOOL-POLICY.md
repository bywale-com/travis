# Hotfix 040 — What "safe" means, written down

038 and 039 gave Travis senses and hands. This is the half that makes it safe,
and the point is that it is a **definition**, not a pile of guards.

## The definition

> A tool call is safe when its effect is one the founder would predict from
> what they just said, and when any effect they cannot undo was confirmed
> first.

That is made operational by classifying every tool by what it does to the
world, then attaching rules to the **class** rather than to the tool.

| Class | Meaning | Tools |
|-------|---------|-------|
| `read` | No effect | `list_seats`, `queue_snapshot`, `work_in_flight`, `read_seat_reply` |
| `write` | Spends money or starts work elsewhere | `set_view`, `send_to_seat`, `dispatch_to_seat` |
| `destructive` | Removes something that existed | `barge_or_drop` |
| `terminal` | Ends the room | `end_session` |

## Why this shape

**Extensible in both directions.** Adding a tool is one policy line, and every
rule already written applies to it. Adding a rule is one guard, and every tool
of that class is covered at once.

**Fails closed.** A tool with no policy entry cannot run. It is therefore
impossible to ship a tool and forget to classify it.

**Countable.** `policyCoverage()` turns "how much of this have we done" into a
value a test asserts. `tool-policy.test.ts` fails if any declared tool lacks a
policy, and fails again if the policy carries an entry for a tool that no
longer exists. Coverage is a fact, not a memory.

## The rules that exist now

1. **Unknown tool is denied** — fails closed, with a reason Travis can say out
   loud rather than a crash.
2. **Irreversible needs a second beat** — `end_session` refuses without
   `confirm: true`, and the refusal tells Travis to ask the founder first.
   `confirm: "yes"` and `confirm: 1` do not count.
3. **No accidental double-send** — the same text to the same seat inside 45
   seconds is refused, and the refusal says how long ago the first one went.
   Read off the room log, so no new store.
4. **Preconditions answer the question asked** — `barge_or_drop` on a seat with
   nothing queued used to say "Nothing waiting on that seat" while that seat
   was mid-run. It now distinguishes running from idle and says barge cannot
   stop a run.
5. **Failure is never silent** — `generateTravisText` hitting its six-round cap
   used to return `""`, which the reply path rendered as a bare `…`. It now
   says it ran out of steps and that started work is still running.

## Rules deliberately not written yet

Rate limiting, per-seat spend ceilings, and an undo for `barge` deletes. Each
is one more guard against the same classes when it is wanted.

## Verify

- `npm test` — 182 pass, sixteen new in `tool-policy.test.ts` including the
  coverage assertion in both directions and the prototype-pollution case
  (`policyFor("constructor")` is null, not `Object.prototype.constructor`).
