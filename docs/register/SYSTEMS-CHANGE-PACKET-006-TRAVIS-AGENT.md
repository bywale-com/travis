# Systems change packet 006 — Travis as a room agent

**Number:** `006` — next systems packet is `007`. Never reuse a number.  
**Seat:** Systems Analyst. Engineer cuts this; no leftover analysis.  
**When:** 2026-08-29  
**Glass / wrap (read-only):** Engineer envelope [`ENVELOPE-TRAVIS-ROOM-AGENT.md`](./ENVELOPE-TRAVIS-ROOM-AGENT.md) on [PR #29](https://github.com/bywale-com/travis/pull/29). Fetch: `git fetch origin pull/29/head`. PM envelope [#27](https://github.com/bywale-com/travis/pull/27) is vision — **do not plant rooms / L1 from it**.  
**Builds on:** `main` through Hotfix 013/014 (`agent_binding`, `sendOrEnqueue` / `pipeOneSend`, SCP-003 queue, SCP-004 Talk/Type, SCP-005 Type multi-`@`, Hotfix 010 vocative).  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

**Flag:** PHASE-ONE-LOG 14:00 — do not overwrite.

---

## Intent

Travis is a **fourth addressee** in the same room. Call him like a seat (`hey Travis`, Type `@`). When he is dest, the brain is **Gemini Live** (native audio), not a Cursor run. He can answer without Cursor. He can run **existing room ports** as tools (send to PM/SA/Eng, queue, view, end). When dest is a seat, the Cursor pipe is unchanged. Voice still reads whoever has the floor: seats keep Hotfix 013 TTS; Travis Live is Travis’s own mouth.

---

## Must / must-not

### Must

- Seed `agent_binding` row `seat_key=travis`, `label=Travis`, `cursor_agent_id=''`, `runtime=cloud`, `active=true`. Never `Agent.resume` that row. Never put a fake `bc-…` on it.
- Open session default dest stays **PM**.
- Vocative + Type `@` + sticky + via-pill include Travis. Same 010 grain: `hey` / `hi` / `hello` / `okay` / `ok` / `yo` + Travis; trailing `Travis`; bare `Travis` = switch only.
- Dest Travis → Live mic + Live speaker. **No** done-phrase finalize. **No** `streamCursorReply`.
- Dest PM/SA/Engineer → today’s Web Speech + conductor + Cursor. Unchanged.
- Leaving Travis: vocative / `@` to a seat stops Live and uses the seat pipe.
- Travis tools run **on the server** against existing ports (below). `send_to_seat` does **not** change `active_binding_id` — sticky dest stays Travis.
- User speech to Travis: `voice_turn` `kind=user`, `seat_key=travis`.
- Travis speech: `kind=agent_post`, `seat_key=travis`, `speakable=true`. **T** mark. Not `travis_prompt`.
- No `GEMINI_API_KEY`: dest Travis must **not** become a Cursor stand-in. Write a `status` turn (“Travis isn’t wired”). Seat pipe still works.
- Keys stay server-side. Phone gets an **ephemeral** Live token only. No `bc-…` on the phone.

### Must-not

- Mint Travis as a fake Cursor agent.
- `Agent.create` / list-all-cloud-agents / write bindings from speech.
- Enqueue Travis on `queued_utterance` or write `seat_live_run` for the travis binding. Travis busy = Live barge-in, not a queue.
- Reuse `travis_prompt` for Travis the agent (that kind is dead-man only).
- Route Travis dest through `streamCursorReply`.
- Route seat dest through Gemini as the brain.
- ElevenLabs this pass.
- Multi-room / L1.
- Ambient chime-in.
- Stop / say again / simplify on **another seat’s** read.
- Live mouth for other seats’ posts (leave 013 TTS).
- Recut C3/C4/D3/E1/L1.
- Ship `GEMINI_API_KEY` or `CURSOR_API_KEY` to the client.
- Clobber live `agent_binding` Cursor ids from env (Hotfix 009 law). Travis id stays empty forever.

---

## Fit vs stood-up (`main` schema)

Quoted from `src/server/db/schema.ts`:

- `SeatKey` = `pm` \| `sa` \| `engineer` only.
- `active_binding_id` → `agent_binding`. No dest that is not a binding.
- `queued_utterance.binding_id` required.
- `travis_prompt` = dead-man (`POST …/dead-man`).
- Router aliases: PM / SA / Engineer only (`src/lib/router.ts`).
- `ensureSeatBindings` inserts those three (`src/server/db/ensure-bindings.ts`).
- `GET /api/bindings` returns those three titles.
- No Gemini / Live in repo.

**Center:** Travis cannot be dest, cannot have an honest post kind, cannot be vocative — until the fourth row + unions + Live port.

---

## Stores / fields / contracts

### Change — `agent_binding` (data)

| seat_key | label | cursor_agent_id |
|----------|-------|-----------------|
| `travis` | Travis | `''` (always) |

Insert if missing. `SeatKey` union **add** `"travis"`.

`GET /api/bindings` + Type `@` list + vocative aliases include Travis. Order: PM, SA, Engineer, Travis. Never send `cursor_agent_id`.

Thought-strip circles stay **PM / SA / Eng only**. Travis does not think on Cursor.

### Change — `voice_session`

| Field | Change | Notes |
|-------|--------|-------|
| `travis_live_handle` | **add** text nullable | Gemini Live resume handle (~2h). Empty on open. Clear on End session. IP resume (014) reloads the room; if dest is Travis and handle is set, Engineer reconnects Live. |

Do **not** mint a provider/model table. Engineer pins the Live model id in server runtime. `GEMINI_API_KEY` is env, like `CURSOR_API_KEY`.

### Reuse — `voice_turn`

| Who | kind | seat_key |
|-----|------|----------|
| You → Travis | `user` | `travis` |
| Travis speaks | `agent_post` | `travis` |
| Dead-man | `travis_prompt` | unchanged |
| Seat stream | unchanged | `pm` / `sa` / `engineer` |

No new kind. Honest reuse: `agent_post` + `seat_key=travis`.

### Refuse

- Session `active_addressee` string instead of a binding (option B). One pointer stays `active_binding_id`.
- `queued_utterance` rows for `seat_key=travis`.
- `seat_live_run` for the travis binding.
- `composer_draft` / mentions table.
- Theme / model catalog table.

### Cursor send path (must branch)

```text
if dest.seat_key === "travis":
  never resume / send / listRuns / cancel
  never queue / seat_live_run
  Live path (or "isn't wired")
else:
  existing sendOrEnqueue / pipeOneSend
```

### External — Gemini Live (quote the job, Engineer wires)

- Server: `GEMINI_API_KEY`. Mint ephemeral token for the phone.
- Phone ↔ Gemini native audio (not through a Vercel function for PCM).
- Tools declared on the Live session; **executed on Travis server**.

| Tool | Maps to (existing) |
|------|-------------------|
| `list_seats` | `GET /api/bindings` shape (labels only) |
| `send_to_seat` | `pipeOneSend` / send-or-enqueue for `pm` \| `sa` \| `engineer` only |
| `queue_snapshot` | existing queue snapshot |
| `barge_or_drop` | existing queue head / item |
| `set_view` | session PATCH `viewMode` / `logSubmode` |
| `end_session` | session end |

After `send_to_seat`: optional short Travis `agent_post` (“Sent to Engineer.”). Sticky dest **stays Travis**.

Must-not as tools: `create_agent`, list all cloud agents, write bindings, speak `bc-…`.

---

## Runtime

### Dest Travis (Voice)

```text
stop Web Speech conductor
start Live (or status: isn't wired)
user audio → Live
user transcript → user turn (seat_key=travis) as it commits
Travis audio → phone speaker (barge-in = model)
Travis transcript → agent_post seat_key=travis
vocative in user transcript (parseCallByName) to a seat
  → stop Live, set active to that seat, if remainder: seat pipe
"I'm done" while dest is Travis: not a conductor. Live hears it as words.
```

### Dest seat

Today’s finalize / Type send. Unchanged. Calling Travis switches dest and starts Live (Voice) or waits for Type send.

### Type

`@` list includes Travis.  
**Travis-only chips:** Live/text Travis reply (no Cursor). Composer clears (Hotfix 011).  
**Seat-only chips:** 005 fan-out `pipeOneSend`.  
**Mixed Travis + seat chips:** allowed. Same body: Travis gets Live/text reply; each seat chip gets `pipeOneSend`. One user turn. Sticky dest = **last chip**.  
No chips: 004 law (vocative or via-pill).

### Talk

If dest is Travis, Talk has no composer (004). Live still runs in Voice; in log Talk, Engineer may keep Live or show Travis posts only — **lock: Live audio is Voice mode. Log Talk dest Travis: Type-like text in/out is not required this pass. User can View voice to talk Live, or Type `@ Travis`.** If dest is Travis and view is log Talk, do not run done-phrase to Cursor; a spoken “I’m done” does nothing to Cursor.

### Queue

Seat busy → 003. Travis: barge-in, never queue.

### Failure

Live drop: reconnect with `travis_live_handle` if set; dest stays Travis. Seat errors unchanged.

---

## Ports

| Port | 006 |
|------|-----|
| Cursor seat pipe | **Unchanged** |
| Gemini Live | **Real** when key set; else status, not stand-in |
| Ephemeral token | **Real** (server) |
| Travis tools | **Real** — wrappers on existing routes |
| ElevenLabs | **Named silence** |
| `Agent.create` | **Named silence** |

---

## Verify

1. Open room → via **PM**.  
2. `hey Travis` → via Travis. No Engineer/PM Cursor run.  
3. Talk to Travis (Live) → hear Travis, log shows user + Travis post, **T** mark, not dead-man wording.  
4. `tell Engineer …` (tool) → Engineer run + existing stream/TTS; dest pills still Travis; Travis may post “Sent to Engineer.”  
5. `hey engineer` + I’m done → Engineer pipe as today. Queue/barge still work.  
6. Type `@` Travis + send → Travis line in log; field clears.  
7. Type `@` Travis + `@` Engineer + one body → Travis reply + Engineer send/queue.  
8. No Gemini key → dest Travis does **not** hit Cursor stand-in; seats still work.  
9. End session ends (014). SPA has no keys and no `bc-…`.

---

## Out of scope

Multi-room, L1, ambient agents, ElevenLabs, Live readback of other seats, stop/say-again/simplify on a seat read, `Agent.create`, binding picker.

---

## Engineer handoff

Envelope #29 is the wrap. This packet is the cut. Two pipes: Travis = Live; seats = Cursor. Fourth binding row, empty Cursor id, never resume. Handoff is go. Do not append PM/SA logs. Prepend README Implementation when planted.
