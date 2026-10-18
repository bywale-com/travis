# Travis load-bearing product architecture

## Purpose

This is the UI-and-code dossier for the product constructs that make Travis
Travis.

A load-bearing item here is not merely a feature. It is a product or
architecture choice whose effect is directly observable in the interface or in
the behavior of the system. Each section therefore has two passes:

1. **UI pass** — the most direct ways the construct manifests to the operator.
2. **Code pass** — the steps, files, stores, and external services that make the
   behavior possible.

The descriptions use standard industry terms first. Travis-specific names come
second.

## Product classification

Travis is a **voice-first, event-driven, multi-agent orchestration client built
around persistent conversational workspaces**.

- **Cursor Cloud Agents** is the specialist-agent execution platform.
- **Travis** is the conversational control plane.
- **Postgres** holds durable product state and Travis's LangGraph checkpoints.
- **The phone UI** is the primary human interface.

## Contents

1. Persistent conversational workspace — Room
2. Multimodal conversational interface — Voice and Log
3. Explicit end-of-turn protocol — conductor phrases
4. Role-based multi-agent system
5. Dynamic role binding — seat and sit
6. Intent-based agent routing — dest
7. Asynchronous job dispatch — dispatch and leave
8. Durable work order — `dest_job`
9. Per-agent work queue
10. Job-progress view — Stream
11. Conversational command routing — new, change, cancel, talk
12. Append-only conversation log — room tape
13. Realtime event subscription — room wire
14. Persistent conversational memory — Travis thread
15. Persistent execution context — Cursor agent thread
16. Contextual output attachments — Artifacts
17. Conversational task projection — Backlog and initiatives
18. Searchable interaction history — Requests
19. Notification acknowledgement — Hear and Skip
20. Audio-session arbitration — one ear
21. Text-to-speech output — readback
22. Output filtering — pipe hygiene
23. Progressive disclosure — doors
24. Tokenized visual themes — Mission and Carbon
25. Runtime UI instrumentation — surface registry
26. User-initiated defect capture — Look

---

# 1. Persistent conversational workspace — Room

## What it ultimately is

**A persistent conversational workspace.**

In domain-design terms, the room is Travis's practical **aggregate root**: the
durable object around which conversation, participants, delegated jobs, queues,
streams, initiatives, and artifacts are grouped.

The database calls it a `voice_session`, but its product meaning is larger than
"a voice session." It is the container for an ongoing body of work.

```text
Room
├── members
├── ordered conversation
├── active destination
├── agent jobs
├── queued instructions
├── work streams
├── initiatives
├── artifacts
└── conversational memory
```

The critical consequence is:

> Leaving the screen, closing the browser, losing an HTTP connection, or
> waiting for an agent does not end the workspace.

## UI pass

### The room index

After choosing Mission or Carbon, the main screen is **Rooms**.

Each row exposes four properties of the workspace:

- room title;
- last activity time;
- participant marks;
- whether the room remains open.

`src/components/plates/RoomIndex.tsx` receives this shape:

```ts
export type RoomRow = {
  id: string;
  title: string;
  status: string;
  createdAt: string | Date;
  endedAt: string | Date | null;
  lastAt?: string | Date;
  members: Array<{ seatKey: string | null; label: string }>;
};
```

The UI renders those values directly:

- `room.title` becomes the row label;
- `relativeTime(room.lastAt ?? room.createdAt)` becomes its recency;
- `room.members` becomes the stack of seat marks;
- `room.status !== "ended"` produces the live dot.

The room index is therefore a projection of stored workspace state, not a
static menu.

### Enter, Leave, Rename, and End room

These four controls have different meanings:

- **Enter** attaches the phone to an existing workspace and restores it.
- **Leave** returns to the index without closing the workspace.
- **Rename** changes its durable title.
- **End room** performs a durable lifecycle transition and closes its open
  memberships.

In a transient chat, Leave and End could be the same action. They cannot be the
same here because the room owns work independently of the current browser
view.

### The room header

The entered room exposes room-scoped projections:

- Artifacts;
- room title and roster;
- `via <active agent>`;
- number of motions currently in progress;
- Backlog;
- Look;
- Requests;
- Leave.

Backlog, Requests, Artifacts, and Look are not global application areas. They
all operate on the current room ID.

### Voice and Log are two faces of one room

Switching between Voice and Log does not change the workspace. The same room
keeps its members, active destination, conversation, queue, streams, backlog,
and artifacts. Only its presentation and input mode change.

### Re-entry restores the workspace

Entering an existing room restores:

- conversation turns and their attachments;
- motion cards;
- live and completed streams;
- queue state and running seats;
- room membership;
- Voice or Log;
- Talk or Type;
- listening or paused state.

That restoration is the strongest visible proof that the Room is a persistent
workspace rather than a React screen.

## Code pass

### Step 1: `TravisApp` mounts the product shell

`src/components/TravisApp.tsx` renders the Room application after character
selection:

```tsx
{picked ? <Room t={t} onCharacter={resetPick} /> : <ModeDoor />}
```

`Room.tsx` manages both the index and the entered workspace:

```ts
const [session, setSession] = useState<Session | null>(null);
const [rooms, setRooms] = useState<RoomRow[]>([]);
const [plate, setPlate] = useState<PlateFace>("index");
```

`useState` is React's local, reactive projection. It causes the interface to
rerender, but it is not the durable source of truth.

### Step 2: the browser loads the room index

The mounting effect calls `loadRooms()` and `loadCatalog()` concurrently.
`loadRooms()` performs:

```ts
fetch("/api/rooms")
```

The browser receives stored rooms from the server rather than manufacturing
demo rows.

### Step 3: `/api/rooms` applies operator ownership

`src/app/api/rooms/route.ts` performs:

```ts
const operator = await requireOperator(req);
const scope = await roomScopeForOperator(operator);
const rooms = await listRoomsForOperator(scope.viewerIds);
```

The durable operator cookie resolves to an `operator` row. The room query is
then restricted to that operator's permitted owner IDs.

For individual rooms, `requireOwnedSession()` in `src/server/operator.ts`
verifies both existence and ownership. A room owned by someone else is
reported as not found rather than disclosed.

### Step 4: the server composes each index row

`listRoomsForOperator()` in `src/server/room-membership.ts`:

1. selects matching `voice_session` rows;
2. joins open `room_membership` rows to `agent_binding`;
3. computes `max(voice_turn.created_at)` for each room;
4. orders rooms by that actual activity;
5. packs the title, lifecycle, members, and timestamps for the UI.

The path is:

```text
voice_session
room_membership + agent_binding
voice_turn max(created_at)
        ↓
listRoomsForOperator()
        ↓
GET /api/rooms
        ↓
Room.loadRooms()
        ↓
RoomIndex
```

### Step 5: creating a room creates the aggregate and its cast

The browser posts a title and selected agent bindings to `/api/rooms`.
`createExplicitRoom()` verifies every selected binding, always adds Travis,
chooses the initial destination, and opens a database transaction.

Inside that transaction it:

1. inserts one `voice_session`;
2. inserts the corresponding `room_membership` rows.

A transaction means both operations succeed or fail together. Travis cannot
leave behind a room with no cast or memberships for a room that failed to
exist.

### Step 6: `voice_session` is the common scoping key

`src/server/db/schema.ts` stores the room's identity, owner, title, lifecycle,
active and default destination, interface mode, listening state, router state,
and Live continuation handle.

The remaining product state points back to that identity:

```text
voice_turn.session_id
queued_utterance.session_id
seat_live_run.session_id
room_membership.session_id
initiative.session_id
turn_artifact.session_id
motion.session_id
dest_job.session_id
stream.session_id
             ↓
      voice_session.id
```

There is no single giant TypeScript `Room` domain class. The aggregate is
relational and distributed across server modules, with `sessionId` as the
common boundary.

### Step 7: entering reconstructs the room

`enterRoom(id)` requests `/api/session?id=<id>`. The API checks ownership,
selects the session, and calls `sessionJson()`.

`sessionJson()` enriches the row with:

- active and default seat labels;
- current room seats;
- count of open motions.

`attachSession(session, true)` then:

1. stores the room and its ID;
2. restores Voice/Log and Talk/Type;
3. installs its roster;
4. switches to the room plate;
5. loads the complete turn tape;
6. loads queue and running state;
7. restores paused/listening behavior and arms the correct ear.

### Step 8: the ordered tape and attached state are restored

`GET /api/session/[id]/turns` calls `turnsAfterSeq()` in
`src/server/turns-read.ts`. It selects room turns ordered by application
sequence, hangs attachments from `turn_artifact`, and returns:

- turns;
- motion cards;
- live and completed streams.

Subsequent reads send `afterSeq=<last sequence>` and merge results by turn ID.
This permits replay and duplicate delivery without duplicating the visible
message.

### Step 9: the room opens a resumable realtime wire

While an entered room is mounted, `Room.tsx` fetches:

```text
GET /api/session/<id>/events?afterSeq=<last seen>
```

The route:

1. catches up missed turns, backlog, ticket, stream, and motion state;
2. opens a Postgres `LISTEN travis_room`;
3. filters notifications by this room ID;
4. rereads durable state after each notification;
5. emits named Server-Sent Events;
6. sends a heartbeat;
7. ends by the Vercel 60-second cap, after which the client reconnects.

Writers call `notifyRoom(sessionId)` only after durable writes. The
notification is a wake-up signal; it is not treated as the product state.

### Step 10: the UI applies event projections

`applyRoomEvent()` maps named events to the corresponding React projection:

- `turn` → merge into the tape;
- `backlog` → replace backlog rows and motion count;
- `ticket` → refresh the open initiative;
- `stream` → refresh live and completed episodes;
- `queue` or `queued` → refresh per-seat waiting work.

If the wire fails, `fallbackCatchUp()` performs incremental HTTP reads. Losing
one event connection therefore does not destroy the workspace.

### Step 11: durable writers wake the room

The canonical turn insertion path in `src/server/seat-pipe.ts`:

