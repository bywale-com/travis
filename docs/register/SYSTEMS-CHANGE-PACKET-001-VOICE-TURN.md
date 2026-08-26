# Systems change packet 001 — Voice session + hands-free turn-taking

**Number:** `001` — next systems packet is `002` (cloud agent list / bind / resume / real stream). Never reuse a number.  
**Seat:** Systems Analyst. Engineer cuts this; no leftover analysis.  
**When:** 2026-08-26  
**Glass (read-only):** [`PM-PACKET-001-VOICE-SESSION.md`](./PM-PACKET-001-VOICE-SESSION.md) · [`VOICE-SESSION-FACE.md`](./VOICE-SESSION-FACE.md) · plate under `plates/` · flag [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) 14:00  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

---

## Intent

Stand up the thinnest Travis machine that proves **hands-free turn-taking** on the smartphone voice session: one open → continuous listen → accumulate speech past a multi-minute cliff → founder speaks a **done phrase** → utterance finalizes → thread shows the user turn → pipe hands off to a **Cursor send port** that is a **stand-in by default** (real cloud `send` only when an `agent_binding` row holds a real `bc-…` id and the server has a key). Do not build agent list/picker, Automations chain, or triage judgment.

---

## Must / must-not

### Must

- Session after one open; listening default; tap-once **pauses listening** (not per-turn send).
- Quiet **End session** ends the session.
- STT path **accumulates** partial/final text for the open utterance; long speech must **not** wipe the turn (~4‑min Cursor mic cliff is the failure mode to beat).
- Turn boundary = **voice conductor phrase** (founder): variants of done-with-message — see seeded phrases. Matching is hands-free; no screen press required to send.
- On conductor match: strip the phrase from the committed user text (or store raw + cleaned — cleaned is what becomes the prompt); append a **user** turn; invoke **Cursor send port**.
- Thread pane reads **query results** for turns (no hard-coded demo rows in the SPA).
- `CURSOR_API_KEY` (and any STT/TTS secrets) **server-side only**.
- Cloud agents only (`bc-…`). Local Composer out of scope.

### Must-not

- Hard-code agent ids, phrases, or demo chat rows in client or server source.
- Require finger stop/send each turn (pause/end session may use tap when fingers are free).
- Freeze a silence-ms VAD number as product law (phrase is the v1 conductor; silence is not required).
- Mint UI from nested plate scenery; build agent picker; multi-seat auto-wake; triage compression; desktop Cursor puppet.
- Create a new Cursor agent per utterance.

---

## Stores / fields / contracts

**Layer:** Travis-local stores below are **to mint** (none existed). Cursor agent/run/stream remain **external contract**.

### Add — `agent_binding`

| Field | Type | Notes |
|-------|------|--------|
| `id` | uuid pk | |
| `label` | text | e.g. `PM` — seat chip glass; not a Cursor id |
| `cursor_agent_id` | text | `bc-…` cloud id; **data**, never source constant |
| `runtime` | text | v1: `cloud` only |
| `active` | bool | |
| `created_at` | timestamptz | |

**Seed (data, not code):** one row `label=PM`, `runtime=cloud`, `active=true`,  
`cursor_agent_id` = `bc-da5db04b-db60-414e-b0c3-c8ed337d45d4` (founder 2026-08-26, corrected — **seed/migration data only**, never a SPA/source constant).  

Empty/invalid id ⇒ Cursor port **must** use stand-in (do not invent an id). If resume/API returns not-found, ask founder to re-copy from `https://cursor.com/agents/bc-…` and update **this row** only.

### Add — `voice_session`

| Field | Type | Notes |
|-------|------|--------|
| `id` | uuid pk | |
| `binding_id` | uuid fk → `agent_binding` | current binding for this session |
| `status` | text | `listening` \| `paused` \| `ending` \| `ended` (Engineer may add `speaking` when TTS live) |
| `created_at` | timestamptz | |
| `ended_at` | timestamptz nullable | |

Open session: create row; default binding = the active PM binding row. Status `listening`.

### Add — `voice_turn`

