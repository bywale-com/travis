# Packet 019 — Stream architecture (the model)

**Number:** `019` — next packet is `020`. Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Technical Architect (was Technical PM — same seat, architecture added). **SA** ascribes as **035**.  
**When:** Named 2026-09-09.  
**Status:** Specified.  
**Wake:** sa
**Test spec:** [`PM-PACKET-019-STREAM-ARCH-TEST.md`](./PM-PACKET-019-STREAM-ARCH-TEST.md)  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **14:00 UTC 2026-08-25**.  
**Law:** [`docs/BUILD-PROTOCOL.md`](../BUILD-PROTOCOL.md) — Compose, don’t invent.  
**Model:** founder upload — one spoken stretch with walk-back, notes, a leave, a mid-stream change, another leave, then “I’m done.” Work starts before “I’m done.” A later line can change a job that already left.  
**Builds on:** 014–018 hung. 034 hung the room thread + dest follow-up. Do not remint dest mail, kit-only send, dest-gate-on-ask, Cloud create, or the checkpointer.  
**Next SA:** **035**.

**Where:** this PR. SA and Engineer commit here. Do not open a cousin. Do not remint 011–018 / 027–034.

---

## Founder lock

> This is model. I want a concrete implementation plan, down to the files (and what goes in — not code). We’re going to architect this. Also the Technical PM is now a Technical Architect, it retains everything the PM did but with the addition of architecture.

The model’s consistent example (kept; board / coffee are stand-ins for a leave, not new apps we plant):

> Travis, what did we do today? Actually, what did we do yesterday? And also, before I forget, put this paragraph in the notes. Also, order me some coffee, stat. Put that image we discussed yesterday on the board. Also, my bike — I have a thing I want to add, the bike room. I have an idea. [another paragraph.] By the way, it’s with me the entire time. [two seconds later] And, whatever. By the way, here is now. Okay, I’m done.

Sometimes a later phrase is a **change** of something already started. Sometimes it is **new**. Sometimes it is an **extension**. The work must start before he says he is done.

Tokens are clay. The shape is architecture: how those phrases become processes that start, change, or stay quiet, while he is still talking.

---

## What this packet is

The file plan for that shape, hung on what already exists.

It is **not** a Travis orchestrator. It is **not** Pipecat-as-Travis. It is **not** a coffee API or a board app. Those names in the model are **leaves** — the same kind of leave as “send that to this seat.”

018 / 034 already hung: same room = same LangGraph thread; a living dest is Cursor follow-up. This cut splits **start work** from **speak**, and puts the “is this new, a change, or just talk?” job in one small place on the wire.

---

## How we split files (the three questions)

A new file only when **any** of these is yes:

1. Does the data come from a **different source**?
2. Does it run at a **different speed**?
3. If it fails, is the **side-effect different**?

That is why the three session doors already exist and **stay**:

| Door | Source | Speed | If it fails |
|------|--------|-------|-------------|
| `live/transcript` | Live ear (Realtime chunks, flushed on a short pause) | Many times per spoken stretch | A phrase is dropped; the room thread and Type send stay up |
| `finalize` | Voice silence / “I’m done” | Once per spoken turn | He does not hear the wrap; the jobs that already left stay left |
| `send` | Type tap | Once per typed line | The line shows failed; Voice is untouched |

Do not merge those three doors. A bug in the live flush must not take down Type.

---

## The walk, mapped

Use this walk for every file below.

| He says | Kind | What must start **now** | What must not happen now |
|---------|------|-------------------------|--------------------------|
| “What did we do yesterday?” | Walk-back | Same room thread + tape search. Not a blank think. | Do not wait for “I’m done.” Do not dest. Do not speak the full wrap yet. |
| “Put this paragraph in the notes.” | New leave (notes) | A dest (or the trail write) leaves with this ask + the print. | Do not invent a notes product. |
| “Order coffee” / “put that image on the board” / “bike room” | New leave | Each is its own dest (or named tool we already have). Parallel. | Do not plant a coffee API or a board app. |
| “Actually, the blue one” / “wait, instead…” | Change | The **matching in-flight leave** gets a follow-up (Cursor) or the room thread gets an update (LangGraph). The old fetch does not finish as if nothing changed. | Do not start a cousin dest. Do not re-think the whole stretch. |
| “By the way, … this other seat” | New leave (interrupt) | Second dest, same print. | Not a modification of the first dest unless he said it is. |
| Chatter / “it’s with me the entire time” | Talk | Append to the room thread. No leave. | Do not dest. |
| “Okay, I’m done.” | Wrap | Read what already finished or is in flight. Speak once. | Do not start the leaves **now**. They should already have left. |

