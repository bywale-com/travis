# Systems change packet 004 — Log Talk/Type + composer send

**Number:** `004` — next systems packet is `005`. Never reuse a number.  
**Seat:** Systems Analyst. Engineer cuts this; no leftover analysis.  
**When:** 2026-08-27  
**Glass (read-only):** [`PM-PACKET-004-LOG-COMPOSER.md`](./PM-PACKET-004-LOG-COMPOSER.md) on living PR [#15](https://github.com/bywale-com/travis/pull/15) · [`LOG-COMPOSER-FACE.md`](./LOG-COMPOSER-FACE.md) · photo D3 `plates/travis-d3-log-type-toggle.png`. Fetch: `git fetch origin pull/15/head`.  
**Builds on:** SCP-002 room · SCP-003 `sendOrEnqueue` / `queued_utterance` / `seat_live_run` on `main` · Hotfix 010 vocative route.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

**Look:** match planted log (003 / C). Not this packet. Do not recut C3/C4.

---

## Intent

Log mode (Mode B only) gets a two-state **Talk | Type** switch. Talk = today’s log: listen + done-phrase, no box. Type = a chat field: type or mic-into-the-box, hit send, optional `@` to pick PM / SA / Engineer by title. Send uses the **same pipe as voice** (`sendOrEnqueue`): user turn or per-seat queue if that seat is busy. Voice mode (Mode A) does not get this control.

---

## Must / must-not

### Must

- Field on the session: `log_submode` = `talk` | `type`.
- Toggle only when `view_mode=log`. Mode A: no toggle, no field.
- **Talk:** hide composer; keep existing log listen + done-phrase + 002/010 router.
- **Type:** show composer; **stop** room-level done-phrase listen so the field and the orb path don’t both fire. Send button (or keyboard send) commits the field. No “I’m done” required.
- `@` list = `agent_binding` rows already in the room (titles PM · SA · Engineer). Not Cursor’s agent directory. Pick → chip in the field → keep typing. Send with a chip: switch `active_binding_id` to that seat, strip the chip from stored text, then `sendOrEnqueue`. Send with no chip: current via-pill (sticky active). Then 010 parse on the remaining text if there is still a spoken-style name and no chip.
- Composer mic: same STT port as today, **writes into the field only**. Not Mode A orb. Tap mic in the box; it does not send by itself.
- Queue/barge (003) applies to Type sends. Busy seat → `queued_utterance`, not an error bubble.
- One session. Toggle does not start a new session or wipe the log.
- Empty `@` cancel and backspace-the-chip are client controls. No extra table.

### Must-not

- Composer or Talk/Type on Mode A.
- Attach / paperclip.
- Mint a mentions table, draft table, or theme table.
- Put composer text into `voice_turn` before send.
- Treat D3 k8s copy, checkmarks, bezel, or people-photos as product.
- Recut C3/C4.
- Plant D1 as a second screen.
- Require done-phrase on Type send.
- Third toggle title.

---

## Fit vs stood-up (`main`)

| Paste | Fit |
|-------|-----|
| A. Talk \| Type session state | **Missing.** Only `view_mode` voice\|log. **Add `log_submode`.** |
| B. Type send vs conductor | Conductor + `sendOrEnqueue` **materialized**. Type send = new trigger into that same function. |
| C. `@` list | Seats **materialized** in `agent_binding`. List is a query. Chip is composer UI state until send. |
| D. Composer mic | Web Speech **materialized** for room listen. Reuse into the field. Type turns room listen **off**. |
| E. Talk | **Housed** if Type is off: today’s log path. |
| F. Queue | **Housed** (`queued_utterance`, barge). Type send must call `sendOrEnqueue`, not a new Cursor path. |

---

## Stores / fields / contracts

### Change — `voice_session`

| Field | Change | Notes |
|-------|--------|-------|
| `log_submode` | **add** text | `talk` \| `type`. Default **`talk`**. |

Open session: `log_submode=talk`. First **View log** this session = Talk (no composer). After the user picks Type, **remember it on this session** so Voice → Log comes back still Type. New session resets to Talk.

PATCH already exists for `viewMode` / `status` — extend it with `logSubmode`.

Titles **Talk** and **Type** are the closed pair (hard-gate). Do not mint a labels table.

### Reuse — no new tables

| Existing | Use |
|----------|-----|
| `agent_binding` | `@` list: `seat_key` + `label` only. Never `cursor_agent_id` in the client. |
| `sendOrEnqueue` (`src/server/seat-pipe.ts`) | Type send after dest is set. |
| `queued_utterance` / `seat_live_run` | Unchanged 003 law. |
| `parseCallByName` (Hotfix 010) | If no `@` chip, run on the field text so “hey engineer …” still switches. If chip present, dest = chip; do not also parse a second seat out of the body unless you strip the chip first and then parse — **lock: chip wins; skip parseCallByName when a chip is set.** |

### Refuse (004)

- `composer_draft` table.
- `@mention` / `address_chip` table.
- New Cursor send port.
- `voice_turn.kind = composer`.

### External

Unchanged Cursor `resume` + `send` + 003 cancel. Typed send is still one run on the dest `bc-…`.

---

## Runtime

```text
view_mode=voice
  → no Talk/Type, no composer
  → 001/002 listen + done-phrase (unchanged)

view_mode=log AND log_submode=talk
  → no composer
  → log listen + done-phrase + router (unchanged, including 010)
  → dead-man stays skipped in log (already skipped on main)

view_mode=log AND log_submode=type
  → halt room STT / conductor
  → composer: text, mic→field, @ list, send
  → Send:
       if @ chip: set active_binding to that seat, text = field without chip
       else: parseCallByName(field); maybe set active; text = remainder or full
       if text empty and only a chip/name: switch seat, do not send (same as bare call-by-name)
       else sendOrEnqueue(session, dest, text)
  → clear field + chip after successful accept (send or enqueue)
```

Mic in Type: start/stop Web Speech into the composer string. Conductor phrases in that string are **literal text**, not a send trigger. Send icon is the conductor for Type.

`@` popover: GET bindings (id, seat_key, label) from server query of `agent_binding` where `active`. Three rows. Pick sets chip; list closes. Completes: dismiss with no pick; backspace removes chip.

Mode A TTS / thought strip / queue chrome: unchanged.

---

## Ports

| Port | 004 |
|------|-----|
| Type send | **Real** — `sendOrEnqueue` |
| `@` list | **Real** — `agent_binding` query |
| Composer STT | **Real** — same browser speech engine, different target (the field) |
| Room STT in Type | **Off** |
| Attach | **Named silence** (must-not) |
| Queue/barge | **Real** (003) |

---

## Verify

1. Voice mode: no Talk/Type, no box.  
2. View log: Talk, no box, speak + I’m done still posts.  
3. Tap Type: box, mic, send, `@` appear. Room done-phrase does **not** send.  
4. Type “look at the log” + send, no `@`: goes to current via-pill.  
5. `@` Engineer, type rest, send: pills via Eng; run/queue on Engineer.  
6. `@` then backspace chip, send: current via-pill.  
7. Type send while Eng is busy: dashed queue row, no SDK error bubble.  
8. Talk: box gone; listen works again.  
9. Type → View voice → View log: still Type. End session → Open: Talk again.  
10. No attach. No composer on Mode A. SPA has no `bc-…`.

---

## Out of scope

- C3/C4 recut. D1 plant. Mode A typing. New seats. Triage. Changing 003 barge law.

---

## Engineer handoff

Read PM-PACKET-004 on PR #15 + this packet. Reuse `sendOrEnqueue`. Add `log_submode`. Do not mint extra tables. Do not append PM/SA logs.
