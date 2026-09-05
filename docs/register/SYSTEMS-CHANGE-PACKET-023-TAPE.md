# SYSTEMS-CHANGE-PACKET-023 — Tape, card, dest job

**Number:** `023` — next systems packet is `024`. Never reuse a number.  
**Status:** **Draft.** Engineer wrote this for SA to sign. **Not signed. Not planted.**  
**Seat:** Engineer drafted. Systems Analyst signs Story, ascribes stores, closes the cuts, then Engineer only cuts.  
**When:** 2026-09-05  
**PR:** [#123](https://github.com/bywale-com/travis/pull/123) — same initiative as the tightness envelope. Do not open a second PR.  
**Envelope:** [`ENVELOPE-TRAVIS-TIGHTNESS.md`](./ENVELOPE-TRAVIS-TIGHTNESS.md)  
**Glass (look, do not mint from PNG):** [`PLATES-MOTION-LOG.md`](./PLATES-MOTION-LOG.md) M1–M5 · S3 In flight recut (V6 + heartbeat)  
**Prior (do not remint):** 013 motion · 015 sit · 021 worker · 042 · 022 ports signed on [#120](https://github.com/bywale-com/travis/pull/120) — **plant 022 after this gate, not in this packet**  
**Trail:** Engineer git + this PR. Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG from Engineer.

---

## Intent

Travis is not the bottleneck. The founder talks. Labor leaves his mouth.

One **hidden card** on the Log is every Travis action — house write, `search_room`, box prove, unfold, a filed plan. Same object. Not a Box door. Not In flight.

**In flight** is seats (Roster is people; Backlog In motion is the tape’s index). Dest is a **job** he can watch and take back, not a blocking turn and not catalog mail.

Voice echo must not put his words on the founder’s side. Right = founder only.

---

## 1. Story (for SA to sign or rewrite)

**Must**

- After he accepts a pile, he speaks once and is free. The turn is not the work.
- A finished founder line can go into operation while they keep talking.
- Interrupt does not delete or pause the tape. He answers. The card stays.
- Travis speech and Travis labor never paint as `kind=user`.
- Dest vacant / unseated / “I don’t have that” is **nobody** — name the hole. Catalog fallback **dies**.
- 042 stands. Hands stay split. Computer use stays back.

**Must-not**

- A second Watch app. A Box screen. Labor read aloud. Puppet Cursor chat. Remint 021. Plant 022 in this cut.
- Mint a store from a plate. Invent triage.

**Chain**

Thread truth → card on the Log → motion is the nobody-queue → dest gate + job → (later) 022.

**Silence (SA must promote or name)**

1. Mutate remaining steps from a new line (append / drop / rewrite **pending**).  
2. `create_agent` / `sit_agent` on the queue, or keep 013 refuse (short turn).  
3. Push bus vs today’s poll for card/job paint.

---

## 2. Stood up (quote, do not remint)

| Grain | Where |
|-------|--------|
| User vs him | `voice_turn.kind` — Log paints `kind=user` on the right (`Room.tsx`). Live persist: `insertUserTurn` vs `absorbLiveTravisPost` (`live/transcript`). |
| Request scan | `REQUEST_SCAN = 200`, `kind=user` only, filter in memory (`src/server/room-read.ts`) |
| Motion | `travis.motion` + `travis.motion_step` · `file_plan` · `runMotionRunner` · allowlist in `src/lib/motion.ts` |
| Motion refuse | `send_to_seat`, `dispatch_to_seat`, `create_agent`, `sit_agent`, `unfold_repo`, `file_plan`, … |
| Seats live | `travis.seat_live_run` — one Cursor run per binding |
| In flight door | Queue chip → `InFlightDoor` (V6). Roster is the room pill / thought miss. `N in motion` → Backlog In motion. |
| Dest send | `send_to_seat` blocks. `dispatch_to_seat` returns. Catalog fallback still exists (comic fail). |
| Box | HTTP one-shot + `prove_box` loop. No stdout stream to the phone. |
| Phone liveness | Poll in `Room.tsx`. No SSE for jobs/cards. |
| Job table | **Ascribed in the dest plan, not planted.** |

---

## 3. Thread truth (priority 1)

No new table.

- Persist Travis Live / TTS / readback as `absorbLiveTravisPost` (or equivalent `kind=agent_post`, `seatKey=travis`). **Never** `insertUserTurn`.
- STT that is his voice is not a user line. If the ear cannot tell, drop it — do not guess founder.
- `seatKey` on a user turn is dest, not the column. Right side is `kind=user` only.
- `search_room` / motion title clip keep reading `kind=user`. After this cut that set is founder-only.

---

## 4. The card (priority 2)

**Glass:** M1–M5. Talk Log. You → “Let me get to that.” → card **under** that line. Collapsed. Tap = real tool, real args, real `result_text`. Not spoken.

**One object.** `write_os`, `search_room` (scan + rows, not the spoken sentence), `run_box` / `write_box` / `prove_box` / `unfold_repo`, and every `motion_step`. Box is an inside, not a surface.

**Hang (SA picks one — Engineer does not mint):**

| Pick | Meaning |
|------|---------|
| **A** | New `voice_turn.kind` (SA names it) on the founding turn, FK `motion_id` and/or a tool receipt. |
| **B** | No new kind. Client + Here derive the card from `motion` / `motion_step` keyed by `founding_turn_id`. In-turn tools that never filed a plan still need a hang — SA says how (auto-`file_plan`, or a receipt row). |

Do **not** mint a third labor table unless A and B cannot bear Story.

**Runtime**

- `file_plan` returns to the model immediately. Runner walks pending steps. Card reflects `motion_step` status.
- In-turn tools that are his nobody-work **should leave the mouth** the same way (file or equivalent). He does not block the turn on two writes.
- Fail: step `failed`, motion `failed`, he may speak a sentence. Later steps on that motion do not start.
- Empty / zero motion: no card, no `N in motion`.

---

## 5. Motion stays the nobody-queue (priority 3)

013 stands except where SA lifts a silence in §8.

- Interrupt / barge does **not** wipe the row. Already 013.
- `1 in motion` = open `waiting|running` motions. Opens Backlog In motion. Staple with the card title.
- Allowlist stays nobody-tools until §8.2 says otherwise. `unfold_repo` stays off the tape unless SA adds it (021 left it off; it is his, but fat).

---

## 6. Dest gate + job (priority 4)

**Gate** — no table. Lives in `send_to_seat` / `dispatch_to_seat`, not `TRAVIS_SYSTEM`.

| Class | Meaning |
|-------|---------|
| **His** | He does it (tools he has; ports when 022 plants). |
| **Theirs** | A seated person. Vacant / empty `protocol_path` → **nobody** before any send. |
| **Nobody** | Name the hole. Offer Engineer. No retry, no guess, no mail-the-noun. |

Catalog role dest **must not** wake an unseated catalog bind.

**`send_to_seat` must not hold his mouth.** Same leave-as-`dispatch`: return a job/receipt, seat works, he stays. (If SA keeps a blocking send, name it — founder said he cannot be the bottleneck.)

**Job row** — SA ascribes SQL. Shape already named (Day 1, Postgres, no new host):

| Field | Notes |
|-------|--------|
| `job_id` | uuid PK |
| `assigned_seat` | binding or seat key — SA picks the FK |
| `payload` | structured, not a raw blob |
| `idempotency_key` | |
| `timeout_ms` | |
| `status` | `created` \| `dispatched` \| `in_progress` \| `completed` \| `failed` \| `timed_out` |
| `created_at` | |
| `last_heartbeat_at` | dest watch / take-back reads **this row**, not the seat’s chat |
| `parent_id` | **nullable.** Only if SA wants a graph later. Not required for In flight. |

**In flight (V6 chrome).** Running / waiting. Elapsed → heartbeat recency: `2s ago` muted; `stale` (danger) if last ping >15s. Outlined rings + live `(` as S3. No Close if SA follows the recut (handle dismisses). Task line is plain language, not jargon.

Seat card **inside** (when they tap a running row, or the Log card for a send): the line we sent, live/stale, receipt. **Not** their tools, repo, diff, CI.

`seat_live_run` stays the Cursor run. Heartbeat writer = watch loop / seat-pipe. Null ping → quiet, not “healthy.”

---

## 7. 022

Not this packet. Signed on #120. Plant **after** §6 is on `main`.

---

## 8. Cuts SA must close (or name a silence)

### 8.1 Mutate the tape

Founder test: as they talk, remaining work reshapes.

- **Pending** steps: append, drop, rewrite args.  
- **Running:** finish or fail — do not rewind.  
- Done stays done.

Either mint a verb (SA names it, allowlist, who may call it) **or** name silence (new line = new `file_plan` only). Do not leave “reorganize” as vibe.

### 8.2 Create / sit on the queue

013 refused `create_agent` / `sit_agent` as steps. Feasible either way.

| Pick | Meaning |
|------|---------|
| **Keep 013** | BA is a short turn after “Say when you want the analyst.” (M5) |
| **Lift** | They may be pending steps (or jobs). Three moments still exist; they are not glued to his mouth. |

Auto-sit catalog `pm` / `sa` / `engineer` stays forbidden.

### 8.3 Card/job liveness

Poll may tell the truth first (1–3s jitter). SSE/NOTIFY is a later bus — ascribe or silence. Do not invent a second websocket product.

---

## 9. Must-not (this packet)

- Computer use. MCP. Marketplace. Lifting 042.  
- Reminting 021 or `travis.port`.  
- Third orchestrator host / cron / Trigger.dev **engine**. Shape of assign-watch-take-back only.  
- Growing I1. Dest as a new screen.  
- Labor as Voice effect.  
- Demo rows.

---

## 10. Engineer (after SA signs — not before)

On **this PR**, in the Story order:

1. Thread truth.  
2. Card hang as ascribed. Talk Log only.  
3. `file_plan` / in-turn nobody-work leave the mouth; card follows `motion_step`.  
4. Gate + job + In flight heartbeat. `send` does not hold him unless SA kept a blocking send.  
5. Do not plant 022 here.

Do not send **That’s fine.**

---

## Verify

- A Live Travis line never appears as `kind=user`. `search_room` does not return his speech.  
- Two house writes: he says “Let me get to that,” returns, card shows step *n* of *m*, founder can send another line while step 2 runs.  
- Interrupt: new user bubble, Travis answers, motion still `running` or `waiting`.  
- Tap card: tool + args + `result_text`. Nothing read aloud from the card.  
- Unseated catalog dest: nobody receipt, no wake.  
- In flight stale when `last_heartbeat_at` is old. Null ping is quiet.  
- 042 tests still pass. No box door. No new Watch tab.

---

## SA sign-off

Sign Story §1. Pick card hang §4 A or B. Close §8.1–8.3 (verb/silence, create/sit, poll/push). Ascribe job SQL (FKs). Then Engineer plants. If Story cannot bear a field, name the silence — do not leave analysis in the plant.