Type has no “I’m done.” A Type send **is** the wrap for that line: classify → start/change what that line named → then speak. Voice uses the transcript door for start/change, and finalize for the wrap.

---

## Four layers (what already is which)

No framework is Travis. Each piece owns **one** slice of the walk.

| Layer | Job on the walk | What already is that | What we do **not** install |
|-------|-----------------|----------------------|----------------------------|
| **Ear** | Audio → phrases. Cancel the mouth when he talks over it. | OpenAI Realtime: `live/token`, `travis-live-client.ts` (already sends `response.cancel` on a user flush), `live/transcript`. | Pipecat as the product. A second WebSocket stack. |
| **Classify** | This phrase: new / change / cancel / talk? | **Missing.** `conductor.ts` only finds “I’m done.” `dest-gate.ts` only refuses a dest. `router.ts` only hears a seat name. | A second dest-keyword list. A vector database. A Travis “intent engine” product. |
| **Do** | Start, change, or cancel a leave; keep the room thread. | LangGraph checkpointer + `thread_id = voice_session.id` (`travis-checkpointer.ts`, `invokeDeepAgent`). Cursor `resume` + `send` (`cursor-port.ts`). `listOpenDestJobs`. Dest body = ask + print (015). | Temporal, Inngest, a homemade event bus, `motion.ts` as this board. |
| **Mouth** | When the turn closes, speak from what already happened. | `travis-deep-agent.ts` + `pipeTravisText`. | A second model loop (Responses cousin is gone). |

The intelligence that hears “actually, the blue one” and points at the board leave sits in **Classify**, on the wire **between** the ear and Do. It does **not** sit in the mouth.

---

## File plan — what goes in (not code)

### A. Doors (keep the files; recut the job)

#### `src/app/api/session/[id]/live/transcript/route.ts`

**Stays the live ear door.** High frequency. One phrase (or a short flush) per call.

**Goes in:** Own the session; write the user line to the tape; call classify; if the phrase is a leave or a change, call Do **without** waiting for finalize; return quickly. Cursor-named dests on this path still leave here (that already works).

**Comes out:** The full Travis think-and-speak (`pipeTravisText` / `liveShouldPipeTravis`). Live must not answer the whole stretch on every flush. A flush that is only chatter appends to the thread and stays quiet.

**Failure:** Phrase dropped or mis-classified. Type send and finalize still work.

#### `src/app/api/session/[id]/finalize/route.ts`

**Stays the Voice wrap door.** One burst when the conductor hears “I’m done” (or the locked done-phrase).

**Goes in:** Own the session; strip the done-phrase (already `conductor.ts`); **synthesize only** — read the room thread checkpoint + open dests, speak one wrap. If a leave somehow did not start (classify miss), Do may catch it here **once**, then speak. That catch is backup, not the design.

**Comes out:** Starting the whole think as if nothing has left yet.

**Failure:** No spoken wrap. Leaves that already left stay left.

#### `src/app/api/session/[id]/send/route.ts`

**Stays the Type door.** One tap = one completed line.

**Goes in:** Own the session; write the line; classify that line (it may hold more than one ask); Do for each new/change; **then** synthesize. Type has no second “I’m done” door.

**Comes out:** Nothing. Same pipe as today, plus classify-before-speak.

**Failure:** That typed line fails in the UI. Voice doors untouched.

#### `src/app/api/session/[id]/live/token/route.ts`

**Stays ear/mouth credential only.** Mints the Realtime secret. Seeds Here so a reconnect is not a blank room.

**Goes in:** What is already there.

**Comes out:** Think. Think is not this file.

#### `src/lib/travis-live-client.ts`

**Stays the phone Realtime client.**

**Goes in:** Mic → Realtime. Phrase flush (today ~850ms pause, or the engine’s user-flush). `response.cancel` when he talks over Travis (already there). POST each user flush to `live/transcript`. Play whatever finalize / a dest stream asks the mouth to say.

**Comes out:** Deciding new vs change. That is classify, server-side. Do not put seat logic in the browser.

**Do not replace this client with Pipecat.** Realtime already is the continuous ear and the cancel button. Pipecat is the same *slice* in another repo — not a pre-built Travis.

