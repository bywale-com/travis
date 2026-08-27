# Hotfix 002 — Room smoke: stream/STT dedupe, call-by-name, plate look

**Number:** `002` — next engineer hotfix is `003`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (originated from lived smoke on `travis-psi.vercel.app` — not a PM packet, not an SA change packet).  
**When:** 2026-08-27  
**Pocket:** SCP-002 room already planted on `main`.  
**PR title shape:** `Hotfix 002 — room smoke: stream, routing, plate look`

---

## Why (smoke)

Founder opened the room, addressed Engineer, switched to log.

1. **Not the specced room.** Utterance started with “engineer …” but pills stayed `Room · via PM`. The **PM** Cursor agent answered *about* switching seats and pasted ids. Travis never routed. Parser required `Engineer —` punctuation; spoken “engineer can I see…” has none.
2. **Doubled text.** User bubble stuttered (`engineer engineer engineer can can I see…`). Assistant bubble character-doubled (`SwitchSwitchinging`, `bcbc--`, `httpshttps:////`). Cause: finalize concatenated both `post_delta` and `delta` for the same chunk; STT appended growing/duplicate finals on Android Web Speech.
3. **Look ≠ plates.** Log is a green chat thread. Locked B1/B2 plates are cream/orange room: overlapping thought circles with labels, agent avatars on the left, pale user bubbles on the right, **Back to voice** under the strip.

---

## Cut

1. Assemble stream with absorb (snapshots vs deltas). Persist **one** of `post_delta` / `delta`, not both.
2. Absorb STT finals; collapse consecutive word/phrase stutter before display and send.
3. Call-by-name: leading `{PM|SA|Engineer|Eng}` plus separator **or** whitespace. Bare call with no remainder switches addressee without a Cursor send.
4. Mode B chrome toward B1/B2: plate palette, labeled overlapping thought circles, left avatars, **Back to voice** under the strip. Mode A: larger orange presence orb; still no log bubbles.

## Must-not

- Do not mint tables or seed agent ids from the screenshot into source.
- Do not invent triage judgment.
- Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.
- Do not add hang-up / overflow menu from plate scenery.
- Do not hard-code demo turns.

## Verify

1. Speak `engineer can I see the log I'm done` → pills become `Room · via Eng`; run targets Engineer binding (stand-in if that row’s id is empty).
2. User turn text is not word-stuttered; assistant post is not character-doubled.
3. Mode A: orb + subtitle only. Mode B: avatars left, user right, thought circles, Back to voice under strip.
4. Dead-man still inserts `travis_prompt` (“Are you talking with me?”).

## Out of scope

- Binding picker / pasting Engineer `bc-…` into the table (operator row update).
- Color as a locked PM recut — this uses the **plate palette** until PM recuts.
- Automations chain, triage bar.