1. obtains a per-session sequence lock;
2. calculates the next turn sequence;
3. inserts `voice_turn`;
4. calls `notifyRoom(sessionId)`.

The required ordering is:

```text
allocate order → persist → notify
```

Initiative, stream, and motion writers use the same room notification helper.

### Step 12: Leave and End follow different paths

`leaveRoom()` tears down local speech, Live, queue displays, and selected room,
then returns to the index. It does not mutate the room lifecycle.

`closeRoom()` PATCHes `{ status: "ended" }`. `endRoom()` then:

- writes `status = ended`;
- writes `ended_at`;
- clears the Live resume handle;
- stamps `left_at` on every open membership.

## Persisted and local state

Persisted:

- identity, title, owner, and lifecycle;
- Voice/Log and Talk/Type;
- active/default destination and members;
- turns, jobs, queues, streams, initiatives, artifacts, and motions.

Local:

- unsubmitted draft;
- currently open door;
- selected message;
- temporary scroll position;
- expanded artifact;
- streaming buffers not yet committed.

## Complete path

```text
TravisApp → Room → GET /api/rooms
    ↓
operator scope → voice_session + membership + last activity
    ↓
RoomIndex → Enter
    ↓
GET /api/session + GET /turns + GET /queue
    ↓
attachSession restores the workspace
    ↓
GET /events catches up, then LISTENs to travis_room
    ↓
durable writer → Postgres commit → pg_notify(room ID)
    ↓
event route rereads truth → SSE
    ↓
React merges the affected projection
```

## Implementation caveats

- `src/components/Room.tsx` currently coordinates most room behavior in one
  very large client component.
- The server is more decomposed across membership, turns, bus, seat pipe,
  initiatives, streams, artifacts, motion, and operator modules.
- The event route is capped at 60 seconds and therefore depends on correct
  catch-up and reconnection.
- The room is the product aggregate even though the historical table name
  remains `voice_session`.

---

# 2. Multimodal conversational interface — Voice and Log

## What it ultimately is

**A multimodal session interface with a voice-primary face and a durable
transcript/composer face.**

Voice and Log are not two products or two conversations. They are two
interfaces over the same room, tape, queue, destination, and agent work.

## UI pass

### Voice

Voice presents:

- the listening orb;
- listening, paused, reconnecting, or Live status;
- the accumulated but uncommitted draft;
- a quiet indication of running work or new reports;
- queue chips;
- a **View log** door.

The voice face deliberately avoids the full thread and secondary controls.

### Log

Log presents:

- the ordered room tape;
- user and agent authorship;
- replies and attachments;
- completed Stream cards;
- per-seat queue controls;
- **Talk** and **Type** input modes;
- a return to Voice.

### Shared behavior

Switching modes does not mint another session. A Type send, Talk send, or Voice
send writes into the same `voice_turn` sequence and reaches the same routing
and execution systems.

## Code pass

### Step 1: the room persists its display and input modes

`voice_session` stores:

```ts
viewMode: text("view_mode").default("voice")
logSubmode: text("log_submode").default("talk")
```

`attachSession()` restores them into React state. A mode switch PATCHes
`/api/session/[id]`, so refresh and re-entry preserve the operator's chosen
face.

### Step 2: Voice renders a presence surface

When `viewMode === "voice"`, `Room.tsx` renders the `voice-presence` boundary:

- the orb invokes `togglePause()`;
- the status line comes from current presence and Live state;
- the draft is the speech accumulated so far;
- `QueueChips` projects waiting work;
- View log invokes `switchViewMode("log")`.

The draft remains local until committed by the end-of-turn protocol.

### Step 3: Log renders the tape and an input submode

When `viewMode === "log"`, the `thread` boundary maps the same durable turns
into user bubbles, seat posts, statuses, quote rails, attachments, and Stream
cards.

The `log-submode-toggle` selects:

- **Talk** — Web Speech capture with Pause/Resume;
- **Type** — `LogComposer`, mentions, reply target, and explicit Send.

### Step 4: switching modes also arbitrates the microphone

`switchViewMode()`:

1. marks reports seen when leaving Log for Voice;
2. stops Travis Live when leaving Voice;
3. writes the new `viewMode` to the session API;
4. asks `modeSwitchEarAction()` whether to keep, release, or arm capture.

Log Type has no microphone. Log Talk normally uses Web Speech. Voice addressed
to Travis targets Realtime Live.

### Step 5: each input mode enters the same room pipeline

```text
Voice/Talk speech
  → local draft
  → conductor match
  → POST /finalize

Type
  → LogComposer
  → POST /send

OpenAI Realtime transcript
  → POST /live/transcript
```

All three paths authenticate the room, write or route room-scoped turns, and
surface updates back through the same tape and room wire.

## Persisted and local state

Persisted:

- room mode and Log submode;
- committed turns;
- queues, jobs, streams, and acknowledgements.

Local:

- draft;
- presence;
- Web Speech and Live handles;
- transient streamed text;
- scroll and selected reply target.

## Complete path

```text
voice_session.view_mode + log_submode
               ↓
             Room
      ┌────────┴────────┐
      │                 │
 Voice presence      Log thread
 Live or STT         Talk or Type
      │                 │
 /live/transcript   /finalize or /send
      └────────┬────────┘
               ↓
     same tape, routing, queue, and streams
```

## Implementation caveats

- `src/components/VoiceSession.tsx` is a legacy/parallel shell; the mounted
  product path is `TravisApp → Room`.
- The thought-circle strip is primarily a seat/stream affordance, not a raw
  chain-of-thought display.
- Mode equivalence depends on server paths remaining behaviorally aligned;
  several historical hotfixes corrected Voice and Type using different brains.

---

# 3. Explicit end-of-turn protocol — conductor phrases

## What it ultimately is

**End-of-utterance phrase spotting used as a hands-free commit protocol.**

A configured phrase such as “I'm done” closes accumulated speech as one user
turn. It replaces mandatory tap-to-send without treating every pause as the
end of an instruction.

## UI pass

- Voice and Log Talk show a growing draft but no ordinary text Send button.
- Saying a configured done phrase commits that draft.
- The conductor phrase itself is removed from the useful prompt.
- If Web Speech holds the phrase as an interim result, Travis waits for the
  recognition end event instead of losing it.

## Code pass

### Step 1: phrases come from durable configuration

`turn_conductor_phrase` stores active phrases. `Room.tsx` fetches
`/api/conductor-phrases` and puts them in `phrasesRef`.

A React ref is used because speech callbacks need the latest phrase list
without waiting for a component rerender.

### Step 2: `conductor.ts` performs end-anchored matching

`matchConductorPhrase()`:

- normalizes STT variants such as “I am done”;
- searches only at the end of the utterance;
- returns both the match and the prompt with the phrase removed.

The end anchor prevents a sentence that merely mentions a conductor phrase
from committing prematurely.

### Step 3: the two-phase gate handles Web Speech behavior

`conductorGate()` runs during `onresult`. It may:

- commit immediately when the done phrase is safely final;
- hold when the phrase exists only in interim speech;
- continue accumulating when no phrase matches.

`conductorOnEnd()` runs when recognition stops. It performs the second chance
for a phrase that Chrome never promoted to a final transcript.

### Step 4: committed speech enters `finalizeUtterance()`

`Room.tsx` prevents duplicate concurrent finalization with refs such as
`finalizingRef`, `sendingRef`, and a short duplicate-send window. It then posts
the accumulated text to `/api/session/[id]/finalize`.

### Step 5: the server verifies the boundary again

The finalize route:

1. checks room ownership;
2. reads the utterance;
3. applies hear/skip and router-state branches where applicable;
4. matches and strips the conductor phrase;
5. returns `matched: false` when there is no valid boundary;
6. dispatches any missed stream intent as backup;
7. synthesizes the Travis wrap through `pipeTravisText`.

The server does not trust the client alone to define a committed turn.

### Step 6: Live speech reaches the same boundary

`liveWrapUtterance()` recognizes the done phrase in OpenAI Realtime transcript
callbacks and hands the resulting utterance to the same client finalize
function. The intended result is one commit protocol across STT and Live.

## Persisted and local state

Persisted:

- active conductor phrases;
- the turn created after successful finalization.

Local:

- accumulated final/interim speech;
- phrase ref;
- finalization and dedupe refs.

## Complete path

```text
Web Speech or Live transcript
      ↓
accumulate final + interim text
      ↓
conductorGate during result
or conductorOnEnd after recognition ends
      ↓
finalizeUtterance
      ↓
POST /api/session/:id/finalize
      ↓
server match and strip
      ↓
write/route/synthesize the committed room turn
```

## Implementation caveats

- The conductor determines **when the turn ends**. It does not decide who
  should handle the instruction; routing and stream-intent classification are
  separate.
- Finalize is primarily the Voice wrap/synthesis door. Live transcript and
  Type may already have started specialist work before the wrap.
- Reliability at this boundary was still an active seam in the final Packet
  023 work: a dest could leave while Voice failed to POST finalize.

---

# 4. Role-based multi-agent system

## What it ultimately is

**A multi-agent orchestration system with stable organizational roles.**

Travis is the conversational facilitator. Technical Architect, Systems
Analyst, and Engineer are specialist roles executed by Cursor Cloud Agents.
The operator addresses a responsibility rather than managing raw model runs.

## UI pass

- The roster displays Travis and the specialists present in this room.
- Seat marks identify who authored each reply.
- Type can explicitly mention a room member.
- Voice can call a role by name.
- Active, idle, queued, and working states appear per participant.
- Only Travis owns the ordinary conversational voice. Specialist bodies land
  in the Log and may be played on demand.

## Code pass

### Step 1: `agent_binding` represents an addressable agent

`src/server/db/schema.ts` stores:

- `seatKey` — routing slug;
- `label` — glass name;
- `cursorAgentId` — durable `bc-…` Cursor identity;
- `runtime`;
- `active`;
- `protocolPath`.

The row is data, not a hard-coded React persona.

### Step 2: room membership chooses which agents participate