---

### B. Classify (one new lib — this is the missing file)

#### `src/lib/stream-intent.ts` — **new**

**Why a new file (three questions):** Source is a **phrase plus the open-job list**, not the mic and not the wrap. Speed is **every phrase**. If it fails, the wrong job starts or a change is missed — the HTTP door and the dest wire must still be up.

**Goes in (only this job):**

1. **Zero-token pivots** — words that mean “this is a change,” not a new leave: *actually, wait, instead, scrap that, no — the …*. Presence sets change-mode. This is **not** a dest-gate keyword list. It does not refuse a send. It does not live in `dest-gate.ts`.
2. **Match the target** — compare the phrase to **jobs already in flight** for this room: open `dest_job` rows (`listOpenDestJobs`) and the room thread’s last claims (checkpoint / tape). “The blue one” next to “put that image on the board” is a change of **that** leave. No new vector store unless SA proves those two lists cannot match. Do not mint a table here.
3. **Scoped extract (tiny, only after 1+2)** — if change-mode and a target job are known, a small structured read: what parameter changed (blue, not the whole life story). If neither pivot nor a clear new leave: **talk**.
4. **Emit one of:** `new` · `change` · `cancel` · `talk`. For `new` / `change` / `cancel`, name the target (open dest id, or “Travis thread”). No prose. No speak.

**Comes out:** Dest assemble. Cursor send. Synthesis. Motion. Seat names (`router.ts` already does names).

#### `src/lib/stream-intent.test.ts` — **new**

**Goes in:** The walk as phrases. “Yesterday” → new walk-back (thread). “Put this in the notes” → new. “Actually the blue one” after a board leave → change of that dest. “By the way, Engineer too” → new (second dest), not a change of the first. “I’m done” is **not** this file (`conductor.ts`).

---

### C. Do (hang existing ports — do not write a process engine)

#### `src/server/stream-dispatch.ts` — **new**

**Why a new file:** Source is a classify result, not a phrase and not a wrap. Speed is per phrase, in the background. If it fails, one leave fails; the ear door still returns; the mouth can still wrap what did leave.

**Goes in:** A thin switch.

- `new` + walk-back → room thread update (same `thread_id`). Tape search we already have (`search_room` / print). No dest.
- `new` + leave to a seat → existing dest assemble (ask + print) + `dispatchToSeat`. Living person. No create. Ticket only after `dest_job` inserts (017).
- `change` + that dest is open → Cursor follow-up on **that bind** (034). `parent_id` on `dest_job` may point at the job being changed — SA ascribes; do not remint the table.
- `change` + Travis’s own think → LangGraph `Command(update=…)` / later `invoke` on the **same** `thread_id`. 034 hung the saver; this cut **hangs the update**. Do not mint a cousin thread.
- `cancel` → Cursor cancel we already have (`cancelCursorRun`) for that dest, or a thread update that drops the Travis-side claim.
- `talk` → append on the room thread. No dest.

**Comes out:** Speaking. Classifying. A queue we designed. `motion.ts`. A Travis event bus. Temporal.

#### `src/server/travis-deep-agent.ts`

**Stays the room-thread hang.**

**Goes in now (already):** `createDeepAgent`, official checkpointer, `thread_id = sessionId`, `/print.md` + `/roster.md`, tools, `subagents: []`.

**Goes in next:** Two **uses** of the same agent, not a second kit:

1. **Update** — phrase or classify result onto the thread. May run tools. **Does not owe a spoken wrap.**
2. **Synthesize** — read the checkpoint + open dests, produce the one mouth line for finalize / Type-after-Do.

Creating the compiled agent per call stays legal if saver + `thread_id` stay the same (034).

**Comes out:** A fresh blank think per phrase. Subagents. `task` / `execute`. Inventing interrupt/resume ourselves.

#### `src/server/travis-checkpointer.ts`

**Stays.** Official `PostgresSaver`, schema `langgraph`, own tiny pool. This **is** the shared state buffer (`[Coffee: left]`, `[Board: changing]`, `[Yesterday: retrieved]`). Do not mint `travis.thread` or a memory table.

#### `src/server/cursor-port.ts`

**Stays Cursor’s wire.** `Agent.resume` + `send`. Follow-up. Cancel. Harvest.

**Goes in:** Called from stream-dispatch for `change` / `cancel` / `new` dest. No new mail format.

