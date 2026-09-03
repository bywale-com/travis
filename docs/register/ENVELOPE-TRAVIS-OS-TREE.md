# Envelope — Travis as OS tree (Engineer → PM)

**Kind:** Envelope. **Not a packet. Not a hotfix. Not plant law.**
**Seat:** Engineer wrote this so the Product Manager can do the **canonical pass** (plates + packets). The founder will then pass it to the Systems Analyst. Engineer does not plant faces from this file. Engineer does not mint stores from this file. Do **not** append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.
**When:** 2026-09-03. Founder ↔ Engineer, after rooms-as-primitive was already on the face (index, create room, roster, create agent, backlog) and after Hotfix 061 (rooms ordered by last line).
**Ask:** Read every section. Rule which candidate plates are in this pocket, which are doors, which are spoken-only, and which are the next pocket. Name the third moment (seated) as product: who attaches a role, and whether the founder sees it. Do not ascribe tables. That is SA after you.

**Flag (unchanged):** Phase One 14:00 UTC 2026-08-25. Do not overwrite founder wording.

> I simply don’t wanna have to look at my phone. When it’s time to work on building, I open this app — not the Cursor app — and I can have a dialogue: talk, voice-send, hear the reply read back. Everything readable in the chat is read to me; images and such appear in the chat. It’s an interface between me and Cursor as it exists today.

**Prior envelope (do not collapse into this one):** [`ENVELOPE-ROOMS-AND-AGENTS.md`](./ENVELOPE-ROOMS-AND-AGENTS.md) — rooms as primitive, seats as membership, effect parity. That pocket is largely planted. This envelope is the **altitude above the room**: Travis as Om Coda / operating system, with a unified tree.

---

## How we got here

This is the lived thread, in order. Not a generated flag.

### 1. The room list was created-first (061)

