# Hotfix 009 — STT carry, stale busy, quote rail, rebind PM

**Number:** `009` — next engineer hotfix is `010`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (lived smoke on travis-psi: Engineer-intended turn queued on PM; dead PM seed id; draft wipes on a 1s pause; agent post has no quote-back).  
**When:** 2026-08-27  
**PR title shape:** `Hotfix 009 — STT carry, per-seat busy, quote rail`

---

## Why (smoke)

Screenshot: `Room · via PM`, `QUEUED · PM`, footer `Run stream is no longer available`, user bubble `half`, queued line about speech dissipating.

1. **PM bind was frozen on a dead seed id.** PR 17 stopped env from *overwriting* a live bind — after the table already held the dead id — so Open session left the wrong PM in place.
2. **Stale `seat_live_run` on that PM row** made Travis think PM was busy. Queue is already per-seat; dest was PM, so the line queued instead of sending to Engineer.
3. **STT:** Web Speech `onend` after a short silence starts a new recognizer whose result list is empty, so `committedRef` is replaced with `""`. Leading `Engineer` dies; sticky addressee stays PM.
4. **Quote rail** is on the plates (`reference_turn_id`). We never wrote it on `agent_post`.

## Cut

1. Re-apply `bind-seats.sql` (and from migrate). Drop `SEED_CURSOR_AGENT_ID` as a PM alias so the dead seed cannot fill PM.
2. Before enqueue, `listRuns`: if that seat has no active Cursor run, clear `seat_live_run` and **send**. Dead stream / `Run stream is no longer available` also clears that seat’s live row.
3. Carry committed transcript across recognition restarts; only clear on send/queue or End session.
4. Set `agent_post.reference_turn_id` to the user turn that was sent.

## Must-not

- Do not mint a room-global queue.
- Do not change 002 leading call-by-name (name at the end still does not switch).
- Do not ship `bc-…` to the SPA.
- Do not append PM/SA logs.

## Verify

1. Live `agent_binding`: PM = Pm ID provision (`bc-1ac0762e…`), SA = Sa id details, Engineer = this Engineer chat. Applied against travis-psi Postgres on 2026-08-27 (stale PM `seat_live_run` dropped).
2. Speak `Engineer …`, pause 2s, continue, `I'm done` — full draft still there; send goes to Engineer.
3. While Engineer is running, `SA … I'm done` sends now (not queued on Eng).
4. Stuck/dead stream on PM does not queue a later Eng/SA turn.
5. Mode B agent bubble quotes the user line it answered (thin rail, not a card).

After deploy: **End session → Open session**. Do not rely on a refresh of an old room session — active addressee is PM at open.