#### `src/server/dispatch.ts`

**Stays file-the-job-and-leave.**

**Goes in:** `new` dest still files `dest_job` then leaves. Busy on a **change** is Cursor’s busy/follow-up (034 named `agent_busy`) — not “enqueue and forget.” Queue may still hold a **second new** dest to a busy person. Do not treat queue as modify.

#### `src/server/dest-job.ts`

**Stays.** `listOpenDestJobs` is the in-flight dest list classify reads. `parent_id` exists — SA says whether a change row points at the job it modifies. Do not remint.

#### `src/server/dest-with-context.ts` · `src/lib/dest-with-context.ts`

**Stays 015.** Every dest body is ask + unclipped print. Stream-dispatch does not invent a shorter letter.

#### `src/lib/dest-gate.ts`

**Stays 017.** Classify the founder’s **last ask** only (or drop HIS_WORK). Do not scan the print. Do not add *actually* / *wait* here. Those are stream-intent pivots, a different job.

#### `src/lib/dest-follow.ts`

**Stays.** Path: follow-up vs new leave. Stream-dispatch uses this; it does not rewrite it.

#### `src/server/sit.ts` · `src/server/living-seated.ts`

**Stays.** Named seat → living person. Create is not dest. Glass name becomes **Technical Architect** (below). Protocol stays `/protocols/pm.md`.

---

### D. Mouth and pipe

#### `src/server/travis-reply.ts`

**Stays the speak pipe** (status, post, stream close).

**Goes in:** Called from **finalize** and from **Type send after Do**. Not from every live flush.

#### `src/server/travis-openai.ts`

**Stays** `generateTravisText` → `invokeDeepAgent`, and `mintLiveToken` (ear/mouth only).

**Goes in:** A way to invoke **update** vs **synthesize** so transcript/dispatch does not force a wrap. Live token stays tool-less.

#### `src/lib/live-harness.ts`

**Stays the Live rule.**

**Goes in:** Live ear does **not** full-pipe Travis on every user flush. Dest-by-name on the transcript path may still leave. Synthesis waits for finalize (Voice) or Type send.

#### `src/lib/conductor.ts`

**Stays Voice done-phrase only.** “I’m done” / locked phrases. Strip phrase from the wrap prompt.

**Comes out:** Intent classify. Pivot words.

#### `src/server/travis-tools.ts` · `TRAVIS_SYSTEM`

**Stays the tool bag + voice.** Dest, search, sit, create (Cloud).

**Goes in:** He may dest while the stretch is still open. He does not wait for “I’m done” to be allowed to dest. Do not add a homemade orchestrator tool. Do not tell him to recap unasked — walk-back is the thread + tape.

#### `src/lib/room-context.ts` · `src/server/room-read.ts`

**Stay the Here card** (clipped). Walk-back after a break is the **thread + print + `search_room`**, not a fatter Here. Do not unclip the spoken window.

---

### E. Do not grow these into the model

#### `src/server/motion.ts` · `src/lib/motion.ts`

**Leave them.** Sequential chores **after** he already answered. Dest is not a motion step. This is **not** the in-flight board. Do not add dest, classify, or synthesize here.

#### `src/server/create-agent.ts`

**Leave 017.** Cloud create, or the named blocker. Not the stream.

#### `src/lib/router.ts` · `src/lib/typed-dest.ts`

**Stay name → seat.** Add spoken **Technical Architect** (and keep Technical PM as an alias so old speech still hits `pm`). Not classify.

---

### F. Glass and seat identity (same packet)

The Technical PM seat **is** the Technical Architect. Same bind, same protocol file, same catalog rule.

| File | What goes in |
|------|----------------|
| `docs/README.md` | Paste + identity: Technical Architect. Owns face, technical cut, **and** architecture (file boundaries, what hangs where). Still does not plant. Still does not mint tables. |
| `docs/seats/TECHNICAL-ARCHITECT.md` | Living seat README. Everything PRODUCT-MANAGER had, plus architecture. |
| `docs/seats/PRODUCT-MANAGER.md` | Stub pointer so old pastes still land. |
| `docs/register/house-now/protocols/pm.md` | Identity recut. **Do not mint** `/protocols/technical-architect.md` or `/protocols/technical-pm.md`. |
| `AGENTS.md` | Engineer always-on: this seat is Technical Architect. |
| `src/lib/dest-glass.ts` | `destGlassName` for catalog `pm` → **Technical Architect**. Person label still wins. |
| `src/lib/protocol-path.ts` | `SIT_ROLE_LABEL.pm` → **Technical Architect**. Path still `/protocols/pm.md`. |
| `src/lib/router.ts` | Spoken “Technical Architect” → `pm`. Keep “Technical PM.” |
| Tests next to those files | Glass string + alias. |