`room_membership` associates bindings with a `voice_session`. An open
membership has no `leftAt`. `roomSeats()` projects the current cast into the
room response.

This separates:

- the global catalog of known bindings;
- the subset participating in this room.

### Step 3: stable role keys drive routing and presentation

`src/lib/seats.ts` defines the core seat order. `src/lib/router.ts` recognizes
role aliases such as Technical Architect, PM, SA, and Engineer.

The room stores `activeBindingId`, while each turn stores `seatKey`. The
interface can therefore show both current destination and authorship.

### Step 4: Travis and specialists use different execution paths

Travis invokes the Deep Agents/LangGraph path in
`src/server/travis-deep-agent.ts`, with Travis tools and room-scoped memory.

Specialists pass through `dispatchToSeat()` and
`src/server/cursor-port.ts`, which resumes the bound Cursor Cloud Agent and
starts a run.

`dispatchToSeat()` guards against trying to Cursor-send Travis itself.

### Step 5: specialist results return as room turns

Cursor stream events are consumed in `seat-pipe.ts`. User-facing assistant
content becomes `agent_post` with the specialist's seat key. The room wire
then projects the result into the Log.

## Persisted and local state

Persisted:

- binding identity, role key, label, protocol, and Cursor ID;
- room membership;
- active/default destination;
- authored room turns;
- per-agent run, queue, job, and stream state.

Local:

- displayed roster;
- transient stream buffers and activity glow;
- current mention selection.

## Complete path

```text
operator addresses a role
      ↓
room membership + role aliases
      ↓
AgentBinding
      ├── Travis → Deep Agent + LangGraph
      └── specialist → Cursor Cloud Agent
                              ↓
                      agent_post in room tape
                              ↓
                      Log, Stream, readback
```

## Implementation caveats

- Some UI and helper code still assumes the familiar PM/SA/Engineer set even
  though room membership supports arbitrary bindings.
- The role key `pm` is retained internally while the product label is
  **Technical Architect**.
- A static catalog binding and a living seated person are not interchangeable;
  the latter is the valid destination.

---

# 5. Dynamic role binding — seat and sit

## What it ultimately is

**Dynamic role assignment: binding a live agent identity to a reusable
organizational role and its protocol.**

A seat is the role interface. Sitting assigns a particular Cursor agent the
protocol that makes it the current living occupant.

## UI pass

- The roster distinguishes seated, idle, busy, and unseated members.
- A role name such as Engineer remains stable even if its underlying agent is
  replaced.
- Add/Create/Bind establishes a person; Sit gives that person a house role.
- Role-directed work can reuse an idle occupant or create another disposable
  occupant when the role needs capacity.

## Code pass

### Step 1: protocols have canonical paths

`src/lib/protocol-path.ts` maps supported roles to paths such as:

```text
/protocols/pm.md
/protocols/sa.md
/protocols/engineer.md
```

The PM path remains historical while its glass label is Technical Architect.

### Step 2: `sitBinding()` persists the assignment

`src/server/sit.ts` validates the requested role, updates
`agent_binding.protocol_path`, and calls `handProtocol()`.

Persisting the path makes the seat discoverable after the process or browser
that performed the sit has gone away.

### Step 3: `handProtocol()` gives the agent its working context

It reads the house location, logging law, and role protocol from the OS house
through `src/server/os-house.ts`. It assembles those documents into a handoff
and dispatches it to the Cursor binding.

The sit handoff does not silently queue behind unrelated work; failure is
reported so that a supposedly seated agent is not treated as ready when it
never received its role.

### Step 4: `livingSeated()` finds the current occupant

`src/server/living-seated.ts` searches active bindings on the requested
protocol path, requires a real living Cursor ID, skips the static catalog PM,
and chooses the newest suitable binding.

### Step 5: role resolution can reuse or spin

`resolveRoleDest()` in `sit.ts` searches in this order:

1. suitable idle room member;
2. living seated binding;
3. suitable catalog/member fallback;
4. `spinSeatedRole()` when another occupant is required.

Spinning creates/binds the agent, adds room membership, and performs the sit.

## Persisted and local state

Persisted:

- `agent_binding.protocol_path`;
- Cursor agent ID and label;
- room membership.

Ephemeral:

- the in-progress handoff;
- temporary resolution result used by the current dispatch.

## Complete path

```text
binding + requested role
      ↓
parse protocol path
      ↓
UPDATE agent_binding.protocol_path
      ↓
read house + logging + role protocol
      ↓
dispatch protocol to Cursor agent
      ↓
livingSeated(path) can resolve that occupant later
```

## Implementation caveats

- `seatKey` is globally unique on a binding; room participation is a separate
  membership relation.
- Directly binding a `bc-…` identity does not by itself make it seated. The
  protocol path carries that meaning.
- Role dispatch may create a disposable occupant rather than queueing behind a
  busy role. That is a product choice, not generic queue behavior.

---

# 6. Intent-based agent routing — dest

## What it ultimately is

**Intent- and addressee-based routing from a conversational instruction to a
specific agent binding.**

Dest is the resolution layer between “Engineer, do this” and the exact living
Cursor agent that should receive it.

## UI pass

- Voice call-by-name changes or selects the addressee.
- Type exposes room-member destination chips and `@` affordances.
- Replying to a specialist post can route back to that post's author.
- The header reports `via <active label>`.
- A routing failure produces a truthful nobody/refusal receipt rather than
  pretending the work left.

## Code pass

### Step 1: call-by-name parses speech

`parseCallByName()` in `src/lib/router.ts` recognizes role and seat aliases and
separates:

- switch-only vocatives;
- an addressee plus useful prompt;
- ordinary speech with no route change.

The live transcript route uses this result before dispatch.

### Step 2: Type and reply targets become destination keys

`src/server/dest-resolve.ts` combines:

- explicit Type chips;
- role mentions;
- the author of `referenceTurnId`.

This produces the set of logical destinations for the send.

### Step 3: logical keys resolve to actual bindings

`resolveDestBinding()` first checks open room membership. Role keys may invoke
`resolveRoleDest()`, which applies living-seat and spin rules.

The output is an `AgentBinding`, not just the string `"engineer"`.

### Step 4: dest-gate decides whether the work should leave

The Travis-tool path uses `classifyDestPrompt()` in
`src/lib/dest-gate.ts` on the actual ask. It distinguishes:

- work that belongs to another seat;
- Travis's own work;
- no valid recipient.

This prevents Travis from delegating its own house operations merely because a
role name appeared in contextual text.

### Step 5: the resolved binding enters the leave path

Fast Voice/Type paths call `writeAndLeaveDest()`. Tool-driven delegation calls
`handToDest()`. Both eventually dispatch to the resolved binding and persist
room-scoped work state.

## Persisted and local state

Persisted:

- active and default binding on the room;
- reply reference on the turn;
- binding and membership;
- resulting job/queue/run state.

Ephemeral:

- parsed mentions and current routing decision;
- temporary resolved binding.

## Complete path

```text
spoken name, Type chip, or reply target
      ↓
router / destKeysForSeat / reference author
      ↓
open room member or role resolution
      ↓
AgentBinding
      ↓
dest-gate where applicable
      ↓
writeAndLeaveDest or handToDest
```

## Implementation caveats

- Travis currently has two related leave paths: fast transcript/Type
  `writeAndLeaveDest` and tool-level `handToDest`.
- Dest-gate and stream-intent are different classifiers. Dest-gate decides
  whether to delegate; stream-intent recognizes conversational pivots.
- Routing uses aliases, deterministic parsing, and database relations rather
  than embeddings.

---

# 7. Asynchronous job dispatch — dispatch and leave

## What it ultimately is

**Asynchronous task submission: start specialist work, persist its identity,
and return control before the work finishes.**

The phone request is not the lifetime of the Cursor run.

## UI pass

- A delegated instruction quickly appears in in-flight state.
- The room remains usable while the specialist works.
- Other agents can be addressed without waiting for the first result.
- The eventual result can arrive after the original HTTP response has ended.

## Code pass

### Step 1: `writeAndLeaveDest()` files work first

`src/server/dest-leave.ts` inserts or reuses a `dest_job` before waiting on slow
role resolution or Cursor startup. That makes the handoff visible as durable
work.

### Step 2: dispatch races a bounded handoff window

The function starts the actual handoff and races it against
`LEAVE_HANDOFF_MS`. If Cursor startup is slow, the route can still return a
started state backed by the filed job.

### Step 3: `dispatchToSeat()` consumes only to `run_started`

`src/server/dispatch.ts` opens the Cursor generator and advances it until:

- the SDK reports `run_started`;
- an early busy/error condition occurs;
- a small step guard is reached.

On `run_started`, it persists the user turn and `seat_live_run`.

### Step 4: continuation becomes background work

The dispatcher invokes:

```ts
void continueDestStream(...)
```

`void` here intentionally means the current function does not await completion.
`continueDestStream()` opens the Stream episode and continues consuming Cursor
events into durable state.

### Step 5: room delivery no longer depends on the original request

Cursor events produce stream rows and ultimately agent posts. Those writes
wake the room wire, allowing the result to appear through another request.

## Persisted and local state

Persisted:

- `dest_job`;
- `seat_live_run`;
- Stream episode and events;
- triggering user turn;
- eventual specialist post.

Ephemeral:

- original HTTP/SSE response;
- generator handle on the current server process.

## Complete path

```text
send/transcript route
      ↓
insert dest_job
      ↓
dispatchToSeat
      ↓
Cursor run_started
      ↓
persist seat_live_run + user turn
      ↓
return control to phone
      └──────── continueDestStream in background
                           ↓
                    Stream + final agent_post
                           ↓
                       room wire
```

## Implementation caveats

- Serverless execution is not a durable worker system. The harvester and stored
  run ID are required when a background stream dies with the isolate.
- Founder-operations errors may deliberately remain visible as filed work so
  the queue does not falsely look empty.
- The final September Voice failure sat at the join between early dest leave
  and the later Travis finalize/wrap.

