# SYSTEMS-CHANGE-PACKET-023 — Tape, card, dest job

**Number:** `023` — next systems packet is `024`. Never reuse a number.  
**Status:** **Planted** on this PR ([#123](https://github.com/bywale-com/travis/pull/123)). Engineer drafted. SA closed the cuts.  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-05  
**Envelope:** [`ENVELOPE-TRAVIS-TIGHTNESS.md`](./ENVELOPE-TRAVIS-TIGHTNESS.md)  
**Glass (look, do not mint from PNG):** [`PLATES-MOTION-LOG.md`](./PLATES-MOTION-LOG.md) M1–M5 · S3 In flight recut (V6 + heartbeat). Live visuals stay look-only.  
**Prior (do not remint):** 013 motion · 015 sit · 021 worker · 042 · 022 ports signed on [#120](https://github.com/bywale-com/travis/pull/120) — **plant 022 after this gate is on `main`, not in this packet**  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

---

## 1. Story (signed)

Children stay in **Cursor**. Protocol / management / supervisory tightness is **our runner**. Dest is not a mailbox keyed by the noun in the sentence.

021 + 022 without the gate do **not** finish it. More verbs + dest-as-mail is more of the comic fail (he mailed “new PM” to catalog `pm`).

**Must**

- After he accepts a pile, he speaks once and is free. The turn is not the work.
- A finished founder line can go into operation while they keep talking.
- Interrupt does not delete or pause the tape. He answers. The card stays.
- Travis speech and Travis labor never paint as `kind=user`.
- Dest vacant / unseated / “I don’t have that” is **nobody** — name the hole. Catalog fallback **dies**.
- 042 stands. Hands stay split. Computer use stays back.

**Must-not**

- A second Watch app. A Box screen. Labor read aloud. Puppet Cursor chat. Remint 021. Plant 022 in this cut. Mint a store from a plate. Invent triage. Unseat. DAG / canvas / PTY.

**Chain**

Thread truth → card on the Log (motion already) → motion is the nobody-queue → dest gate + `travis.dest_job` → (later) 022 on #120.

---

## 2. Stood up (quote, do not remint)

| Grain | Where |
|-------|--------|
| User vs him | `voice_turn.kind` — Log paints `kind=user` on the right. Live persist: `insertUserTurn` vs `absorbLiveTravisPost`. |
| Motion | `travis.motion` + `travis.motion_step` · already has `founding_turn_id` → `voice_turn` |
| Motion refuse | `send_to_seat`, `dispatch_to_seat`, `create_agent`, `sit_agent`, `unfold_repo`, `file_plan`, … |
| Seats live | `travis.seat_live_run` — one Cursor run per binding |
| Dest send | `send_to_seat` blocks. `dispatch_to_seat` returns. Catalog fallback still exists (comic fail). |
| 022 | Signed on #120. Not planted. Do not remint `travis.port`. |

---

## 3. Thread truth (priority 1)

No new table.

- Persist Travis Live / TTS / readback as `absorbLiveTravisPost` (`kind=agent_post`, `seatKey=travis`). **Never** `insertUserTurn`.
- STT that is his voice is not a user line. If the ear cannot tell, **drop it** — do not guess founder.
- Right side is `kind=user` only. `seatKey` on a user turn is dest, not who spoke.
- `search_room` / request scan stay `kind=user`. After this cut that set is founder-only.

---

## 4. The card (priority 2) — pick **B**

**No new `voice_turn.kind`. No third labor table.**

Hang on **`travis.motion.founding_turn_id`** = the Travis `agent_post` (“Let me get to that.”). Client + Here derive the card from that motion and its `motion_step` rows. Collapsed. Tap = tool, args, `result_text`. Not spoken.

**In-turn his-tools** that never called `file_plan` (a lone `write_os`, `prove_box`, …): harness **auto-files a one-step motion** on that founding turn so they hang on the same object. He does not block the mouth on two writes. `file_plan` still returns immediately; the runner walks pending steps.

Fail: step `failed`, motion `failed`, he may speak a sentence. Later steps on that motion do not start. Empty / zero motion: no card, no `N in motion`.

`unfold_repo` stays **off** the motion allowlist (021). If he calls it in-turn, it may auto-file as a one-step motion (card), but it is not a planned tape step.

Do not plant M1–M5 from the PNG. Talk Log only. No Box door.

---

## 5. Motion stays the nobody-queue (priority 3)

013 stands.

- Interrupt / barge does **not** wipe the row.
- `1 in motion` = open `waiting|running` motions. Opens Backlog In motion. Staple with the card title.
- Allowlist stays nobody-tools. `create_agent` / `sit_agent` stay refused as steps.

---

## 6. Dest gate + job (priority 4)

### Gate — no table. Code, not `TRAVIS_SYSTEM`.

Lives in `send_to_seat` / `dispatch_to_seat` (one helper, e.g. `src/lib/dest-gate.ts`).

| Class | Meaning | Move |
|-------|---------|------|
| **His** | A tool or port he has (box, house, sit, create, prove, unfold, a wired port). Prompt is create / sit / deprecate / rebind / prove / unfold / box / house / authorize. | **Refuse send.** He does it. |
| **Theirs** | Open member, **`protocol_path` nonempty**, that person. | Insert job, dispatch, return. |
| **Nobody** | Vacant role, empty `protocol_path`, catalog-only bind, Cursor `bc-` / deploy / 042, or a hole we have not ascribed (unseat). | Receipt names the hole. Offer Engineer. **No mail. No retry. No guess.** |

**Catalog fallback dies entirely** — not only on his/nobody. Role dest never wakes an unseated catalog slug. Spin fail = nobody receipt. 071 `idleCatalogRole` path is struck.

“New PM” is **his** (create + sit) or **nobody** (rebind a Cursor id). It is never “mail the current PM.”

### `send_to_seat` does not hold his mouth

Same leave as `dispatch_to_seat`: return a job/receipt. Seat works. He stays with the founder. Blocking send **dies**.

### Mint `travis.dest_job`

Story bears it: dest is a job he watches and takes back. Not a plate. Not a second host.

```sql
CREATE TABLE travis.dest_job (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES travis.voice_session(id),
  binding_id uuid NOT NULL REFERENCES travis.agent_binding(id),
  initiative_id uuid REFERENCES travis.initiative(id),
  user_turn_id uuid REFERENCES travis.voice_turn(id),
  parent_id uuid REFERENCES travis.dest_job(id),
  payload jsonb NOT NULL,
  idempotency_key text NOT NULL,
  timeout_ms int NOT NULL DEFAULT 120000,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_heartbeat_at timestamptz,
  CONSTRAINT dest_job_status_chk
    CHECK (status IN ('created', 'dispatched', 'in_progress', 'completed', 'failed', 'timed_out')),
  CONSTRAINT dest_job_idem_uniq UNIQUE (session_id, idempotency_key)
);
```

| Field | Law |
|-------|-----|
| `binding_id` | The **person**, not `seat_key`. Disposable seats. |
| `payload` | `{ "text": "…", "done": "…" }` — structured, not a raw blob. |
| `parent_id` | **Nullable.** Flat In flight this packet. Do not draw a DAG. |
| `last_heartbeat_at` | Dest watch reads **this row**. Null ping = quiet, not healthy. Stale if last ping >15s. |

`seat_live_run` stays the Cursor run. Heartbeat writer = seat-pipe / watch loop.

**Take-back:** on `completed` / `failed` / `timed_out`, Travis posts a short `agent_post` receipt and stays dest. He does not vanish into their chat. He does not start *his* work by mailing it.

**In flight (V6):** grow the existing door. Running / waiting from `dest_job`. Elapsed → heartbeat recency (`2s ago` muted; `stale` if >15s). No new plate. Seat card inside: the line we sent, live/stale, receipt. **Not** their tools, repo, diff, CI.

Ensure-once + founder ALTER.

---

## 7. 022

Stands on #120. Plant **after** §6 is on `main`. Gate ships **tools-only**; ports make “his” honest when the host lands. Do not fold 022 onto this PR. Do not remint `travis.port`.

---

## 8. Cuts (closed)

### 8.1 Mutate the tape — **named silence**

New founder line = new `file_plan` (or a new motion). **Pending** steps are not rewritten from chat this packet. **Running** finishes or fails — do not rewind. Done stays done. Do not mint `rewrite_plan`.

### 8.2 Create / sit on the queue — **keep 013**

`create_agent` / `sit_agent` stay refused as motion steps. “Say when you want the analyst” is a short turn (M5). Auto-sit catalog slugs stay forbidden.

### 8.3 Card/job liveness — **poll this packet**

Phone keeps 1–3s jitter poll. **SSE / LISTEN/NOTIFY is named silence** (later bus). Do not invent a second websocket product.

### Unseat — **named silence**

No write. “Deprecate the PM” with no unseat tool = **nobody**. Do not invent unseat. Cursor rebind stays nobody-here.

---

## 9. Must-not

- Computer use. MCP. Marketplace. Lifting 042.  
- Reminting 021 or `travis.port`.  
- Third orchestrator host / cron / Trigger.dev engine.  
- Growing I1. Dest as a new screen.  
- Labor as Voice effect. Demo rows.  
- DAG / canvas / PTY / box stream from [`ENGINEER-LIVE-VISUALS.md`](./ENGINEER-LIVE-VISUALS.md).

---

## 10. Engineer (paste)

On **this PR**, in this order:

1. Thread truth.  
2. Card hang **B** — motion under the Travis line. Auto one-step motion for in-turn nobody-work. Talk Log only.  
3. `file_plan` / in-turn nobody-work leave the mouth; card follows `motion_step`.  
4. Gate + `travis.dest_job` + In flight heartbeat. Catalog fallback struck. `send` does not hold him.  
5. Do **not** plant 022 here.

Do not send **That’s fine.**

---

## Verify

- A Live Travis line never appears as `kind=user`. `search_room` does not return his speech.  
- Two house writes: he says “Let me get to that,” returns, card shows step *n* of *m*, founder can send another line while step 2 runs.  
- Interrupt: new user bubble, Travis answers, motion still `running` or `waiting`.  
- Tap card: tool + args + `result_text`. Nothing read aloud from the card.  
- Unseated catalog dest: nobody receipt, no wake.  
- “New PM” / deprecate is his or nobody — never a send to `pm`.  
- In flight stale when `last_heartbeat_at` is old. Null ping is quiet.  
- 042 tests still pass. No box door. No new Watch tab.  
