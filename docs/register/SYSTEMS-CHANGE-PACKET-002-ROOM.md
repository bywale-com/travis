# Systems change packet 002 — Room (two modes, Travis-only voice)

**Number:** `002` — next systems packet is `003`. Never reuse a number.  
**Seat:** Systems Analyst. Engineer cuts this; no leftover analysis.  
**When:** 2026-08-27  
**Glass (read-only):** [`PM-PACKET-002-ROOM.md`](./PM-PACKET-002-ROOM.md) on living PR [#4](https://github.com/bywale-com/travis/pull/4) · [`ROOM-FACE.md`](./ROOM-FACE.md) + plates A1–A2 · B1–B2 on `main`.  
**Builds on:** SCP-001 plant on `main` · Hotfix 001 merged or merging in parallel (stream path required before room smoke).  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

---

## Intent

Extend the SCP-001 voice pipe into a **room**: one session, two views (voice / log), three seats (PM · SA · Engineer), **Travis as the only voice**. User utterances still use the 001 conductor; Cursor runs target the **active seat binding**. Agent output splits **thought** (visible in log mode, never spoken) vs **post** (log row, Travis-readable in Mode A). Addressing router handles default PM, call-by-name, dead-man, and clarification — as machine state, not UI copy alone.

---

## Must / must-not

### Must

- **One session** across Mode A ↔ B switch; `view_mode` on session row.
- Mode A: orb + tiny subtitle only — **no** message log on glass.
- Mode B: full timestamp-ordered log; user right / agent left is **presentation** over one ordered store.
- **Thought ≠ post:** stream/update `agent_thought` rows; **promote** to `agent_post` when the run commits speakable content.
- **Travis reads** `agent_post` only in Mode A, with seat attribution (e.g. “Engineer says…”).
- **Agents never TTS to user** — only Travis facilitator voice.
- Extend **`agent_binding`** to three seats (data rows, not source constants).
- Route conductor-finalized user text to **`active_binding_id`** Cursor agent (`resume` + `send` — same port as 001).
- Hygiene: do not speak `agent_thought`, thinking, or tool spam.
- Thread/log reads **query results** — no hard-coded demo rows.
- Shared header: Travis logo + **End session top-right** (not bottom bar).
- `CURSOR_API_KEY` server-side only.

### Must-not

- Mint tables from PNG example copy.
- Show full log on Mode A.
- Agents speak directly to user.
- Always-open thought text strip (default = compact circles only).
- External agents.
- Triage / compression bar.
- Desktop Cursor puppet.
- `Agent.create` per utterance.
- Hard-code seat labels, agent ids, or phrases in SPA/source (seats and phrases remain table/seed data).
- Engineer plant before this packet.

---

## Fit vs SCP-001 (what 001 already houses)

| 001 (materialized on `main`) | 002 adds |
|------------------------------|----------|
| `voice_session` + `binding_id` | `view_mode`, `default_binding_id`, `active_binding_id`, `router_state` |
| Single PM `agent_binding` row | Three seat rows (PM · SA · Engineer) |
| `voice_turn` user / assistant / status | `kind` grain: user · agent_thought · agent_post · status · travis_prompt; seat + reference |
| Phrase conductor | Unchanged — still ends user turn |
| Cursor resume/send | Routes by **active** binding, not only PM |
| Single-thread UI | Mode A/B chrome + log/thought presentation |
| — | Addressee router + facilitator read queue |
| — | Thought stream + promotion |

**001 `voice_turn` rows remain valid** for legacy/simple path; new room sessions write the enriched grain. Engineer may unify UI on room query only.

---

## Stores / fields / contracts

### Change — `agent_binding` (extend)

| Field | Change | Notes |
|-------|--------|-------|
| `seat_key` | **add** text unique | `pm` \| `sa` \| `engineer` — router key, not display copy |
| (existing) | keep | `label`, `cursor_agent_id`, `runtime`, `active` |

**Seed (data):**

| seat_key | label | cursor_agent_id |
|----------|-------|-----------------|
| `pm` | PM | `bc-da5db04b-db60-414e-b0c3-c8ed337d5d4` (founder seed) |
| `sa` | SA | empty until operator seeds row |
| `engineer` | Engineer | empty until operator seeds row |

Empty id ⇒ that seat’s runs use stand-in until row updated — same law as 001.

### Change — `voice_session` (extend)

| Field | Change | Notes |
|-------|--------|-------|
| `default_binding_id` | **add** fk → `agent_binding` | open session: PM binding |
| `active_binding_id` | **add** fk → `agent_binding` | current addressee for sends |
| `view_mode` | **add** text | `voice` \| `log` — default `voice` |
| `router_state` | **add** text | `normal` \| `awaiting_dead_man` \| `awaiting_clarification` |
| `binding_id` | **migrate** | backfill `active_binding_id` + `default_binding_id`, then drop or alias in code |

Open session: `status=listening`, `view_mode=voice`, `router_state=normal`, active=default=PM binding.

### Change — `voice_turn` (extend)

| Field | Change | Notes |
|-------|--------|-------|
| `kind` | **add** text | `user` \| `agent_thought` \| `agent_post` \| `status` \| `travis_prompt` |
| `seat_key` | **add** text nullable | `pm` \| `sa` \| `engineer` for agent rows |
| `reference_turn_id` | **add** uuid nullable fk → `voice_turn` | quote rail target |
| `speakable` | **add** bool | default true; **false** for `agent_thought` |
| `thought_status` | **add** text nullable | `streaming` \| `collapsed` \| `promoted` — for thought rows only |

**Log query:** one session, order by `seq` (or `created_at`). Presentation maps `user` → right; agent kinds → left.

### Refuse (002)

- Separate `room_post` / `room_thought` tables unless migration pain forces — **extend `voice_turn`** first.
- Cloud agent list/picker UI (named silence — seed rows + SQL update only in v1).
- Ambient agents posting without a run.
- Exact dead-man timeout ms in Story (Engineer grain).

### External contract (Cursor)

- Unchanged: `Agent.resume(binding.cursor_agent_id)` + `send` + stream.
- Stream mapping: thinking/tool events → update `agent_thought`; assistant text commit → `agent_post` (promote or insert).
- Hotfix 001 stream assembly is the write path — do not revert to `result.result`-only.

---

## Runtime behavior

### A. Mode flag

```text
PATCH session.view_mode: voice ↔ log
  → same session id, turns, bindings, router_state preserved
  → Mode A: facilitator read queue may continue
  → Mode B: UI queries full log + active thought rows per seat
```

### B. Addressee router

```text
States:
  normal
  awaiting_dead_man   — after faceless silence threshold (Engineer sets timing)
  awaiting_clarification — after ambiguous route

Events:
  session_open     → active = default = PM
  call_by_name     → parse seat from utterance prefix (v1 must below) → active = that binding
  conductor_send   → prompt goes to active binding’s Cursor agent
  dead_man_fired   → insert travis_prompt (“Are you talking with me?”) → awaiting_dead_man
  user_no          → active = default (PM) → normal
  user_no_x        → parse X → active = X → normal
  ambiguous_route  → travis_prompt (“Who was that meant for?”) → awaiting_clarification
  clarify_x        → active = X → normal
```

**v1 call-by-name must (Engineer implements, SA names):** utterance starts with `{PM|SA|Engineer|Eng}` + separator (`—`, `-`, `,`, or `:`) → switch `active_binding_id` before conductor strip/send. Display pills from `active_binding.label`.

**Dead-man:** faceless trigger in `normal` when listening and silence threshold met — **Engineer grain** for duration; must insert `travis_prompt` row, not spoken agent voice.

### C. Thought vs post

```text
Cursor stream:
  thinking / tool  → upsert agent_thought (speakable=false, thought_status=streaming)
  assistant text   → on run terminal: promote to agent_post (speakable=true)
                     OR insert agent_post if no thought row; mark thought promoted

Mode B:
  compact circles = active agent_thought rows per seat (streaming)
  tap circle → expand that thought’s text (B2)
Mode A:
  never show thoughts on glass; never TTS thoughts
```

### D. Facilitator read (Mode A)

```text
On agent_post committed:
  if view_mode=voice and session not paused:
    queue TTS: "{Label} says…" + post text (truncate subtitle for glance line)
    hygiene: skip if kind ≠ agent_post
After read: optional status turn or subtitle clear — no agent voice
```

User `user` turns: show in subtitle or brief ack only — **no** full log on Mode A.

### E. Conductor + send (inherits 001)

Unchanged phrase family from `turn_conductor_phrase`. On match: strip phrase → `user` turn → send to **active** binding.

---

## Ports

| Port | 002 requirement |
|------|-----------------|
| STT + conductor | **Real** (001) |
| Cursor stream | **Real** (Hotfix 001 path) |
| TTS facilitator | **Real** for Mode A read; optional off in Mode B |
| Seat router / parser | **Real** — prefix call-by-name + dead-man/clarify parsers |
| Cloud agent list UI | **Named silence** — seed/update `agent_binding` rows |
| Auth | **Named silence** (001) |

---

## Verify

1. Open session → Mode A, pills show PM · listening; **no** log bubbles.  
2. **View log** → Mode B, same session id; log empty from DB.  
3. Speak → done phrase → `user` turn; Cursor run on **PM** binding → thought circles animate in B; **post** appears in log; **no** thought spoken in A.  
4. **Engineer —** … → done phrase → run targets Engineer binding; Travis reads “Engineer says…” in A.  
5. Mode A throughout: never agent voice without Travis attribution.  
6. Reference reply: post with `reference_turn_id` renders quote rail in B.  
7. Dead-man + clarification prompts appear as `travis_prompt` rows (when Engineer wires threshold).  
8. **Back to voice** preserves session.  
9. No hard-coded seats/agent ids in source.

---

## Out of scope

- SCP-003 (if needed later): cloud agent inventory UI, Automations chain, triage bar, external agents, local Composer, binding admin screen.
- Color system final (use plate palette).
- Play button law in log mode (optional per PM Completes).

---

## Engineer handoff note

Read **PM-PACKET-002** on PR #4 + this packet. Merge **Hotfix 001** first if not on `main`. Replace or extend `VoiceSession` UI — room is a new surface boundary, not a tweak. Do not append PM/SA logs.