---

# 8. Durable work order — `dest_job`

## What it ultimately is

**A durable outbound work-order record with an explicit lifecycle.**

`dest_job` is the room's record that an instruction was delegated to a
particular binding, independently of the transient HTTP request or Cursor
stream.

## UI pass

- In-flight shows the responsible seat, ask text, status, and heartbeat age.
- Stream episodes can link to the job that caused them.
- Travis's `work_in_flight` tool reads the same records.
- A job can remain visible while Cursor is still connecting or after the
  originating request has gone away.

## Code pass

### Step 1: the schema records identity and lifecycle

`dest_job` stores:

- room, binding, optional initiative, and user-turn IDs;
- JSON payload containing the ask;
- idempotency key;
- timeout and heartbeat;
- status and creation time.

Statuses are:

```text
created
dispatched
in_progress
completed
failed
timed_out
```

### Step 2: insertion is idempotent

`insertDestJob()` in `src/server/dest-job.ts` derives an idempotency key from
binding and prompt grain. A duplicate handoff can recover the existing job
rather than multiplying identical open rows.

### Step 3: two leave paths establish the initial state

- `writeAndLeaveDest()` files `dispatched` early.
- `handToDest()` commonly files `created`, then advances it after dispatch.

Both refer to the same product object even though their timing differs.

### Step 4: heartbeat and live-run inspection advance the job

Queue/reaper code checks open jobs and known Cursor runs. A live run can move a
job into `in_progress` and refresh its heartbeat.

### Step 5: terminal paths close it

Completion, stream error, cancellation, timeout, or harvest calls job-closing
helpers. The terminal status remains queryable after the live process is gone.

### Step 6: changes follow the existing work

SCP-035 deliberately leaves `parent_id` unused. A conversational correction
is a follow-up on the existing open binding/job context rather than a new
child-job graph.

## Persisted and local state

All authoritative job state is in Postgres. The browser only mirrors it through
queue and room-event responses.

## Complete lifecycle

```text
new leave
  ↓
created or dispatched
  ↓ Cursor run + heartbeat
in_progress
  ├── completed
  ├── failed
  └── timed_out
```

## Implementation caveats

- The two insertion paths use slightly different initial statuses.
- A `dest_job` is not the same as a queued utterance or a Stream episode:
  the job is the work order, the queue is waiting input, and Stream is the
  observable execution episode.
- Default timeout is two minutes even though a Cursor run can outlive an
  individual serverless request.

---

# 9. Per-agent work queue

## What it ultimately is

**A session-scoped FIFO mailbox per agent binding.**

When a particular agent cannot accept another instruction immediately, Travis
persists the follow-up instead of dropping it or requiring the operator to
remember it.

## UI pass

- Voice shows quiet queue chips such as waiting work for Engineer.
- Log exposes queued lines with manual Send and Delete controls.
- The In-flight door separates running work from waiting work.
- Queue state is grouped by addressee.

## Code pass

### Step 1: busy state is verified, not assumed

`seatHasActiveRun()` in `seat-pipe.ts` combines:

- the local `seat_live_run` row;
- Cursor's current active-run discovery.

If the row is stale and Cursor is actually idle, it clears/claims the stale
state so the next instruction sends rather than false-queues.

### Step 2: busy dispatch becomes a durable queue row

`enqueueOnSeat()` writes `queued_utterance` with:

- room;
- binding;
- seat key;
- per-seat sequence;
- text;
- optional initiative.

Travis itself is explicitly not queueable.

### Step 3: snapshots group work by seat

Queue server helpers read waiting rows and live-run state, then
`groupQueueSeats()` produces the shape used by QueueChips, QueueLog, and
InFlightDoor.

### Step 4: drain occurs when the binding is ready

`drainHead()` removes the first item and invokes `pipeOneSend()`. The room event
route also periodically runs `inspectAndNudgeQueue()` and
`drainReadySeats()` while the wire is alive.

### Step 5: follow-ups preserve work identity

When a destination has an open job, `destEnqueueIfBusy("follow-up")` queues the
new line for the same binding rather than spinning a separate job.

## Persisted and local state

Persisted:

- queued utterances;
- known live run;
- optional initiative association.

Local:

- grouped queue display;
- manual queue action state.

## Complete path

```text
instruction → resolved binding
      ↓
seatHasActiveRun
  ├── idle → dispatch now
  └── busy → INSERT queued_utterance
                    ↓
              queue snapshot → UI
                    ↓
              Cursor becomes idle
                    ↓
              drainHead → send
```

## Implementation caveats

- `seat_live_run.binding_id` is globally unique, so one binding cannot safely
  run independently in two rooms at once.
- Queue draining is attached to API/wire activity rather than a dedicated
  durable worker service.
- Busy role dispatch may spin another seated role instead of queueing; the
  queue primarily represents a particular person's mailbox.

---

# 10. Job-progress view — Stream

## What it ultimately is

**A persisted activity stream and progress view for one execution episode.**

A Stream is the observable history of an agent working: messages, process/tool
events, and thought-status grain, separated from the main conversational tape.

## UI pass

- A working seat mark can glow and open its live Stream.
- In-flight and roster surfaces link to the episode.
- A completed Stream card hangs near the corresponding final post.
- Ticket detail can show Stream cards associated with that initiative.
- Process and thought detail remain available without flooding Voice.

## Code pass

### Step 1: `stream` represents one episode

The row links:

- room and binding;
- triggering user turn;
- optional close turn;
- optional dest job and motion;
- Cursor run ID;
- live/completed/failed status.

A unique live-row rule prevents two simultaneous Stream episodes for the same
room and binding.

### Step 2: `openStream()` creates or enriches the live episode

`src/server/stream.ts` reuses an existing live stream where appropriate,
otherwise inserts one from the triggering user turn. It can attach a job,
motion, or run ID as those become known.

### Step 3: Cursor events become ordered `stream_event` rows

`driveDestCursorEvents()` in `seat-pipe.ts` classifies Cursor ingress:

- assistant-facing text → message;
- tools/process → process;
- thinking/status → thought.

Each event receives a stream-local sequence.

### Step 4: the answer closes the episode

When the specialist's durable `agent_post` lands, `closeStream()` sets
`closeTurnId`, status, and terminal time. The card is therefore attached to the
actual answering post rather than whichever room message happened to be
latest.

### Step 5: room reads split live episodes from cards

`listSessionStreams()` returns:

- live streams for active seat affordances;
- completed card-eligible streams for the tape and ticket.

The room wire emits a new stream projection after mutations.

## Persisted and local state

Persisted:

- Stream episode;
- ordered events;
- links to trigger, answer, job, motion, and run.

Local:

- live Stream door selection;
- transient deltas while an event is still arriving;
- seat glow.

## Complete path

```text
user turn → openStream(live)
      ↓
Cursor run events
      ↓
stream_event(message | process | thought)
      ↓
specialist agent_post
      ↓
closeStream(closeTurnId, completed)
      ↓
Stream card attached to the answer
```

## Implementation caveats

- A Stream is not the durable job itself; it is the observable episode.
- A failed episode without an answer may be closed without a card.
- Live glow, job heartbeat, and Cursor run status are related but distinct
  signals and can temporarily disagree during failure.

---

# 11. Conversational command routing — new, change, cancel, talk

## What it ultimately is

**Lightweight natural-language intent classification over active work.**

The operator can start, amend, cancel, or merely discuss work without filling
out a task form.

## UI pass

The classifier has almost no direct UI of its own. Its effects are visible:

- “Engineer, …” starts work;
- “Actually, use the other approach” follows the open work;
- “Cancel that” cancels the targeted run;
- “What did we do yesterday?” updates/consults the Travis thread;
- ordinary conversation remains talk.

## Code pass

### Step 1: open jobs provide the active-work candidates

Callers load `listOpenDestJobs(sessionId)`. The pure classifier receives those
rows alongside the current phrase.

### Step 2: `streamIntent()` performs deterministic classification

`src/lib/stream-intent.ts` recognizes:

- change pivots such as “actually,” “wait,” and “instead”;
- cancellation phrases;
- walk-back phrases;
- named seats through the existing router.

It token-matches a pivot against open job text and labels. It does not query a
model or vector store.

The output is one or more values shaped like:

```ts
{ kind: "new" | "change" | "cancel" | "talk", target?: ... }
```

### Step 3: ambiguous cases refuse to guess

With one open job, a change can safely target it. With several jobs, a unique
token match is required. Otherwise the phrase falls back to talk.

### Step 4: `dispatchStreamIntents()` performs the side effect

`src/server/stream-dispatch.ts` maps classification to existing primitives:

- new seat → `handToDest`;
- new/change Travis thread → Deep Agent `mode: "update"`;
- change destination → Cursor follow-up on the same binding;
- cancel destination → `cancelCursorRun`;
- talk → no dispatch side effect.

### Step 5: callers prevent duplicate dispatch

Live and Type may already have routed a named destination through the direct
leave path. They pass skip seat/binding sets so stream-intent does not start the
same leave a second time.

Finalize uses `backupOnly: true`, filling a missed leave rather than repeating
work that the live phrase already started.

## Persisted and local state

Persisted inputs/effects:

- open jobs;
- Cursor follow-up/cancellation;
- LangGraph thread update;
- any new delegated work.

Ephemeral:

- phrase tokens;
- classification result.

## Complete path

```text
phrase + open dest jobs
      ↓
streamIntent()
  ├── new seat → handToDest
  ├── change dest → Cursor follow-up
  ├── cancel dest → cancelCursorRun
  ├── new/change Travis thread → Deep Agent update
  └── talk → no work side effect
```

## Implementation caveats

- This is deterministic command routing, not semantic planning.
- A change does not create a `parent_id` job tree; it follows up on the
  existing binding and job context.
- “I'm done” belongs to the conductor, not this classifier.

---

# 12. Append-only conversation log — room tape

## What it ultimately is

**An ordered event log per room, used as the authoritative visible
conversation.**