Catalog `pm` stays hidden. Living dest is the seated person. Do not spin a fourth seat.

---

## What we hang vs what we refuse

| Suggestion from the model | Verdict |
|---------------------------|---------|
| Pipecat / Realtime as the ear + cancel | **Realtime is already hung.** Do not add Pipecat. |
| LangGraph as the chore board + cancel/update | **Thread + checkpointer hung (034).** This cut hangs **update / cancel** on that thread. Dest stays Cursor. |
| Deep Agents as the mouth | **Already the think.** Recut so the mouth is the wrap, not the first start. |
| Fast router / “actually” | **`stream-intent.ts`.** Pivots + match open jobs + tiny extract. Not dest-gate. |
| Embeddings / cosine to jobs | **Only if** open dests + thread cannot match. SA says. Do not open with a vector store. |
| Event bus we write | **No.** LangGraph update + Cursor follow-up **are** the bus. |
| `motion.ts` as parallel workers | **No.** |
| Letta / Temporal | **No** for this cut. Tape + thread + dest_job exist. |

---

## Face (plain)

He talks. Leaves start while he is still talking. “Make it the blue one” changes the leave that already went, or the think that is already this room’s thread. When he says he is done — or he taps send — Travis speaks what already happened, not a promise to start.

Walk-back uses the same room thread. Send to a seat is still send (ask + the chat). On the glass: **Technical Architect**, not catalog PM.

Log · Type first. No Hear it / Skip buttons.

---

## Lock

1. **Three doors stay.** Transcript starts/changes. Finalize wraps Voice. Type send does start/change **and** wrap for that line.
2. **Classify is one new lib.** Pivots are not dest-gate. Open jobs are `dest_job` + the room thread. No new job table unless SA proves those cannot hold “what is in flight.”
3. **Do is hang.** Stream-dispatch only calls dest assemble, Cursor follow-up/cancel, and LangGraph update on the existing `thread_id`. No Travis orchestrator.
4. **Mouth is last.** Live flush does not full-pipe Travis. Finalize / Type-after-Do speak from the checkpoint + open dests.
5. **014–018 stay.** Dest body ask + print. Type think is Deep Agents only. Dest-gate on the last ask. Cloud create. Ticket after `dest_job`. Living seated person. Checkpointer + `thread_id = voice_session.id`.
6. **Seat name.** Technical Architect. Protocol `/protocols/pm.md`. Catalog `pm` hidden.
7. **Compose.** Novel code needs a reason. The reason for `stream-intent` and `stream-dispatch` is the three questions above. Everything else is a hang or a recut.
8. **Live is the ear.** First plant on this packet, before classify. A spoken stretch on Voice + Travis must not fall to phone ear / “I’m done” because the think kit died or because a second connect returned false. Do not remint 036’s warning as the product. Do not remint 079 / 080 / 081 / 032.

---

## Lived miss — “Travis Live is down — phone ear. Say I’m done.”

**Founder (2026-09-09):** Travis Live is down — phone ear. Say “I’m done”. Why are we still dealing with this problem over 4 patches?

The line is [`Room.tsx`](../../src/components/Room.tsx) `armEar`: `connectLive` returned false, so the glass paints the 036 fallback and starts Web Speech. That is not a new product. It is the leftover when Live never stayed up.

**The four patches (what each actually cut):**

| Cut | What it treated | What it left |
|-----|-----------------|--------------|
| **036** | Live never armed (circular “already listening”). | Honest fallback: phone ear + “I’m done.” The warning became the glass. |
| **079** | Think kit loaded with the token door. Phone parsed HTML as JSON. | Lazy-load inside `generateTravisText`. Token still imports that same module. |
| **080** | Think kit ESM on Vercel. Type mute. | Type could answer. Ear unchanged. |
| **081** | Voice mouth was still the Realtime model. | Every Live phrase flush runs the full Type think (`pipeTravisText` → Deep Agents, 60s). Ear and think share the Voice session. |

032 / 034 hung the checkpointer on that same invoke. Heavier think on the same flush.

