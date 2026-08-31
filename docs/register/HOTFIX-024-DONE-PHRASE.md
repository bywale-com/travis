# Hotfix 024 — I'm done actually sends; the ear is not abandoned during a readback

**Number:** `024` — next engineer hotfix is `025`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived: I'm done doesn't send, or sends only sometimes, on Talk **and** Voice; capture looks disabled after a reply is read).  
**When:** 2026-08-31  
**PR title shape:** `Hotfix 024 — done phrase + readback ear`

---

## Why

Found by running the real accumulator against the result shapes Web Speech emits — not by reading.

1. **The done-phrase was swallowed whenever it never became a final result.**  
   `onresult` only sent when the phrase was in *committed* text, or when there was no interim left. Web Speech frequently holds the closing phrase as **interim** until the session ends. `onend` persisted that text and **never re-checked the conductor**, so the turn was never sent. Whether "I'm done" worked came down to whether Chrome happened to promote it to a final — exactly "sends only sometimes".

2. **A spent phrase stayed on the accumulator.** After a swallow (or a finalize whose response was not `queued`/`routerHandled`), the draft still ended in "…I'm done". The next breath appended behind it, putting the phrase mid-string where the end-anchored matcher can never fire again.

3. **The readback abandoned the ear.** `onend` retried while text-to-speech was busy, but gave up after 24 tries (9.6s). A 20s reply left capture dead until the 1.6s watchdog happened to clear — measured at **21s deaf** in the lifecycle harness.

## Cut

1. `conductorGate` — the live decision, unchanged in spirit: hold a phrase that is still interim.
2. `conductorOnEnd` — when the session settles, decide on the settled text. This is the missing half.
3. `finalizeUtterance` clears the draft as soon as it commits to sending, and refuses re-entry while a send is in flight.
4. `sttShouldKeepWaiting` — keep waiting for the mouth to go idle while listening is still wanted (bounded at 120s), instead of quitting at 9.6s.

## Must-not

- Do not loosen the end-anchor on phrase matching. "I'm done with the migration file" is a sentence, not a turn end — covered by test.
- Do not mint tables. Do not append PM/SA logs.

## Verify

`npm test` 98/98, `tsc` clean, `next build` clean. Both fixes are **mutation-tested**: reverting `conductorOnEnd` fails 3 tests; restoring the 9.6s budget fails 1.

Phone smoke is **not** covered here — this environment has no mic and no Web Speech.

1. Dest Engineer, Talk: speak, **I'm done** → sends. Repeat five times; every one sends.
2. Same in Voice.
3. Hear a long reply read aloud, then speak again — capture is live.
4. "I'm done with the migration file" must **not** send.