Voice and Log are projections over one sequence of durable turns. User lines,
specialist replies, Travis replies, statuses, references, and acknowledgement
state all share that tape.

## UI pass

- Log shows turns in stable order across refreshes.
- User turns align right; agent turns align left with seat authorship.
- References produce quote rails.
- Status turns are quiet operational lines.
- Unheard reports receive a New divider.
- Backlog-stamped user turns receive a ticket marker.
- Attachments hang under the post that produced them.
- Requests and Look operate on turns from this same tape.

## Code pass

### Step 1: `voice_turn` carries the conversation grain

The schema stores:

- room ID and monotonic `seq`;
- legacy role plus current `kind`;
- seat author/addressee;
- referenced turn;
- speakability and thought status;
- text and time;
- initiative and heard state.

`TurnKind` distinguishes:

```text
user
agent_thought
agent_post
status
travis_prompt
```

### Step 2: canonical inserts allocate a room sequence

`insertTurn()` in `seat-pipe.ts` runs inside `withSeqLock(sessionId, ...)`.
It calculates the next room sequence, inserts the row, and notifies the room.

The sequence lock prevents two concurrent writers in the same process from
assigning the same order.

### Step 3: specialized writers preserve the same tape model

Helpers insert:

- user turns;
- specialist or Travis posts;
- status turns;
- Travis prompts.

Streaming specialist content may update an in-progress post row as its text
grows, but it remains one authored turn in the room sequence.

### Step 4: reads are ordered and incremental

`turnsAfterSeq()` selects this room's rows in ascending `seq`. With `afterSeq`,
it returns only later rows plus still-streaming thought rows.

`attachmentsForTurns()` decorates each result with persisted artifact metadata.

### Step 5: the client merges by identity

`Room.tsx` uses `mergeTurnsById()`. Duplicate delivery from the original send,
the room wire, or reconnect catch-up replaces the same turn rather than adding
another bubble.

### Step 6: secondary products query the tape

- Requests filters `kind === "user"`.
- Look references selected turn IDs.
- Hear/Skip updates `heardAt`.
- initiative stamps connect a founding line to Backlog.
- room context and dest print read bounded turn windows.

## Persisted and local state

Persisted:

- complete turn identity, order, text, kind, author, references, work and
  acknowledgement links.

Local:

- current merged turn array;
- optimistic temporary turns;
- scroll position and selected turn.

## Complete path

```text
voice, type, Travis, Cursor, status producer
      ↓
insertTurn / streaming-post absorber
      ↓
voice_turn(session_id, seq, kind, seat_key, text, ...)
      ↓
/turns and room wire
      ↓
mergeTurnsById
      ↓
Log, Requests, Look, Backlog marks, Hear state
```

## Implementation caveats

- “Append-only” is the conceptual rule; an in-progress streamed post can be
  updated in place.
- The per-session promise lock is process-local. Database constraints and
  application deployment topology matter under true multi-isolate concurrent
  writes.
- The legacy `role` field remains alongside the more precise `kind`.

---

# 13. Realtime event subscription — room wire

## What it ultimately is

**Server-Sent Events backed by Postgres LISTEN/NOTIFY, with replay from durable
state.**

It is the room's live synchronization channel. Postgres notifications wake the
server, but the server rereads the database before telling the client what
changed.

## UI pass

Without refreshing, the entered room can receive:

- new turns written by another request;
- Backlog changes;
- current ticket changes;
- Stream and motion changes;
- queue updates.

When the wire breaks, the UI retains its last good state and catches up rather
than clearing the room.

## Code pass

### Step 1: the client resumes from its last turn

The Room effect computes `maxTurnSeq(turnsRef.current)` and passes it as both
`afterSeq` and `Last-Event-ID`. If a ticket is open, it includes `ticketId`.

### Step 2: the route emits an initial catch-up

`src/app/api/session/[id]/events/route.ts` calls `emitCatchUp()`:

- `turnsAfterSeq()` → `turn`;
- `listBacklog()` → `backlog`;
- `readInitiative()` → `ticket`;
- `listSessionStreams()` and `listMotionCards()` → `stream`.

Turn events include the turn sequence as the SSE event ID.

### Step 3: the route subscribes to Postgres

A dedicated `postgres` client executes:

```ts
listenSql.listen("travis_room", callback)
```

The callback ignores notifications whose payload is not the current room ID.
Matching notifications enqueue another catch-up after `lastSentSeq`.

### Step 4: publishers send only a room wake signal

`notifyRoom(sessionId)` executes:

```sql
SELECT pg_notify('travis_room', <session id>)
```

The payload does not attempt to carry the changed object. This avoids an
ephemeral pub/sub message becoming a competing source of truth.

### Step 5: framing and heartbeat keep the HTTP stream usable

The route emits standard SSE frames:

```text
id: 42
event: turn
data: {...}

```

It sends comment heartbeats every 15 seconds and serializes catch-up work so
overlapping notifications cannot interleave writes to the response.

### Step 6: queue reaping shares the live connection

Every two seconds the route inspects drainable seats and may advance queued
work, emitting queue events when state changes.

### Step 7: the client reconnects and falls back

The route declares `maxDuration = 60`. When it ends, the client loop reconnects
with the last sequence. On error, `fallbackCatchUp()` uses ordinary incremental
HTTP reads and waits before retrying.

## Persisted and local state

Persisted:

- all event payload truth in the ordinary Travis tables.

Ephemeral:

- Postgres notification;
- open SSE response;
- server `lastSentSeq`;
- client connection and parser buffer.

## Complete path

```text
durable write
      ↓
pg_notify("travis_room", sessionId)
      ↓
events route LISTEN callback
      ↓
reread turns/backlog/ticket/streams
      ↓
typed SSE frame
      ↓
Room.applyRoomEvent()
      ↓
React projection updates
```

## Implementation caveats

- Each open room wire consumes a dedicated Postgres listening connection.
- Queue side effects currently run from the subscriber route rather than a
  separate worker.
- Streaming post updates that bypass the canonical insert/notify path may wait
  for another wake or catch-up before appearing through this wire.

---

# 14. Persistent conversational memory — Travis thread

## What it ultimately is

**A durable LangGraph agent thread, checkpointed in Postgres and keyed by the
room ID.**

This is Travis's model-level conversational state. It complements, but does not
replace, the visible room tape.

## UI pass

There is no “memory” panel. Its effect is continuity:

- Travis can respond to follow-up discussion in the same room;
- walk-back questions can update/consult the existing thread;
- the same tools and virtual context files remain available across invokes.

The room tape remains the operator-visible record even when model state is
checkpointed separately.

## Code pass

### Step 1: `generateTravisText()` is the main entrance

`src/server/travis-openai.ts` dynamically imports the Deep Agent implementation
and passes the current room, prompt, and mode.

The dynamic import avoids loading the heavier Deep Agents dependency on routes
that do not need it.

### Step 2: the checkpointer uses its own Postgres schema

`src/server/travis-checkpointer.ts` creates a small `pg.Pool` and a LangGraph
`PostgresSaver` configured for schema `langgraph`. `setup()` ensures the vendor
checkpoint tables exist.

No `travis.thread` table was invented.

### Step 3: the Deep Agent is created with room-scoped capabilities

`invokeDeepAgent()` in `src/server/travis-deep-agent.ts` assembles:

- the OpenAI chat model;
- Travis system prompt;
- wrapped Travis tools;
- StateBackend virtual files;
- the Postgres checkpointer;
- middleware that refreshes dest context.

### Step 4: the room ID is the durable thread key

The invocation passes:

```ts
{
  configurable: {
    thread_id: params.sessionId
  }
}
```

All compatible invokes in one room therefore address the same checkpointed
graph state. A different room receives a different thread.

### Step 5: virtual files bring current product state into the invocation

`/print.md` and `/roster.md` are derived from the current room tape and roster.
Middleware refreshes them for model calls so checkpointed conversation does
not become the only context source.

### Step 6: modes distinguish update from synthesis

- `mode: "update"` adds information or performs work without owing a spoken
  wrap.
- `mode: "synthesize"` produces the normal Travis reply.

Stream-intent uses update for conversational amendments to the Travis thread.
Send/finalize ordinarily synthesize.

## Persisted and local state

Persisted:

- LangGraph checkpoints in `langgraph.*`;
- room tape and other Travis state in `travis.*`.

Ephemeral:

- current Deep Agent object;
- model request;
- current virtual-file materialization.

## Complete path

```text
/send, /finalize, or Travis-thread update
      ↓
generateTravisText
      ↓
room context + /print.md + /roster.md
      ↓
createDeepAgent(checkpointer, tools, middleware)
      ↓
agent.invoke(thread_id = sessionId)
      ↓
langgraph checkpoint persists
      ↓
optional synthesized agent_post on room tape
```

## Implementation caveats

- LangGraph memory and `voice_turn` are separate stores with different jobs.
- OpenAI Realtime audio does not itself become LangGraph state unless the
  transcript path invokes the Deep Agent.
- Missing `DATABASE_URL` prevents checkpointer creation and therefore the
  durable Travis think path.

---

# 15. Persistent execution context — Cursor agent thread

## What it ultimately is

**A durable vendor-hosted agent identity whose successive runs retain the
specialist's execution context.**

The room does not create a brand-new anonymous model completion for every
Engineer instruction. It resumes the bound Cursor Cloud Agent.

## UI pass

- A familiar room member can receive follow-ups over time.
- The phone hides raw `bc-…` IDs and run IDs.
- Busy, queued, running, cancelled, and returned states are shown as product
  state rather than Cursor API details.
- A specialist's answer returns under the same room identity.

## Code pass

### Step 1: the durable vendor identity is stored on the binding

`agent_binding.cursorAgentId` holds the `bc-…` identifier. Agent creation or
direct binding writes that identifier once.

### Step 2: each send resumes rather than recreates

`streamCursorReply()` in `src/server/cursor-port.ts` uses the Cursor SDK:

```text
Agent.resume(agentId)
  → agent.send(prompt)
  → run.stream()
  → run.wait()
```