| Field | Type | Notes |
|-------|------|--------|
| `id` | uuid pk | |
| `session_id` | uuid fk → `voice_session` | |
| `seq` | int | order in thread |
| `role` | text | `user` \| `assistant` \| `status` |
| `text` | text | cleaned user text / assistant text / short status |
| `created_at` | timestamptz | |

Artifacts: **named silence in 001** (columns later in 002 when stream/artifacts are real). Do not fake plate URLs in the SPA.

### Add — `turn_conductor_phrase`

| Field | Type | Notes |
|-------|------|--------|
| `id` | uuid pk | |
| `phrase` | text | matched case-insensitive; trim; ignore trailing `.?!` |
| `active` | bool | |

**Seed phrases (founder wording family):**

- `I'm done with this message`
- `I'm done with this`
- `I'm done`

Match when the phrase appears as the **end** of the current accumulated utterance (allow trailing whitespace/punctuation). Prefer longer match first. Phrase text is **not** part of the prompt sent to Cursor.

### Refuse

- Hard-coded in-app message lists, agent id constants, phrase constants in source (read phrases from `turn_conductor_phrase`).
- Local-runtime binding rows in v1.

### External contract (Cursor) — consume only when binding has `bc-…`

- Resume / follow-up run: SDK `Agent.resume` + `send`, or `POST /v1/agents/{id}/runs`.
- Do **not** `Agent.create` per turn.

---

## Runtime behavior

```text
one open → voice_session(listening) + bind active PM agent_binding
  → STT partials accumulate in memory (open utterance; not yet a turn row)
  → conductor phrase matched
       → write voice_turn(user, cleaned text)
       → clear open utterance buffer
       → Cursor send port(binding.cursor_agent_id, cleaned text)
            → if no cursor_agent_id OR no server key: stand-in assistant/status turn
            → else: resume agent, create run, (minimal) wait or stream → write assistant turn
  → pause control → status paused (STT stop); resume → listening
  → end session → status ended
```

Faceless: conductor match is a **trigger**, not a glass button.  
Glass: pause, end session, thread pane, presence states per PM packet Completes (`paused`, speaking/readback when TTS exists).

**Speech-end law for Engineer:** implement phrase conductor as above. Do not substitute silence-only VAD as the v1 send rule. Optional defensive long-silence UI hint is fine; it must **not** auto-send without phrase unless founder later changes Story.

---

## Ports

| Port | 001 requirement |
|------|-----------------|
| STT | **Real** — browser and/or server streaming; must accumulate; must survive long utterances |
| Conductor matcher | **Real** — reads `turn_conductor_phrase` |
| Cursor cloud send | **Stand-in default**; **real** only if `agent_binding.cursor_agent_id` is a non-empty `bc-…` **and** server key present |
| TTS / readback | **Stand-in OK** (thread text + optional play stub); real TTS may land here if cheap, not blocking |
| Auth (phone user) | **Named silence** — single-operator v1; no productized login required beyond holding secrets server-side |

---

## Verify

1. Open session → presence listening; thread empty from DB (no fake rows).  
2. Speak a long utterance (> think past 4 minutes if feasible, or chunked simulate) → buffer not wiped.  
3. Say **I'm done with this message** (no tap) → user turn appears **without** the phrase; stand-in (or real) reply path runs.  
4. Tap pause → listening stops; resume → listening.  
5. End session → session ended; no further send.  
6. Confirm SPA source contains **no** `bc-` literals and **no** hard-coded demo turns; phrases come from DB seed.  
7. If a real `bc-…` was seeded into `agent_binding` and key is set: one follow-up run appears on that cloud agent (optional smoke).

---

## Out of scope

- SCP-002: list cloud agents, bind/switch bindings in UI, full SSE hygiene, artifacts nest, create-agent control.  
- PM→SA→Engineer Automations chain.  
- Local Composer.  
- Triage judgment / compression.  
- Hardware conductor (headset button).  
- Confirm-beat (“send?”) and silence-only auto-send.

---

## Founder locks folded in

- Cloud agents, not local Composer, for v1.  
- Resume existing agents — not create-each-time (real path when binding seeded).  
- Conductor = done-phrase family; fingers not required per turn.  
- Two systems packets; this is the turn-taking cut.  
- **No hard-coded data** — agent id and phrases live in tables; seed is data.
