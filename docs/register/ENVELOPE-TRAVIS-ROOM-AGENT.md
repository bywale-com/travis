# Envelope — Travis as a room agent (Engineer → SA)

**Kind:** Envelope. **Not a packet. Not a hotfix. Not plant law.**  
**Seat:** Engineer wrote this so Systems Analyst can ascribe the machine and cut a change packet. Engineer does **not** plant from this file. Do **not** append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.  
**When:** 2026-08-29. Founder ↔ Engineer: Travis is a harness; Travis is its own agent; the room rules still apply; Voice still voices whoever has the floor.  
**Why it exists:** Founder asked for an Engineer wrap of everything this pass would try to make happen, in enough detail that SA can run Story / Requirements / stores / ports / change-management and pass a **legible packet** back.  
**Related (read, not plant):** PM envelope [`ENVELOPE-LIVE-IN-TRAVIS.md`](./ENVELOPE-LIVE-IN-TRAVIS.md) on [PR #27](https://github.com/bywale-com/travis/pull/27) — rooms as primitive, talk-to-Travis / sub-agents / tell-Travis-to-talk-to-an-agent. This file is the **this-pass** machine wrap, not that whole vision.

**Flag (unchanged):** Phase One 14:00 UTC 2026-08-25. Do not overwrite.

---

## What this pass makes possible (UX — exact)

If SA ascribes and Engineer later cuts the packet, **this pass** is the following lived loop on the phone. Nothing else.

### You can address Travis like anyone else in the room

- Voice / Talk: `hey Travis`, `okay Travis`, `hi Travis`, trailing `… Travis`, same vocative grain as Hotfix 010 (`hey engineer`).
- Type: `@` chip for Travis, same as PM / SA / Eng. Multi-`@` can include Travis plus a seat.
- Header / via-pill becomes **Room · via Travis** (same chrome, fourth addressee).
- Sticky addressee: after you call Travis, the next done-phrase / Send stays on Travis until you call someone else.
- You can leave: `hey engineer` / `@ Engineer` — existing Cursor pipe, unchanged.

### You can talk *to* Travis (he has a brain)

When Travis is the addressee:

- You are in a **low-latency spoken conversation** with Travis. Not Web Speech → wait for “I’m done” → Cursor run → `speechSynthesis`.
- You can interrupt him (barge-in). He stops and listens. That is the model, not a harness mute script.
- He can **answer** (what is this room, what did Engineer just say, what is queued) without opening a Cursor run.
- His voice **is** Travis. It is not a TTS skin on someone else’s text.

### You can still talk *to* PM / SA / Engineer directly

Unchanged job:

- Vocative / `@` / sticky seat → that seat’s Cursor cloud agent (`resume` → `send` → stream).
- Queue + barge if that seat is busy (SCP-003).
- Voice mode still **communicates that agent’s output to you**. This pass does **not** replace that read with a new product. The mouth is still the Voice orb / sentence TTS you already have, unless SA locks the stretch below.

### While you are talking to Travis, he can act

Spoken (or implied) moves Travis can execute **as tools on existing ports** — you do not open Cursor yourself:

| You say (grain) | What happens |
|-----------------|--------------|
| Tell Engineer … / send this to PM | Existing seat pipe: user turn + Cursor run on that seat. Log paints as that seat. |
| Switch to the log / go back to voice | Existing session PATCH `viewMode` / `logSubmode`. |
| What’s waiting / send the queued line / drop it | Existing queue GET + barge/delete/head ports. |
| End the room | Existing session end. |

He does **not** (this pass) spawn a new Cursor agent, open a second room, or rewrite another agent’s post.

### Voice mode still feels like Voice

- Orb, listen / pause, End, dead-man — still the room.
- Implied: Travis is the one communicating. When the floor is Engineer, you still hear Engineer’s post read. When the floor is Travis, you hear **Travis the agent**, not automation.
- Type / Talk stay. You can `@ Travis` from Type and get a Travis reply in the log (text +, in Voice, his audio).

### What this pass does **not** make possible

Named so SA does not stuff them into the first packet unless Story demands it:

- Multiple rooms / L1 select-room (PM #15 / #27). Still one room.
- Ambient “agents chime in” without you addressing them.
- “Stop / say that again / simplify” as a facilitator of **another seat’s** read (PM envelope). Neighbor; not this cut unless SA pulls it in.
- ElevenLabs as the voice engine. Considering only. Native Live audio is the this-pass voice for Travis.
- Travis speaking **other seats’** posts in his Live voice (one mouth, text-in). Stretch — see below.
- `Agent.create` / mint a new `bc-…` from speech. SDK can; no store for “where does that id live.”
- Desktop Cursor, local Composer, shipping any API key to the phone.

---

## Founder locks this envelope is built on

Quoted / paraphrased from founder → Engineer (2026-08-29), not a substitute flag:

1. Travis is a **harness** (communication layer + action layer). Period. Cursor is what it integrates with.
2. Travis is **its own agent**. It has to be, to have a brain.
3. **Existing room rules still apply.** Agents are in the room. Travis is in every room and specifically in this one. Speak to any agent directly. Speak to Travis directly the same way (`hey Travis`).
4. Voice mode **still works the same**: Travis communicates the output of whoever has the floor. The only difference: when Travis is speaking, Travis is the **agent** speaking — not voice automation.
5. Technical judgment (provider, wiring) is **Engineer**. Store / field / contract ascribe is **SA**. Engineer will not mint tables.

---

## Stood-up systems (quote the plant — do not invent)

SA: this is the machine as of `origin/main` (through Hotfix 013/014). Open PRs (#26 STT fold, #28 README trail) do not change the store.

### Stores (schema `travis`)

| Table | Grain that matters here |
|-------|-------------------------|
| `agent_binding` | One row per `seat_key` (`pm` \| `sa` \| `engineer`). `cursor_agent_id` (text, default `''`). Unique `seat_key`. |
| `voice_session` | `active_binding_id` / `default_binding_id` / `binding_id` are **FKs to `agent_binding`**. There is no addressee that is not a binding. `view_mode`, `log_submode`, `router_state`, `client_ip`, `status`. |
| `voice_turn` | Ordered log. `kind`: `user` \| `agent_thought` \| `agent_post` \| `status` \| `travis_prompt`. `seat_key` nullable. `travis_prompt` is the **dead-man** line only. |
| `queued_utterance` | Waiting line. **Requires `binding_id`**. |
| `seat_live_run` | At most one live **Cursor** run per binding. |
| `turn_conductor_phrase` | Done phrases (`I'm done` …). |

TypeScript unions freeze `SeatKey` to three seats and `TurnKind` to those five. Glass already paints a **T** mark for `travis_prompt` (`SeatMark` treats `seatKey === "travis"`).

### Router / dest (no Travis)

- `parseCallByName` (`src/lib/router.ts`): aliases PM / SA / Engineer only. `hey travis` does **nothing**.
- `resolveTypedSend` (`src/lib/typed-dest.ts`): chips and dest are those three `SeatKey`s.
- `GET /api/bindings`: those three labels. Never sends `cursor_agent_id`.
- `ensureSeatBindings`: inserts only those three. Env may fill **blank** Cursor ids only.

### Ports

| Port | Job |
|------|-----|
| `POST/GET /api/session` | Open / resume by client IP |
| `PATCH /api/session/:id` | `status`, `viewMode`, `logSubmode` |
| `POST …/finalize` | Voice/Talk + conductor → router → `sendOrEnqueue` |
| `POST …/send` | Type composer → dest → pipe |
| `GET …/turns` | Log |
| `GET/POST …/queue*` | Snapshot, barge, delete |
| `POST …/dead-man` | Inserts `travis_prompt`, `awaiting_dead_man` |
| `src/server/cursor-port.ts` | `Agent.resume` / `send` / `run.stream` / `wait` / `listRuns` / `cancelRun`. Stand-in if no key or id is not `bc-…`. |
| `@cursor/sdk` also has `Agent.create` | **Unwired.** |

### Voice (pipeline)

Phone: Web Speech STT → accumulate → conductor phrase → finalize. TTS: `window.speechSynthesis`, sentences as `post_delta` closes (Hotfix 013). No Gemini / OpenAI / ElevenLabs in repo or `.env.example`. Only `CURSOR_API_KEY` + optional seat seed ids.

### What this means (Engineer, not ascribe)

Travis **cannot** be the active addressee today without a binding FK or a session field that is not a binding. Travis **cannot** be queued on `queued_utterance` without a `binding_id`. Travis **cannot** own a `seat_live_run` that is a Cursor run. His speech has no honest `voice_turn.kind` (dead-man is the wrong kind). His name is not in the vocative table.

That is the change-management center. Engineer will not invent the row.

---

## What Engineer would try to make happen (after a packet)

Provider judgment (founder deferred): **Gemini Live**, native audio (Gemini 2.5 / current Live native-audio model). Same architecture if SA/founder later swap OpenAI Realtime. Long-lived `GEMINI_API_KEY` **server-only**. Phone gets an **ephemeral token**; PCM goes **phone ↔ Gemini**, not through a Vercel function.

### A. Room addressee

- Vocative + Type `@` + sticky + via-pill include Travis, **same rules** as 010 / SCP-004 / SCP-005.
- Default open addressee stays **PM** (current). Travis is not forced as dest.
- `hey Travis` with remainder **sends** to Travis (like `hey engineer` keeps text). Bare `Travis` is switch-only if that is still 010 law.

### B. Two pipes, one room

| Active addressee | Ingestion | Brain | Out |
|------------------|-----------|-------|-----|
| PM / SA / Engineer | Web Speech + conductor (existing) | Cursor run on that binding | Existing SSE + sentence `speechSynthesis` |
| Travis | Live mic stream (native audio) | Gemini Live (Travis) | Live speaker + transcript in the log |

Do **not** send Travis-addressed utterances through `streamCursorReply`. Do **not** send Engineer-addressed utterances through Gemini as the brain.

Conductor phrase: still required for **seat** turns. For **Travis**, turn-taking is the Live model (VAD / barge-in). SA: say whether “I’m done” is ignored, treated as vocative-only, or still finalizes something when dest is Travis.

### C. Travis tools (existing ports only)

Declared on the Live session. Executed **on the Travis server** (never in the browser with secrets).

| Tool | Maps to |
|------|---------|
| `list_seats` | `GET /api/bindings` shape (labels only) |
| `send_to_seat` | Existing `pipeOneSend` / send-or-enqueue for `pm` \| `sa` \| `engineer` |
| `queue_snapshot` | Existing queue snapshot |
| `barge_or_drop` | Existing queue head / item ports |
| `set_view` | Existing session PATCH |
| `end_session` | Existing session end |

Must-not as tools this pass: `create_agent`, `list_all_cloud_agents`, write bindings, mint tables, speak `bc-…` to the phone.

When Travis `send_to_seat`s, the log is a **normal seat turn** (user line + that seat’s stream). Travis may then say a short status (“sent to Engineer”). That status is Travis speaking, not Engineer.

### D. Log

- User speech to Travis lands as a `user` turn with Travis as dest (however SA names `seat_key`).
- Travis speech lands as **his** post, speakable, **T** mark — not `travis_prompt`, not an Engineer `agent_post`.
- Cursor tool events stay hygiene-skipped (already).
- Live transcripts (user + model) are how the log stays honest when you never hit “I’m done.”

### E. Failures

- No `GEMINI_API_KEY`: Voice dest Travis **must not** silently become a Cursor stand-in. Engineer grain: say so (“Travis isn’t wired”) and keep seat pipe alive.
- Live drop: resume handle if SA stores one; else reconnect; dest stays Travis.
- Seat pipe errors: unchanged.

### F. Stretch (only if SA locks it in the packet)

Voice readback of **other seats** goes through Live as text-in / audio-out so one mouth barges in. This pass default: **leave 013 TTS** for seats so the packet stays cuttable.

---

## What SA must decide (Engineer will not invent)

### 1. How Travis is an addressee in the store

`voice_session.active_binding_id` → `agent_binding`. Options Engineer sees (not a pick):

| Option | Sketch | Cost |
|--------|--------|------|
| **A. Fourth binding row** | `seat_key = travis`, `cursor_agent_id = ''`, never `resume` that row | Session / queue / via-pill keep one pointer. Send path must **refuse** Cursor on that row. Unique `seat_key` already allows a fourth row. |
| **B. Session field, not a binding** | e.g. `active_addressee` = binding id **or** `travis` | New/changed field. Queue for Travis has no `binding_id`. |
| **C. Silence** | Travis dest is runtime-only | Refresh / IP resume forgets dest; Type `@` has no row. |

Engineer preference (judgment, not ascribe): **A**, if Story can bear a binding that is not a Cursor agent. Empty `cursor_agent_id` already exists for unfilled seats; the must is “runtime never `resume`s Travis.”

### 2. Turn kind for Travis’s own speech

`travis_prompt` is dead-man. Reusing it conflates “are you talking with me?” with Travis the agent. Need a kind (or an honest reuse SA names). `seat_key` on user/agent turns when dest/speaker is Travis.

### 3. Live contract (external, versioned)

- Env: `GEMINI_API_KEY` (server), like `CURSOR_API_KEY`. Not a table unless SA wants provider/model as data.
- Ephemeral token mint (server). Live WebSocket (client ↔ Gemini).
- Session resumption handle: **2 hours** on Gemini’s side. Persist on `voice_session` or not? Refresh today resumes the **room** by IP, not a Gemini handle.
- Model id: Engineer will pin a current Live native-audio id in runtime unless SA puts model in a table.

### 4. Queue / busy for Travis

Cursor busy → `queued_utterance` + `seat_live_run`. Travis Live is not a Cursor run. Is Travis-busy a thing (user talks while he is speaking — that is barge-in, not queue)? Can you queue a line **for Travis** while dest is Engineer? `queued_utterance.binding_id` forces option 1-A or a new queue grain.

### 5. Conductor vs Live

When dest is Travis, is the done-phrase still a Story must? Engineer: Live owns turn-taking; phrase is for **seats**. SA lock.

### 6. Type `@ Travis`

SCP-005 fan-out: chips including Travis + Engineer → one Live reply and one Cursor send, or refuse mixed chips this pass?

### 7. Refuse / silence

- `Agent.create` / new `bc-…` from Travis.  
- Binding table as a Cursor-agent catalog (list all cloud agents).  
- ElevenLabs.  
- Multi-room.  
- Facilitator commands on **another seat’s** read (stop / say again / simplify) unless pulled into this packet.

---

## Must-not (both seats)

- Do not mint a table from this envelope. SA ascribes; Engineer waits.
- Do not plant from this file or from PM #27.
- Do not puppet Cursor desktop.
- Do not ship `GEMINI_API_KEY` or `CURSOR_API_KEY` to the client. Do not surface `bc-…` on the phone.
- Do not let env seed clobber live `agent_binding` rows.
- Do not recut locked plates (C3/C4/D3/E1/L1) unless the packet says so.
- Do not replace the seat Cursor pipe with “everything is a Travis tool.”
- Do not treat Travis as a fake `bc-…` so he “looks like” Engineer.

---

## Suggested packet split (change-management)

Not law. SA may one-packet or split.

| Packet | Job | Smoke |
|--------|-----|--------|
| **This pass** | Travis is an addressee; Live brain when dest is Travis; tools on existing ports; seat pipe untouched | `hey Travis` → talk → answer; `hey engineer` → Cursor; tell Engineer X from Travis |
| **Later** | Live mouth for other seats’ read; stop / say again / simplify; `Agent.create`; rooms | PM envelope leftovers |

---

## Verify (when a packet exists — not this file)

1. Open room. Default still PM. `hey Travis I'm done` (or Live equivalent) → via Travis, no Engineer run.
2. Ask a question Travis can answer → hear Travis, see a Travis post in the log, **T** mark, not dead-man copy.
3. `tell engineer to reply once` (or tool-equivalent) → Engineer run + existing stream/TTS; Travis may confirm.
4. `hey engineer` + done phrase → Engineer pipe as today. Queue/barge still work.
5. Type `@` Travis + send → Travis reply in log; composer clears (Hotfix 011 law).
6. No Gemini key → Travis dest does not become Cursor stand-in; seats still work.
7. End session still ends (Hotfix 014).

---

## Engineer: after SA returns a packet

Two buckets only. Specified and clear → cut. Specified but not clear → name why; do not invent the store. Prepend README Implementation on completion. This envelope is not that line.