The SDK object is connection-scoped, but the vendor agent ID and its run
history are durable at Cursor.

### Step 3: Travis records the particular run

As soon as send returns a run, `run_started` carries its ID.
`seat_live_run.cursor_run_id` records the exact in-flight run for this binding
and room.

### Step 4: the exact run can be harvested or cancelled

If the live stream dies, `harvestFinishedRun(runId)` asks Cursor for that
specific run rather than guessing the latest one. `cancelCursorRun()` targets
the same identity.

### Step 5: completion is translated into Travis state

Cursor events become Stream events and room turns. The durable Cursor context
remains external; the user-visible result is copied into the Travis tape.

## Persisted and local state

Persisted internally:

- binding-to-agent ID;
- known live run ID;
- resulting Travis Stream and turns.

Persisted externally:

- Cursor agent conversation and runs.

Ephemeral:

- resumed SDK agent object;
- current stream iterator.

## Complete path

```text
AgentBinding.cursorAgentId
      ↓
Agent.resume(bc-...)
      ↓
agent.send(prompt)
      ↓
run_started(runId) → seat_live_run
      ↓
run stream / wait / harvest / cancel
      ↓
Travis Stream + agent_post
```

## Implementation caveats

- Cursor context and Travis LangGraph context are not one memory.
- Missing keys or test stand-ins can produce synthetic behavior without a real
  resumed agent.
- A role may receive a new disposable Cursor identity; persistence attaches to
  the binding that was actually resolved.

---

# 16. Contextual output attachments — Artifacts

## What it ultimately is

**Message-associated attachment metadata whose file bytes remain in Cursor and
are fetched through Travis on demand.**

An image or file is not merely “somewhere in the run.” It belongs to the room
post that introduced it and can also be viewed from the room's Artifacts door.

## UI pass

- Agent posts render their attached images/files directly below the body.
- The header's Artifacts icon opens the room-level artifact list.
- Unseen counts distinguish new visual output.
- Opening or viewing can stamp `seenAt`.
- Ticket detail can include attachments associated with its posts.

## Code pass

### Step 1: the schema stores relationship metadata, not bytes

`turn_artifact` stores:

- turn, room, and binding;
- kind;
- Cursor path and filename;
- optional size and Cursor update time;
- created and seen times.

The `(turn_id, path)` uniqueness prevents duplicate hanging.

### Step 2: harvest runs after a specialist post

`harvestTurnArtifacts()` in `src/server/artifacts.ts` inspects:

- markdown image references in the post;
- process event bodies;
- Cursor's artifact listing for the run/agent.

It filters stale or irrelevant files and calls `hangPathOnPost()`.

### Step 3: `hangPathOnPost()` associates the path with the answer

The insert uses the final `agent_post.id`, preserving conversational context.
The room wire or later turn read then exposes the attachment with that turn.

### Step 4: reads decorate the tape

`attachmentsForTurns()` groups artifact rows by turn. `turnsAfterSeq()` adds
the resulting array to every returned turn.

### Step 5: a proxy retrieves the actual bytes

`GET /api/artifacts/[id]` validates access, resolves the artifact metadata, and
downloads from Cursor or redirects an appropriate external path.

Travis deliberately avoids persisting a short-lived signed URL.

## Persisted and local state

Persisted in Travis:

- attachment identity, relationship, metadata, and seen state.

Persisted externally:

- file bytes in Cursor Cloud.

Local:

- open Artifacts door and selected full artifact.

## Complete path

```text
Cursor run produces file/image
      ↓
specialist agent_post lands
      ↓
harvestTurnArtifacts
      ↓
turn_artifact(turnId, sessionId, path, kind, ...)
      ↓
/turns attaches metadata
      ↓
post attachment or Artifacts door
      ↓
/api/artifacts/:id proxies Cursor bytes
```

## Implementation caveats

- Artifact harvesting is non-fatal; the textual reply can land even if file
  discovery fails.
- Cursor remains required to serve the bytes later.
- Context files `/print.md` and `/roster.md` are a separate mechanism; they are
  model input bundles, not user output artifacts.

---

# 17. Conversational task projection — Backlog and initiatives

## What it ultimately is

**A room-scoped work-item projection created selectively from conversation.**

The Backlog is not a copy of every request. It records conversation that has
become durable, orchestrated work.

## UI pass

- The Backlog door offers All, In motion, and Initiatives.
- The empty state explicitly says “Not the request log.”
- Holding a user turn can promote it into an initiative.
- A marked user bubble links back to its ticket.
- Ticket detail shows founding line, seat work, posts, Streams, and artifacts.
- Done is an explicit initiative action; a seat reply does not automatically
  mean the work is complete.

## Code pass

### Step 1: `initiative` defines the durable ticket

It stores:

- room;
- unique founding turn;
- source (`hold` or `via_travis`);
- open/done status;
- title;
- lifecycle timestamps.

### Step 2: Hold promotes an existing turn

`POST /api/session/[id]/initiatives` validates the founding turn and calls
`holdInitiative()`. `insertOpen()` inserts the initiative, derives a title from
the line, stamps `voice_turn.initiativeId`, and notifies the room.

### Step 3: pass-on can create or reuse a ticket

Tool-driven delegation uses `ticketForHand()` and pass-on helpers. They avoid
minting from confirmation chatter, reuse named/current work where possible,
and associate queued lines and `dest_job` with the same initiative.

### Step 4: list projection derives state

`listInitiatives()` reads tickets and their stamped turns, derives lit seat
keys and “Next,” and supports time/query/status filters.

`listBacklog()` in `motion.ts` merges initiatives with Travis motions for the
combined All/In motion interface.

### Step 5: ticket reads reconstruct the work

`readInitiative()` gathers:

- founding turn;
- delegated user lines;
- specialist reports;
- streams;
- artifacts;
- derived next state.

When the client has a ticket open, the room wire includes refreshed ticket
detail in catch-up events.

### Step 6: lifecycle changes are explicit

Rename mutates title. Mark done writes `status = done` and `doneAt`.
Specialist completion does not silently close the ticket.

## Persisted and local state

Persisted:

- initiative row;
- founding and associated turn stamps;
- queued/job association;
- status and title.

Local:

- Backlog filter;
- list rows;
- selected ticket projection.

## Complete path

```text
room user turn
  ├── Hold gesture
  └── pass-on delegation
          ↓
initiative(foundingTurnId, source, status)
          ↓
stamp related turns/queue/jobs
          ↓
listInitiatives + listBacklog
          ↓
Backlog index and ticket detail
```

## Implementation caveats

- `motion` is a sibling process store merged into Backlog, not an initiative.
- A direct specialist instruction does not necessarily become an initiative;
  selection is intentional.
- Founding-turn uniqueness permits only one ticket for that exact line.

---

# 18. Searchable interaction history — Requests

## What it ultimately is

**A searchable query projection over user turns in the room tape.**

Requests is not a separate store. It answers “what did I ask?” without
mistaking every request for tracked work.

## UI pass

- Requests opens from the room header.
- It lists user-authored lines with timestamps.
- It supports text search and All/Today/Week windows.
- Its count and ordering are independent of Backlog state.

## Code pass

### Step 1: the Log already contains the client-side source rows

`RequestLogDoor` receives turns whose `kind === "user"` and applies shared
request-filter helpers for query and time window.

### Step 2: Travis has a server-side equivalent

`searchRequests()` in `src/server/room-read.ts` queries the newest bounded set
of user turns, then applies:

- text match;
- date window;
- result limit.

### Step 3: the `search_room` tool exposes it to Travis

`runTravisTool()` formats matching lines with times and returns them to the
Deep Agent. Travis can therefore answer historical questions using the same
room tape rather than inventing a second search index.

### Step 4: the room context can advertise the request log

Count/pointer helpers tell Travis that deeper room history exists beyond the
small Here window.

## Persisted and local state

Persisted:

- only the underlying `voice_turn` rows.

Local/derived:

- search text;
- date window;
- filtered request list.

## Complete path

```text
voice_turn where kind = user
      ├── /turns → RequestLogDoor → client filter
      └── searchRequests → search_room tool → Travis
```

## Implementation caveats

- Server search scans a bounded recent set rather than a full-text index.
- Client and server use equivalent filtering ideas but can differ temporarily
  if the client tape is stale.
- Requests and Backlog intentionally answer different questions.

---

# 19. Notification acknowledgement — Hear and Skip

## What it ultimately is

**A persistent read-receipt and notification-delivery workflow for specialist
reports.**

A specialist answer can exist on the tape without yet having been presented
to the operator in Voice. `heardAt` records that distinction.

## UI pass

- Voice can announce that a new report exists and ask whether to hear it.
- Hear delivers a gist or full form.
- Skip acknowledges the report without reading it aloud.
- Log marks the boundary of unseen reports as New.
- Viewing reports in Log can acknowledge them in bulk.

## Code pass

### Step 1: new-report rules identify eligible turns

`listUnheardReports()` selects specialist `agent_post` rows with
`heard_at IS NULL`, then applies product rules that exclude Travis and
non-speakable/catalog noise.

### Step 2: offer copy is derived, not stored

`offerForUnheard()` and `offerBeat()` combine seat and initiative context into
the short spoken invitation. The offer itself is ephemeral.

### Step 3: Voice and HTTP actions share serve functions

`POST /api/session/[id]/hear` supports offer, hear, full/verbatim, and skip.
Voice phrase parsing reaches the same `serveInvite()` behavior before ordinary
send routing.

### Step 4: Hear may summarize

For gist form, `summarizeSeatReply()` asks the text model for a compact
readback. Full form clips and reads the original post. Both then call
`markTurnsHeard()`.

### Step 5: Skip changes acknowledgement only

Skip writes `heardAt` while leaving the report body on the tape.

### Step 6: Log viewing also acknowledges

When switching from Log back to Voice, `Room.tsx` posts seen turn IDs to
`/heard`. A new founder turn may also clear older unheard reports before its
sequence, preventing stale New indicators.

## Persisted and local state