Founder: the index is not most-recent-conversation. No sort modal. Default = last line. Engineer cut Hotfix 061 ([PR #90](https://github.com/bywale-com/travis/pull/90)): order by `max(voice_turn.created_at)`, empty rooms fall back to `voice_session.created_at`. The age on the row is that time.

Truth check: the top room on the live store was **Travis** (`0e8875f8-283b-4dae-bf54-76c82a05b6ef`), last line 2026-09-03 17:59 UTC — founder asked Travis to rename the room and backlog items; Travis said it could not from the tools it had.

### 2. Backlog “stages” (not this envelope, but it opened the next question)

Founder asked whether Travis was hallucinating a done clause / stages. Stood-up truth: `travis.initiative.status` is `open` | `done`, with `done_at` when done. No in-between stage in the table. **Next** and **Lit** are derived, not a stored pipeline. Travis was not inventing open/done.

### 3. “What exists for seat startup?”

Founder asked whether PM, SA, Engineer (and Engineer-in-this-chat) have consistent places for startup protocols and logs, such that the README can allude to them, and such that we could later build a protocol for Travis when spinning agents — first in this repo.

**What exists (docs, this repo):**

| Seat | Front door | Accept-the-seat | Trail |
|------|------------|-----------------|-------|
| PM | `docs/README.md` paste + identity | `docs/seats/PRODUCT-MANAGER.md` | `docs/register/PHASE-ONE-LOG.md` (Current + append) |
| SA | same file, SA block | `docs/seats/SYSTEMS-ANALYST.md` | `docs/register/SYSTEMS-ANALYST-LOG.md` (same discipline) |
| Engineer | same file, Engineer block · repo-root `AGENTS.md` always-on for Cloud | `docs/seats/ENGINEER.md` | git + PRs + `HOTFIX-NNN` + `HOTFIXES.md` |

Root `README.md` already alludes. Shared orientation: `docs/method/`, `docs/build-foundation/`.

**What does not exist:**

- No `docs/seats/TRAVIS.md`. No Travis log. Travis startup is `TRAVIS_SYSTEM` in `src/server/travis-tools.ts`.
- Create-agent prompt is one line: `You are ${label}. You sit in a Travis room.` It does not paste a seat block or point at a log.
- A send after create is the founder’s line. Engineer Cloud agents only pick up `AGENTS.md` if the **work repo they are bound to** already has it.

### 4. Founder corrected the beat (the real process)

Quoted from the founder, 2026-09-03:

- You do **not** ask Travis to create a room. You create a room. Travis is already in it. That is how the app works.
- Then you create agents or assign agents to the room.
- Create is “the main stuff.” You can name them because you are going to assign a role later. You do **not** assign the role at create. There is **no system message yet**. That is fine.
- Roles attach **after** the distinct agents exist — because that is when you can gauge.
- A new empty work repo has no process in it. Unless Travis himself has a place (repo, tools, folder structure) that unfolds onto agents, every new project starts lawless.
- Direction named while hot: **Travis is the embodiment of Om Coda. It is our operating system.** Eventually Travis is the one spinning up the agents we need, updating agent codes, standing things up.

Engineer walked with that. Did not plant. Named a gap, did not mint a store: **create / in-the-room / seated are three moments that today share one slug.**

### 5. Founder locked the split, asked for Cursor’s filesystem property

Quoted:

- The three moments **are all separate.** We are still thinking through how we **orchestrate the third** (seated).
- Architecture that fulfills everything is not chosen yet.
- Argument for Travis having his own filesystem: **Travis is system-wide, above being inside a specific room.**
- Emulate Cursor: you can look into another chat’s logs / transcripts because there is a **unified file system**; everyone has their own space or folder.
- Talk from that point.

Engineer answer (held in this envelope): steal the **property** (one tree, current context is where you are standing, you can open another folder). Do **not** steal “a folder = a chat.” In Cursor those are the same object. Here **agent ≠ room ≠ conversation.**

### 6. Room adjacency, integrations, runtime

Founder: if protocol is system-wide, how does it keep room adjacency? It feels like three filesystems stacked. Build on the protocol folder and it opens tools — e.g. add an integration in one room, and it is available to all rooms, Travis system-wide, and yet Travis does not get lost. “I think it’s all a backend thing — rooms have an ID, messages hang on a table with a room attached.” Also: how might this change the systems we use? Computer use? Dedicated server?

Engineer answer (held): **not three disks.** One tree, three *kinds* of folder, **one cwd**. Cwd = room id. Protocols and integrations are absolute paths. Install is OS-scoped; use is room-scoped. No computer use. No dedicated server required for adjacency. A literal POSIX disk is a later beat, not the adjacency story.

### 7. This envelope (founder, 2026-09-03 ~19:15 UTC)

Quoted intent:

- Love this direction. Sure it justifies some new plates.
- Need a **well-detailed envelope of this, including how we got into the discussion. Absolute rigor.**
- Eyes of the **PM first** (canonical pass → plates and packets), then **SA**, then Engineer builds it into place.
- Where this is going: Travis will **probably need its own POSIX**, because right now it must always rely on Cursor agents to do everything. Eventually it should do even a few things like **standing up a template into a repo** (think the seats directories — this is **beyond a startup message**).
- That POSIX is **ahead**. For now it should at least be able to **house** agent system messages, repo templates, and other items — **even if it needs to leverage agents to write the files into its own tree.** (“That’s actually kind of funny.”)

---

## Founder locks this envelope is under

These are locks from this thread. Not agent alignment dressed as flags.

| # | Lock | Meaning |
|---|------|---------|
| L1 | **Room first.** | Founder creates the room. Travis is already in it. Do not invert this. |
| L2 | **Create ≠ role.** | Creating an agent is name / model / repo (the main stuff). No role. No system message yet. Fine. |
| L3 | **Three moments stay separate.** | Create · in-the-room · seated. We have not orchestrated the third. |
| L4 | **Travis is system-wide.** | Above a specific room. That is the argument for his own tree. |
| L5 | **Emulate Cursor’s unified FS property.** | One tree; spaces/folders; you can look sideways. Not “folder = chat.” |
| L6 | **Pointers, not copies.** | A protocol is not copied into each room. An integration added in one room is available everywhere because the write was OS-scoped. |
| L7 | **Cwd is the room.** | Travis does not get lost. Messages already hang on a room id. |
| L8 | **House now, POSIX later.** | Now: house system messages, repo templates, other OS items (agents may write the files into Travis’s tree). Later: Travis’s own POSIX so he can stand a template into a work repo (seats directories, not only a prompt). |
| L9 | **Empty work repo is fine.** | Process does not live in the work repo as the source of truth. The work repo is the desk. The OS tree is the building. |

Still **open** (founder said so): how we orchestrate seated. Architecture that fulfills everything is not chosen. PM may name the glass and the beat. SA ascribes the store after.

---

## Destination vs this pocket

Two altitudes. Do not mix methods.

### Now (this envelope’s “house” beat)

Travis **owns a place** that is not any one room and not any one work repo. That place **houses**:

- Agent system messages / seat protocols (the Accept-the-seat law that today lives only as markdown in *this* git repo, plus Travis’s own `TRAVIS_SYSTEM`).
- Repo templates (e.g. the seats directories, log stubs, `AGENTS.md` shape) — **as contents in his tree**, not yet as “Travis writes them into your empty repo by himself.”
- Other OS items that must be the same in every project (named by PM/SA later; do not inventory here).

It is acceptable — and the founder called it funny-true — that **Cursor agents write those files into Travis’s tree** for now. He houses. They have hands. He still does not need to see the work repo (Hotfix 042) to own the building.

### Ahead (named so it does not sneak into v1 plates as if it were now)

Travis **probably needs his own POSIX** so he is not permanently a voice that can only dispatch. First concrete job named: **stand a template up into a repo** — seats directories, not a startup message. That is a capability-boundary change (042 said he cannot see a repo). It is **out of this pocket** unless PM explicitly pulls a sliver of it in. Engineer will not plant POSIX, a worker box, or computer use from this file.

---

## What is stood up (quote, do not remember)

### Catalog person (create)

`travis.agent_binding` — global. No `session_id`. `seat_key` UNIQUE. Create (`createAgentBinding` in `src/server/create-agent.ts`) takes label, optional model, optional repository, optional ref. It mints `seat_key` from the label (`nextUniqueSlug(seatSlugFromLabel(label))`). Cursor `Agent.create` prompt is exactly:

```text
You are ${label}. You sit in a Travis room.
```

Face: `CreateAgent` (SCP-011). Name + model picker + repo picker. **No role field. No protocol picker. No system-message editor.**

### In the room (membership)

`travis.room_membership` — `session_id` + `binding_id` + `role` + `joined_at` / `left_at`.  
`membershipRoleFor` in `src/lib/room-membership.ts`: `travis` → `facilitator`, anyone else → `member`. That is the only “role” the machine has. It is **not** PM / SA / Engineer.

Dest on create: first chosen non-Travis member, else Travis. Stand-in still prefers PM when that row is in the insert set.

### Conversation (not a person, not a protocol)

`travis.voice_session` — the room (`id`, `title`, `operator_id`, …).  
`travis.voice_turn` — lines, **`session_id` required**.  
`search_room` / request log — **this room**.  
`rename_room` — **this room only**. Travis is told he cannot list or rename other rooms (`TRAVIS_SYSTEM`).

### Travis himself

`TRAVIS_SYSTEM` (code). Runtime adds a bounded room window. He cannot see a repository, a diff, a branch, a test run, or CI (042). Tools take a `sessionId`. There is no Travis folder, no Travis protocol file, no OS tree he can `ls`.

### Seat law in *this* work repo

Markdown, as tabled above. Cloud Engineer runs against this repo inherit `AGENTS.md`. A Cloud agent bound to an **empty** repo inherits nothing. That is the empty-repo proof.

### Integrations today

`IntegrationStatus` / `/api/integrations/status` — Cursor connection (key, email, models, repos). **Already global.** One `CURSOR_API_KEY`. Not a per-room install. Not a catalog of “integrations you added in a room.” The founder’s example (add in one room → available everywhere) is the **pattern**, not a planted feature.

### Runtime

Vercel (serverless) + one Postgres schema `travis` + Cursor Cloud for seat runs. One DB client per isolate (045). No dedicated Travis box. No computer use. No Travis POSIX.

---

## The three moments

Keep these as three. The machine today mashes (1) and a fake (3) into `seat_key`, and uses (2) only for facilitator vs member.

| Moment | What it is | Stood-up write | Must not become |
|--------|------------|----------------|-----------------|
| **Create** | A person exists. Name, Cursor id, optional work repo. | `agent_binding` + stub prompt | A role. A system message. A protocol copy. |
| **In-the-room** | That person is in this room. | `room_membership` | A copy of the person. A protocol. A second transcript. |
| **Seated** | That person now wears a protocol (PM / SA / Engineer / later seats). | **Nothing.** No field. No beat. No glass. | A rename. A new `seat_key` minted from the name. Membership `role` (that column is facilitator/member). |

**Orchestration of seated is open.** Engineer will not pick: founder says it aloud; Travis proposes and founder confirms; a door on the roster; first send after a spoken “you’re the Engineer”; both a link in the tree and a prompt on the next run. PM names the beat if it has glass or spoken law. SA ascribes the link after.

---

## The tree (one filesystem, three folder kinds, one cwd)

### Steal from Cursor

Cursor works because a chat is not a bag of RAM. There is one tree. Each chat has a space. You can open another chat’s transcript because it lives in the shared store.

### Do not steal from Cursor

**A folder is not a chat.** In Cursor, chat ≈ folder ≈ transcript. In Travis:

- **Agent folder** — the person (create writes this). Identity, Cursor id, work-repo binding. Empty of role until seated.
- **Room folder** — the place. Turns live here. In-the-room is a **pointer** from this folder to agent folders.
- **Protocol folder** — the OS copy of a seat’s law (Accept the seat, log location, must-nots) and, in the house-now beat, **templates** (seats directories, log stubs, `AGENTS.md` shape). System-wide. Not inside a room. Not inside a work repo as source of truth.

The transcript is the **intersection** (room × members × turns), already materialized as `voice_turn.session_id`. Peeking another conversation means opening another **room** folder, not another **agent** folder. Mixing those is how the three moments collapse back into one slug.

### Cwd (why he does not get lost)

Unix already does this. `/usr/bin` is system-wide. The shell still has a working directory. You do not copy `ls` into every project.

| Idea | In Travis today | In the tree talk |
|------|-----------------|------------------|
| cwd | Every Travis turn and every tool already carries `sessionId` | Standing in `/rooms/<id>` |
| Absolute path | `agent_binding` has no room id; Cursor key is env | `/agents/<id>`, `/protocols/engineer`, `/integrations/cursor` |
| Line | `voice_turn.session_id` | File under the room folder |
| Cross-look | Possible as SQL; **not offered** (`search_room` is this room) | Open another room folder without changing who you are |

Opening a global folder does not change cwd. Writing a global thing from inside a room does not attach that thing to the room. The room was the door.

### Failure mode

**Sync / three disks.** Protocol copied into room A, then into room B. Agent transcript treated as a third filesystem. Then Travis is lost, or every room drifts. **Pointers, not copies.**

---

## Protocol folder, built out

The protocol folder is why this is bigger than a startup message.

**Today’s seat files are a specimen of contents, not the store.** `docs/README.md` paste blocks, `docs/seats/*.md`, the two logs, `AGENTS.md`, `TRAVIS_SYSTEM` — that is what a protocol folder would *hold*. They live in the Travis **work** repo because this repo *is* Travis. That will not be true of the next empty repo.

**House now** means those contents (and repo templates) have a home in Travis’s tree, addressable without being in the room and without being in the target work repo.

**Unfold later** (POSIX / ahead) means standing that template **into** a work repo: real `docs/seats/`, real log files, real `AGENTS.md` — “beyond a startup message.” Founder-named. Out of this pocket unless PM pulls a sliver.

**Seated** (when orchestrated) is a **link** from an agent folder to a protocol folder. Create does not write that link. Membership does not write that link.

**Funny-true now:** Travis can own the folders and still ask an Engineer (or any seated hand) to `write` the blobs into his tree. He houses. They have hands. That does not require him to see the *work* repo. It also does not require computer use.

---

## Integrations — same pattern, named so PM can plate it or not

Founder example, not a planted feature:

> add integrations inside of a room … whatever integration you add inside of one room is now available to all the rooms … Travis, system-wide … and yet Travis doesn’t get lost.

| | Install | Use |
|--|---------|-----|
| Scope | OS. No `session_id` on the record. | This call. `sessionId` = cwd. |
| Face | May start **in** a room (door). | Tools in whatever room you are standing in. |
| Already true | `CURSOR_API_KEY` / IntegrationStatus | Every room’s Travis and every create-agent picker |

PM rules: is “add integration” a plate, a door on an existing plate (Create Agent / Character / Integrations status), spoken to Travis, or next pocket? Engineer will not invent an integrations table. If the face needs a store beyond env, that is SA after you.

---

## What this does to the systems we use

| Question | Engineer read | Plant from this file? |
|----------|---------------|------------------------|
| New product face? | Phone is still one room. The tree is how Travis is allowed to look sideways and house OS items. A second dashboard is not implied. | No |
| Computer use? | No. Computer use is driving a desktop. Founder already refused puppeting Cursor’s UI. A folder metaphor is not Finder. | No |
| Dedicated server? | **Not required** for adjacency, housing, or “add in one room / use everywhere.” Serverless + Postgres already keys lines by room and people by catalog. | No |
| Literal POSIX? | **Ahead.** Only required if Travis himself `ls` / `cat` / writes template files into a work repo without a seat. Founder said probably, later. | No |
| Travis-owned git repo as the tree? | One way SA might materialize “house now.” Another is rows that look like folders. Another is object storage. **Not chosen.** | No |
| Change 042? | POSIX-later yes (he would touch repos). House-now no (agents write into *his* tree; he still cannot see *their* work repo). | No |
| Stack stays? | Vercel + `travis` schema + Cursor Cloud. The store is already a bit system-wide. The architecture is not a tree he walks. | Yes stay, unless SA later ascribes a Travis repo/volume |

---

## Candidate plates (Engineer read — PM owns the count and the names)

The previous envelope’s plates (room index, create room, roster, create agent) **already exist on the face.** This envelope does not re-ask those unless a revision is required.

Engineer believes this direction justifies **some** new plates. PM decides which. None of the following is plant law.

| Candidate | Why it might be its own plate | Why it might not (door / spoken / later) |
|-----------|-------------------------------|------------------------------------------|
| **Seat an agent** (the third moment) | Create has no role. Roster is only in/out. There is no “now you are PM.” First time the founder *gauges* and attaches a protocol. | Spoken to Travis; or a quiet door on the roster; or next pocket until orchestration is named. |
| **OS / protocol house** | Founder wants Travis to house system messages and templates. Something may need to show what is in the building (which protocols, which templates). | v1 phone is one room. Housing can be backend-only until unfold. Labor (reading 40k of protocol) is not an effect — founder law from the rooms envelope. |
| **Add integration** (room door, OS write) | Founder named it as the example that falls out of the protocol-folder idea. Effect parity: if Travis can attach one, the founder can. | Integrations status already exists as Cursor-connection chrome. Extending that door may be enough. No store yet. |
| **Cross-room look** | Cursor property: open another chat’s transcript. `search_room` is this room only. Travis is told he cannot list other rooms. | Spoken tool (“what did the other room say”) with no new glass. Or next pocket — one room on the phone until PM says otherwise (rooms envelope: “No second room on the glass”). |
| **Create-agent revision** | Confirm the plate stays name / model / repo — **no role, no system message.** If anyone draws a role picker onto I4, they have collapsed L2. | Likely **not** a new plate. A must-not on the existing one. |
| **Unfold a template into a repo** | Founder destination. Seats directories, beyond a prompt. | **Ahead.** POSIX-later. Do not print this as if house-now were unfold. |

**Revisions, not new plates, if PM wants them in this pocket:**

- Roster: show seated-as vs merely-member, if seated is in this pocket.
- Travis copy: he may need to *say* he can house / look sideways / attach a protocol — 042-style boundary in the other direction (what he **will** own). That is system text, not a plate, unless PM wants it on glass.

**Founder law from the rooms envelope, still in force:**

1. **Effect parity.** Anything Travis can cause, the founder can cause by hand. Outage must not lock the founder out.
2. **Not surface parity.** Rare effects behind a door. Twelve loud actions on a phone is the failure.
3. **Labor is not an effect.** Housing a protocol file does not become a “Browse OS” app.

---

## Implied controls (bucket 3 if a plate is locked)

If PM locks **Seat an agent**: the control has to work — pick a person who already exists, pick a protocol that exists, confirm. Empty protocols, already-seated, seating Travis (he is facilitator, not a Cursor seat) — completes, not a second PNG.

If PM locks **Add integration**: install success / already-installed / Cursor-not-connected. Completes. Do not invent a marketplace.

If PM locks **Cross-room look**: dest stays this room (cwd does not change unless they **enter**). Peek ≠ enter. Completes: what happens to Voice / Live if they enter the other room (already have Leave / Enter).

If PM locks **none of the above** and only locks “house the blobs”: there may be **no new plate**. SA still has a store to ascribe. That is allowed. Say so.

---

## What is deliberately not in this envelope

- No table mint. No `protocol` / `os_node` / `agent_seat` / `integration` store named as if it existed.
- No plant. No `docs/seats/TRAVIS.md` invented as law. No POSIX worker. No computer use.
- No orchestration of seated chosen by Engineer.
- No triage / judgment. Travis still does not decide what to work on.
- No second product on the glass. The OS is not a dashboard unless PM prints one.
- No “put `docs/seats/` in every work repo at create.” That is unfold-later, and it would make the work repo the source of truth again.
- No collapsing create / member / seated into `seat_key`.
- No copying protocols into rooms.
- Do not append PM or SA logs from this file.

---

## What SA will be asked after PM’s pass (do not do it now)

When the founder seats SA on this envelope + PM’s plates/packets, SA must ascribe against stood-up SQL and ports, then sign / amend / refuse. Engineer’s list of **questions**, not answers:

1. Is the tree **rows that look like folders**, a **Travis-owned git repo**, or **object storage**? House-now can be any of the three. POSIX-later biases toward a real disk or a checkout.
2. What is a **protocol folder** as a store (identity, contents, version)? Today’s markdown is specimen, not schema.
3. What is the **seated link** (agent → protocol)? Not `room_membership.role`. Not `seat_key` minted from the label.
4. Are **templates** the same store as protocols, or a child?
5. **Integration** rows: OS-scoped, no `session_id`. Relation to env keys already used.
6. **cwd** remains `session_id` on every Travis turn. Cross-look is a read of another room folder, not a dest change, unless PM said Enter.
7. **Who writes the tree in house-now** — Travis tools vs dispatch-to-seat — and what 040/042 must then say.
8. Remap: `seat_key` stays a slug for marks/routing until seated exists; do not silently overload it.

SA talks to the founder only for job-law. This file is not job-law.

---

## One-line ask

**Which of the candidate plates are this pocket, and is seated a plate, a spoken beat, or still open?** Engineer will not draw a face or mint a folder store without the PM pass, then the SA pass.

---

## Product Manager — paste this

```text
You are Travis’s Product Manager. Read docs/README.md “Product Manager — identity” and accept it. You are not the Systems Analyst. Keep docs/register/PHASE-ONE-LOG.md (append unless I mark a separate entry). Read the Current pointer at the top of that log, then the newest stamp at the bottom, then docs/register/PHASE-ONE.md. Capture founder wording; do not generate substitute flags. Ask at inflections. Cadence ≥4 stamps/day in session. Do not mint tables. Do not plant triage judgment as v1. Detailed: docs/seats/PRODUCT-MANAGER.md.

Founder lock (2026-09-03), job-law from me, not from Engineer or SA:

  Travis is system-wide — the embodiment of Om Coda, our operating
  system — above any one room. Emulate Cursor’s unified filesystem
  property (one tree, spaces you can look into), not “folder = chat.”

  Create / in-the-room / seated stay three separate moments. Create
  has no role and no system message. We have not orchestrated seated.

  House now: Travis owns a place that holds agent system messages,
  repo templates, and other OS items — even if Cursor agents write
  those files into his tree. POSIX of his own (stand a seats-directory
  template into a work repo) is ahead.

  Room first: I create the room; Travis is already in it. Empty work
  repos are fine; process does not live there as the source of truth.

  Pointers, not copies. Cwd is the room. An integration added in one
  room is available everywhere because the write is OS-scoped.

Engineer wrote an envelope. They have not planted. They have not minted.
Your job: canonical pass — which plates, which packets, which doors,
which spoken, which next pocket. Then I will seat SA.

Read, in this order:

1. This chat’s seat identity (above).
2. docs/register/PHASE-ONE-LOG.md — Current, then newest stamp.
3. docs/register/ENVELOPE-TRAVIS-OS-TREE.md — the whole file.
4. docs/register/ENVELOPE-ROOMS-AND-AGENTS.md — prior altitude (rooms
   as primitive). Do not redo that pocket; it is largely planted.
5. docs/register/PLATE-READ.md — five buckets when you lock.

Do not mint tables. Do not overwrite the flag. Stamp the log.
```