**Why the fourth patch still leaves “I’m done”:**

1. **081 put the Type think on every Live flush.** Transcript is the ear door. It now runs a 60s kit invoke. When that dies or times out, Realtime closes. `onClose` starts the phone recognizer. Next `armEar` sees Live gone and paints 036. We never split the ear from the think. We hung more think on Voice.
2. **`connectLive` lies.** If a connect is already in flight, the next call returns `false`. `armEar` treats that as Live down and starts phone ear **while Live is still coming up**. Quoted:

```1027:1028:src/components/Room.tsx
      if (liveRef.current) return true;
      if (liveConnectingRef.current) return false;
```

3. **Unwired is relabeled.** Token `wired: false` sets “Travis isn’t wired,” then `armEar` overwrites it with the 036 phone-ear line. Two holes, one shirt.

**First plant (same PR, before classify):**

- `connectLive` waits for the in-flight connect. It does not return false because someone else is connecting. A false must be a real miss (token, WebRTC, mic).
- Unwired stays “Travis isn’t wired.” Do not paint phone-ear / “I’m done” over that.
- Live transcript **does not** `pipeTravisText`. 081’s “Voice uses the Type hang” stays for **finalize** (the wrap), not for every flush. This is the 019 mouth-last lock, not a remint of dest mail or the kit.
- Do not write a fifth cousin that only changes the subtitle.

---

## Technical cut (Engineer after SA)

Quoted so the hang is not from memory.

`connectLive` returns false while a connect is already running (this comes **out** — wait, do not start phone ear):

```1027:1028:src/components/Room.tsx
      if (liveRef.current) return true;
      if (liveConnectingRef.current) return false;
```

Live flush already thinks (this comes **out** of the transcript door):

```170:188:src/app/api/session/[id]/live/transcript/route.ts
  if (liveShouldPipeTravis({ prompt, cursorDestCount: cursorDests.length })) {
    let spoken = "";
    await pipeTravisText({
      sessionId,
      prompt,
      userTurn,
      send: (event, data) => {
```

Room thread already hung (Do uses this; add update, do not remint):

```143:159:src/server/travis-deep-agent.ts
  const checkpointer = await travisCheckpointer();
  const agent = createDeepAgent({
    // ...
    checkpointer,
    middleware: [destKitMiddleware(params.sessionId)],
    subagents: [],
  });
  const result = await agent.invoke(
    { messages: [{ role: "user", content: input }], files: kitFiles(print, roster) },
    { configurable: { thread_id: params.sessionId } },
  );
```

In-flight dests already listed (classify reads this):

```133:145:src/server/dest-job.ts
export async function listOpenDestJobs(sessionId: string): Promise<
  Array<{ job: DestJob; binding: AgentBinding }>
>
```

Ear already cancels the mouth when he talks (keep; do not replace with Pipecat):

```113:121:src/lib/travis-live-client.ts
  const flushUser = (forced?: string) => {
    // ...
    sendEvent({ type: "response.cancel" });
```

**Grain.** SA ascribes: whether `parent_id` is the change pointer; whether LangGraph `Command(update)` is the Travis-side change; that no new table is minted unless classify cannot see in-flight work. Engineer hangs those. Do not remint 031 / 032 / 033 / 034.

---

## Must / must-not

- Engineer hangs ports. A Travis interrupt/resume/modify engine is a miss.
- Do not install Pipecat. Do not restore the Responses cousin.
- Do not remint dest assemble, dest-gate-on-ask, Cloud create, checkpointer, `dest_job`.
- Do not put Hear it / Skip buttons back.
- Do not grow `motion.ts` into this.
- Do not mint `/protocols/technical-architect.md`.
- Do not plant a coffee, board, or bike product.
- Do not invent a second keyword list for dest.

---

## SA 035

Ascribe. Quote the files in the technical cut. Compose.

1. Confirm in-flight work is `dest_job` (open) + LangGraph checkpoint. Mint a store only if that pair cannot hold “what he just started.”
2. Name the primitive for `change` on a dest (follow-up + `parent_id` or not) and `change` on Travis (official `Command(update)` / later invoke on the same `thread_id`).
3. Stream-intent is lib. Stream-dispatch is hang. No event-bus table.
4. Glass: Technical Architect. Protocol path unchanged.
5. Do not remint 031 / 032 / 033 / 034 / `dest_job`.