Persisted:

- `voice_turn.heard_at`.

Ephemeral:

- offer copy;
- pending-offer refs;
- client New IDs before refresh;
- generated gist audio/text.

## Complete path

```text
specialist agent_post(heardAt = null)
      ↓
offerBeat → spoken invitation
      ↓
Hear gist | Hear full | Skip | view in Log
      ↓
markTurnsHeard
      ↓
heardAt persisted; report remains on tape
```

## Implementation caveats

- Hearing is not task completion and does not close the initiative.
- A summarization failure still needs a truthful fallback and acknowledgement
  decision.
- The product intentionally excludes ordinary Travis posts from the specialist
  New-report queue.

---

# 20. Audio-session arbitration — one ear

## What it ultimately is

**A single-active-capture policy for competing microphone systems.**

At any moment, the microphone owner is one of:

- none;
- browser Web Speech recognition;
- OpenAI Realtime connecting;
- OpenAI Realtime connected.

Travis must never present itself as listening while two ears compete or no ear
actually owns the device.

## UI pass

- Voice shows listening, reconnecting, paused, or a named Live failure.
- Tapping the orb pauses/resumes capture.
- Log Type releases the microphone.
- Log Talk uses speech recognition.
- Voice addressed to Travis prefers Realtime Live.
- Returning from readback or a mode switch rearms the appropriate ear.

## Code pass

### Step 1: `ear.ts` expresses policy as pure functions

`src/lib/ear.ts` separates questions that would otherwise be tangled in React:

- `wantedEar()` — what should own the mic for this mode/destination;
- `whichEar()` — what currently owns it;
- `sttMayStart()` — whether Web Speech is permitted;
- `liveOwnsMic()` — whether callbacks must suppress STT;
- `modeSwitchEarAction()` — keep, release, or arm after a mode change;
- `sttOnEndAction()` — restart or wait after recognition stops;
- `liveCloseAction()` — reconnect or remain down after WebRTC closes.

These functions are deterministic and unit-testable.

### Step 2: `armEar()` executes the policy

`Room.tsx` reads the current mode, submode, destination, Live handle, and
recognizer state.

It then:

1. refuses to listen while room presence blocks it;
2. releases both systems in Log Type;
3. preserves an already-correct ear;
4. stops Live before arming STT;
5. halts STT before connecting Live;
6. falls back or reports a named Live miss.

Generation refs prevent an older asynchronous arm attempt from winning after a
newer mode change.

### Step 3: Web Speech owns the STT path

The browser recognizer accumulates final and interim transcripts. Its
callbacks check `liveOwnsMic()` and return early if Live is the current owner.

The `recognitionLiveRef` and watchdog distinguish a recognizer object that
exists from one that is actually receiving.

### Step 4: OpenAI Realtime owns the Live path

`src/lib/travis-live-client.ts`:

1. obtains a server-minted Live token/SDP answer;
2. creates `RTCPeerConnection`;
3. adds the real microphone track at the correct time;
4. receives Travis audio on the remote track;
5. exchanges transcript/control events on a data channel;
6. returns a `TravisLiveSession` handle to Room.

The API key never reaches the browser.

### Step 5: TTS and capture coordinate

Browser speech synthesis can cause recognition to stop. `sttOnEndAction()`,
`speechEngineBusy()`, delayed rearm, and the watchdog prevent Travis's own
readback from being transcribed or leaving STT dead.

### Step 6: lifecycle transitions release physical resources

Pause, Leave, End, Voice→Log Type, and component teardown stop recognition,
stop Live, cancel speech where appropriate, and release tracks.

## Persisted and local state

Persisted:

- room status;
- optional Realtime continuation handle.

Local:

- peer connection and media tracks;
- data channel;
- SpeechRecognition object;
- actual/wanted ear refs;
- arm generation;
- presence and Live status.

## Complete path

```text
view mode + input mode + active destination
      ↓
wantedEar / whichEar
      ↓
Room.armEar
  ├── none → stop STT + stop Live
  ├── STT → stop Live → startRecognition
  └── Live → halt STT → startTravisLive(WebRTC)
                         ↓
                transcript + audio output
```

## Implementation caveats

- Browser media behavior differs across Chrome/mobile environments, making
  timing bugs highly deployment-sensitive.
- The main Room path mostly uses actual speech-engine busy state rather than a
  reliably persisted `presence === "speaking"` transition.
- Hotfix 098 required many recuts across SDP formatting, ICE timing, mic
  replacement, and double-ear prevention. The simple product law rests on a
  fragile external media stack.

---

# 21. Text-to-speech output — readback

## What it ultimately is

**A dual-path spoken-output system: OpenAI Realtime for Travis facilitator
speech and browser TTS for controlled readback.**

Not every textual event is spoken. Short Travis beats can use the Live mouth;
specialist reports can be deliberately played or summarized.

## UI pass

- Voice hears Travis through the Live audio track when connected.
- New-report offers, gists, and short prompts are spoken.
- Every suitable agent post in Log has **Play reply**.
- While speech is playing, microphone capture is held and then restored.

## Code pass

### Step 1: browser TTS is wrapped as a promise

`facilitatorSpeak()` in `Room.tsx` creates a `SpeechSynthesisUtterance`,
applies voice preferences from `src/lib/speak-voice.ts`, and resolves on end or
error.

The promise lets callers await speech completion before rearming capture.

### Step 2: text is cleaned before readback

`speakableAgentPost()` in `src/lib/agent-post.ts` converts the supported
markdown/display structure into speech-safe text and omits image syntax.

### Step 3: Live is preferred for facilitator beats

`routeNewToTravis()` checks the Live session:

- Live available → `liveRef.notify(beat)`;
- Live unavailable → browser TTS fallback.

Hear/Skip offers and gists use this path.

### Step 4: manual post playback uses browser TTS

The Log's Play reply button:

1. halts recognition;
2. sanitizes the post;
3. speaks it;
4. waits for the speech engine to become idle;
5. delays briefly;
6. restores listening when the current mode permits.

### Step 5: Realtime receives and plays Travis audio

The Live client's remote WebRTC track is assigned to an audio element. That is
not browser text synthesis; the Realtime service produces the audio.

## Persisted and local state

Persisted:

- post text and `speakable` policy;
- heard acknowledgement.

Ephemeral:

- browser speech queue;
- selected system voice;
- Realtime audio track;
- current offer/gist.

## Complete path

```text
Travis offer/gist
  ├── Live up → Realtime notify → remote audio
  └── Live down → browser speechSynthesis

agent_post + Play reply
      ↓
speakableAgentPost
      ↓
speechSynthesis
      ↓
wait for idle → rearm ear
```

## Implementation caveats

- Realtime and browser synthesis are two separate mouths with different
  voices and failure modes.
- Specialist stream deltas are not continuously read aloud.
- There is no Cloud TTS or SSML layer in the current browser readback path.

---

# 22. Output filtering — pipe hygiene

## What it ultimately is

**Stream sanitization that separates user-facing answers from reasoning,
tools, status, and visual output without performing product-level triage.**

The v1 “dumb pipe” carries assistant-facing content faithfully. It does not
read internal execution noise aloud.

## UI pass

- User-facing specialist text becomes an ordinary authored post.
- Tool narration appears as a quiet receipt rather than a spoken bubble.
- Failures become concise status lines.
- Detailed process and thought information lives in Stream.
- Images render as attachments instead of being read as markdown.
- Travis's own voice is not reinserted as a new user request.

## Code pass

### Step 1: Cursor ingress is classified by event kind

`src/server/cursor-port.ts` translates vendor stream events into Travis-facing
events such as:

- `thought_delta`;
- `post_delta`/`post_beat`;
- process/tool events;
- terminal status.

### Step 2: `seat-pipe.ts` writes each class to its proper store

`driveDestCursorEvents()`:

- writes thought/progress into Stream;
- accumulates user-facing assistant content;
- creates or completes the authored room post;
- inserts non-speakable status on errors.

Raw vendor events do not go directly to speech.

### Step 3: tool narration is deliberately non-speakable

`narrateToolCall()` inserts a Travis `agent_post` with
`speakable: false`. `Room.tsx` renders this as quiet italic receipt text,
without a normal seat bubble or Play reply behavior.

### Step 4: display and speech have separate formatting

`AgentPostBody` renders the allowed markdown subset. `speakableAgentPost()`
produces speech-safe text. The stored body remains the shared source.

### Step 5: Live echo is suppressed

`shouldDropHeardAsUser()` in `src/lib/thread-truth.ts` prevents Travis's own
spoken offer/readback from returning through the microphone as a founder turn.

### Step 6: classifier modules remain silent

`stream-intent.ts` classifies only. `stream-dispatch.ts` performs work but does
not speak. Speech is owed by the explicit response/readback layers.

## Persisted and local state

Persisted:

- turn kind;
- speakability;
- Stream process/thought/message events;
- status rows.

Local:

- transient thought and post deltas;
- speech queue;
- display parsing.

## Complete path

```text
Cursor/OpenAI/tool event
      ↓
classify event semantics
  ├── answer → agent_post
  ├── thought/process → Stream
  ├── tool receipt → non-speakable post
  ├── failure → status
  └── image/file → attachment
      ↓
display renderer and speech renderer apply separate hygiene
```

## Implementation caveats

- Hygiene is not triage. Travis is not yet deciding which valid assistant
  conclusions matter most.
- Some send paths stream directly to their originating response while
  write-and-leave paths rely on background persistence and the room wire.
- Misclassification can either expose noise or hide meaningful output, so the
  event boundary is load-bearing.

---

# 23. Progressive disclosure — doors

## What it ultimately is

**A progressive-disclosure navigation model: one primary workspace face with
secondary state behind contextual doors.**

Travis does not make every capability an always-visible dashboard panel.

## UI pass

The room shell remains Voice or Log. Secondary concerns open as full-screen or
overlay surfaces:

- roster;
- Backlog and ticket;
- in-flight queue;
- Requests;
- Look;
- Stream;
- Artifacts;
- character and integration status;
- Hold promotion.

The controls are mostly quiet text or icons until the operator asks for detail.

## Code pass

### Step 1: a small local state machine controls doors

`Room.tsx` defines a `Door` union and stores:

```ts
const [door, setDoor] = useState<Door>(null);
```

It separately stores `plate` for major faces such as index, create, room, and
integrations.

Using a union gives TypeScript a finite set of permitted strings and catches
many misspellings at compile time.

### Step 2: primary chrome only sets intent

Header buttons and queue/seat affordances call `setDoor("backlog")`,
`setDoor("requests")`, `setDoor("roster")`, or set a selected Stream/artifact
ID.

The header does not contain the secondary application's full body.

### Step 3: conditional rendering mounts the selected surface

At the end of `Room.tsx`, conditional blocks mount the relevant plate
component and pass it room-scoped data/actions. Closing resets the door or
selected ID and returns to the unchanged shell.

### Step 4: focused work can move back into the Log

Helpers such as `openTurnInLog()` close doors, switch to Log, and scroll to the
relevant turn. The tape remains the common point of return.

### Step 5: overflow-safe overlays use portals where required

The Hold sheet uses `createPortal()` so it is mounted under `document.body`
rather than clipped inside a scrolling/overflowing room container.

## Persisted and local state

Persisted:

- data acted upon inside doors: membership, jobs, queue, initiatives,
  acknowledgements, artifacts, and Look's GitHub result.

Local:

- which door is open;
- selected stream, ticket, turn, or artifact.

## Complete path

```text
Voice or Log shell
      ↓ quiet contextual control
local door/selection state
      ↓
mount focused secondary surface
      ↓ action may mutate room state
      ↓ close or open referenced turn in Log
```

## Implementation caveats

- Door state is not URL-routed, so browser deep links do not reconstruct every
  open secondary surface.
- Most door orchestration remains in the large `Room.tsx` component.
- Look appears only in Log by design; Voice remains the minimal face.

---

# 24. Tokenized visual themes — Mission and Carbon

## What it ultimately is

**Semantic design-token theming with two product characters, not ad-hoc
light/dark conditionals.**

Mission and Carbon share component geometry and meaning while changing the
semantic colors used to express them.

## UI pass

- The first door says “Pick a character, not a brightness.”
- Mission is the lighter bone/oxblood character.
- Carbon is the darker black/orange character.
- Match system can choose the character from OS preference.
- Returning through “Mission · Carbon” reopens the selection door.

## Code pass

### Step 1: one `Tokens` type defines the visual vocabulary

`src/theme/tokens.ts` defines semantic fields such as:

- primary/elevated backgrounds;
- primary/secondary/muted text;
- border and hover;
- accent and accent-soft;
- user/assistant bubbles;
- danger and receipt colors;
- seat tints.

Mission and Carbon each provide every required field.

### Step 2: `CharacterProvider` owns selection

`src/theme/character.tsx`:

- reads the saved character from localStorage;
- waits for hydration before claiming a selection;
- optionally listens to `prefers-color-scheme`;
- exposes the selected token object through React context.

### Step 3: `TravisApp` passes tokens down

`useCharacter()` returns `t`, selection state, and reset behavior.
`TravisApp` sets the document body colors, configures `AntShell`, and passes
`t` into Room.

### Step 4: components use semantics rather than mode branches

Components style against values such as `t.bgPrimary`, `t.textMuted`, and
`t.accent`. They generally do not ask whether the app is dark.

Shared typography/geometry remains in modules such as `src/theme/scale.ts`.

## Persisted and local state

Persisted in the browser:

- selected character and match-system preference in localStorage.

Local:

- hydrated selection;
- current OS preference;
- resolved `Tokens` object.

## Complete path

```text
ModeDoor selection or system preference
      ↓
CharacterProvider
      ↓
Mission or Carbon token object
      ↓
TravisApp / AntShell / Room / child components
      ↓
same components, different semantic character
```

## Implementation caveats

- The persistence is browser-local, not room- or operator-scoped in Postgres.
- Historical `light` and `dark` exports remain aliases for Mission/Carbon.
- A small surface-highlight CSS fallback still has a literal orange fallback;
  the normal component chrome is token-driven.

---

# 25. Runtime UI instrumentation — surface registry

## What it ultimately is

**A live registry of named UI regions for documentation, inspection, and
highlighting.**

The interface describes its own meaningful surfaces at runtime instead of
maintaining a separate static list of panels.

## UI pass

There is no ordinary founder-facing surface map in the current product. The
visible effect appears when inspection tooling sets a highlighted surface:
the exact registered region receives an outline.

The more important present effect is structural: major regions have stable,
functional identities such as:

- Room index;
- Session header;
- Voice presence;
- Thread;
- Talk or Type;
- Backlog;
- Requests.

## Code pass

### Step 1: the root provides registry context

`src/app/layout.tsx` wraps the application in `SurfaceRegistryProvider`.
The provider stores:

- registered surface metadata;
- current highlight ID;
- registration and highlight functions.

### Step 2: each region mounts a boundary

`SurfaceBoundary` in `src/surfaces/SurfaceBoundary.tsx` receives:

- stable `id`;
- functional `label`;
- optional icon;
- sibling order;
- normal wrapper props.

An effect calls `register()` on mount and unregisters on unmount.

### Step 3: registration builds a live sorted inventory

The provider ignores duplicate IDs and sorts surfaces by declared order. There
is no closed `DocsComponentId` union that must be edited for every new region.

### Step 4: the DOM carries inspection metadata

The wrapper renders:

```text
data-surface-id
data-surface-label
```

External tools and browser tests can locate functional regions without relying
on component filenames.

### Step 5: highlight is applied at the same boundary

When `highlightId === id`, the boundary draws an accent outline. Registry
identity and visible target therefore cannot silently drift apart.

## Persisted and local state

No registry data is persisted. Registration and highlight state exist in the
hydrated React tree.

## Complete path

```text
SurfaceRegistryProvider
      ↓ context
SurfaceBoundary mounts
      ↓ register(id, label, order, icon)
sorted live surface inventory
      ↓
DOM data attributes + optional highlight outline
```

## Implementation caveats

- The registry becomes populated only after client hydration.
- No current production panel calls `setHighlightId`; the mechanism is
  prepared for documentation/inspection tooling.
- Repeated row instances are represented by their shared region boundary
  rather than a unique registration per message.

---

# 26. User-initiated defect capture — Look

## What it ultimately is

**Manual in-product defect reporting that exports a lived failure into the
engineering workflow.**

Look lets the operator identify a problem in the actual room and file the
relevant session/turn/deployment evidence to GitHub. It does not invent a
parallel Travis bug database.

## UI pass

- Look is available from Log, not Voice.
- The operator can select relevant conversation turns.
- An optional note describes the lived miss.
- File sends the report.
- The interface reports when Look is not wired rather than pretending success.

## Code pass

### Step 1: the door builds a room-scoped report

`LookMissDoor` receives the room's turns, chooses default relevant turn IDs,
accepts a note, and posts:

```json
{
  "note": "...",
  "turnIds": ["..."]
}
```

to `/api/session/[id]/look`.

### Step 2: the route validates product evidence

The route:

1. requires ownership of the room;
2. rejects ended/invalid cases as specified;
3. parses the body;
4. loads the room tape;
5. verifies every requested turn actually belongs to this room.

### Step 3: a deterministic seed is rendered

`src/lib/look-miss.ts` produces a report containing:

- room/session identity;
- selected turn IDs and context;
- operator note;
- deployment and commit information;
- a marker that identifies a Travis Look report.

### Step 4: GitHub is the durable defect system

`src/server/look-github.ts` uses the server-side wake token to create or append
the issue/PR evidence and apply the appropriate Engineer wake behavior.

No `travis.look` table is created.

### Step 5: runtime walks can dry-run filing

The test-operator path returns a non-mutating walk result so browser tests can
verify the door without producing real GitHub defects.

## Persisted and local state

Persisted externally:

- GitHub issue/comment and labels.

Persisted in Travis:

- no Look-specific row; the referenced room turns already exist.

Local:

- selected turn IDs;
- note;
- filing state.

## Complete path

```text
Log → Look
      ↓
select room turns + note
      ↓
POST /api/session/:id/look
      ↓
validate ownership and turn membership
      ↓
render deploy/session/turn seed
      ↓
GitHub issue or PR workflow
      ↓
wake Engineer on the existing work object
```

## Implementation caveats

- Look requires `WAKE_GITHUB_TOKEN`; missing configuration produces a truthful
  not-wired response.
- It is intentionally absent from Voice so defect filing does not clutter the
  primary conversational face.
- GitHub availability and label automation are external dependencies.

---

# How the constructs compose

```text
Operator enters a persistent Room
      ↓
Voice or Log captures a turn
      ↓
Conductor commits speech
      ↓
Dest resolves a living seated role
      ↓
Dispatch-and-leave files a durable job
      ↓
Cursor run proceeds through queue and Stream state
      ↓
Room tape receives the specialist result and Artifacts
      ↓
Room wire updates the phone
      ↓
Hear/Skip and readback deliver the result
      ↓
Durable work remains projected in Backlog
```

Cross-cutting constraints:

- one ear owns the microphone;
- pipe hygiene separates answer from operational noise;
- doors keep secondary state out of the primary face;
- Mission/Carbon tokens keep the visual system coherent;
- surface boundaries keep meaningful regions inspectable.

# Product architecture versus delivery architecture

This dossier describes **Travis the product**.

The following are a separate **agentic software-delivery pipeline** used to
build Travis:

- Technical Architect → Systems Analyst → Engineer seat sequence;
- PM packets and Systems Change Packets;
- GitHub wake labels;
- Cursor Automations;
- `runtime-doors`;
- `fail-look` and N-red escalation;
- preview mutexes;
- one-PR-per-initiative law.

Those mechanisms can affect delivery quality and development speed, but they
are not the Room, routing, memory, job, tape, backlog, or voice architecture
described above.
