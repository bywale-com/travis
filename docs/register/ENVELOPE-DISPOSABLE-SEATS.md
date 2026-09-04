# Envelope — Disposable seats (Engineer → SA)

**Kind:** Envelope. **Not a packet. Not a hotfix. Not plant law.**
**Seat:** Engineer. Founder: PM is parked. Engineer draws the glass. Founder signs. **SA cuts.** Engineer does not mint stores from this file. Do **not** append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.
**When:** 2026-09-04. Lived Voice in room `0e8875f8-283b-4dae-bf54-76c82a05b6ef` (seq 519–534), then this Engineer bind.
**House labor (same day):** protocols + work-repo template filed into `travis.os_node`. Git receipt: [`house-now/`](./house-now/). Runtime is the house, not this folder. Do not treat the folder as a second store. Do not auto-seed it from migrate (012 stands).
**Ask:** Cut the packet that makes a seat disposable: seated = protocol path, reuse when free, busy → next (not enqueue), logging is the inheritance. Directory names below are **locked**. Do not rename them to be nicer.

**Flag (unchanged):** Phase One 14:00 UTC 2026-08-25. Do not overwrite founder wording.

> I simply don’t wanna have to look at my phone. When it’s time to work on building, I open this app — not the Cursor app — and I can have a dialogue: talk, voice-send, hear the reply read back. Everything readable in the chat is read to me; images and such appear in the chat. It’s an interface between me and Cursor as it exists today.

**This envelope does not replace:**

| File | Altitude |
|------|----------|
| [`ENVELOPE-ROOMS-AND-AGENTS.md`](./ENVELOPE-ROOMS-AND-AGENTS.md) | Rooms as primitive. Planted. |
| [`ENVELOPE-TRAVIS-OS-TREE.md`](./ENVELOPE-TRAVIS-OS-TREE.md) | House-now = SCP-012. Seated was open. POSIX later. |
| [`ENVELOPE-TRAVIS-ORCHESTRATE.md`](./ENVELOPE-TRAVIS-ORCHESTRATE.md) | Turn is not the work. SCP-013 planted. |

Do not collapse those. This is the **third moment** plus the **where**: seats are disposable because the trail lives in the house and in the register, not in the Cursor chat.

---

## How we got here

Lived thread, in order. Not a generated flag.

### 1. Travis Voice, 2026-09-04 ~17:08–17:14 UTC

Founder asked whether PM / Engineer labels matter if Travis can spin people up. Then the aha (seq 533, preserved):

> You already have a work tree, and in that work tree, there's the assumption that you'll be able to create, you know, like have protocols and so on. And what you do… you're a facilitator, you're a coordinator, you are able to identify what is the immediate role that should have input on this… Usually it's gonna be a PM… these roles come with processes and protocols themselves… that's why it's under the protocols directory.

Travis still said seats are fixed. True at that minute. `create_agent` is planted on [PR #104](https://github.com/bywale-com/travis/pull/104), not on prod yet. Create still does **not** assign a role.

### 2. Founder, this bind — seats are disposable

Preserved:

- The seats themselves **are** the roles, once chosen.
- Travis routes to that seat when it is available.
- The only reason it is not available is **busy**. Waiting / a queue of two or three is not the speed they want.
- Busy → **give it to the next** (another seat of that role, or spin). No wait. Cheaper.
- Process must be dialed. **Logging is the load-bearing piece** — every seat, always. PM log is transcripts and excerpts, Current + stamps. That is how there is almost no loss when the agent is thrown away.
- PM is a **technical** PM: discuss, look at code, plate, **and** keep that log. Engineer becomes **real hotfixes**, not a second PM.
- System message says what to do. **Repo / house directories say where.** Lock the where.

### 3. Engineer named the two trees (founder asked “what are they now?”)

**This work repo** is where a Cursor seat reads and writes today. **Travis’s house** (`os_node`) is the OS copy. 012: `docs/seats/*.md` are specimens, not auto-seeded rows. `/protocols` and `/templates` were empty dirs. POSIX unfold is still later.

---

## Founder locks this envelope is under

| # | Lock | Meaning |
|---|------|---------|
| D1 | **Seats are disposable.** | A Cursor Cloud agent is a short context. The role survives in protocol + log, not in the `bc-` id. |
| D2 | **Seat = role once seated.** | Create is still a person (014 / L2). No role at create. Seated is when they become a PM. |
| D3 | **Reuse if free.** | If a seat is already that role and idle, Travis routes there. |
| D4 | **Busy → next, not enqueue.** | Founder correction on the planted queue (SCP-003). Speed is another seat of that role, or spin. Do not make the founder wait on a queue of two or three. |
| D5 | **Logging is the inheritance.** | Every seat keeps a trail the next disposable one can read. PM: transcripts, excerpts, Current, append-only. Almost no loss. |
| D6 | **Where is locked.** | System message = what. Directories below = where. Do not invent a parallel tree. |
| D7 | **Three moments stay separate.** | Create · in-the-room · seated. Do not attach a protocol at create. |
| D8 | **House, not this git, is Travis’s durable copy.** | A new empty work repo has no `docs/`. Process lives in `/protocols`. Templates live in `/templates`. 042 stands: Travis still cannot see a work repo. |
| D9 | **No product cap** on how many agents. | Cheap because they are short, not because we invent a ceiling. |
| D10 | **Create prompt stays the stub** until seated. | `You are ${label}. You sit in a Travis room.` Do not paste a seat bible at `Agent.create`. |

Still **open** (SA ascribes; Engineer does not invent):

- How seated is stored (012 refused `protocol_id` on binding / membership, refused overloading `seat_key` / `member`).
- How Travis queries “the idle PM” vs “spin a PM.”
- What remains of the per-seat queue (same-agent follow-up while a run is live, vs new work).
- How a seated agent is handed the protocol (read_os, create follow-up, Cursor prompt after sit — pick one, test it).

---

## Locked where — this work repo

Until we update this table, a seat in **this** git tree writes only here.

| Seat | Process (specimen) | Trail they **write** | They do **not** write |
|------|--------------------|----------------------|------------------------|
| **PM** | `docs/seats/PRODUCT-MANAGER.md` · paste in `docs/README.md` | `docs/register/PHASE-ONE-LOG.md` (Current + stamps). Thesis `PHASE-ONE.md` does not move every stamp. Handoff `PM-HANDOFF.md`. Plates `docs/register/PLATES-*.md` + `docs/register/plates/`. Packets `PM-PACKET-*.md`. | `src/`. SA log. Engineer hotfixes as flags. |
| **SA** | `docs/seats/SYSTEMS-ANALYST.md` | `docs/register/SYSTEMS-ANALYST-LOG.md`. Packets `SYSTEMS-CHANGE-PACKET-NNN-*.md`. Signed SQL under register when cut. | PHASE-ONE-LOG. `src/` (quote it; do not plant it). |
| **Engineer** | `docs/seats/ENGINEER.md` · repo-root `AGENTS.md` | git + PRs. One line on repo-root `README.md` Implementation. Pickup `ENGINEER-HANDOFF.md`. Hotfix receipts `HOTFIX-NNN-*.md` + `HOTFIXES.md`. **Work:** `src/` (face `components/` + `plates/`; tokens `theme/` + `surfaces/`; grain `lib/`; machine `server/` + `server/db/`; HTTP `app/api/`). Build law `docs/build-foundation/`. | PM log. SA log. |

**Shared read, not a third seat:**

- Front door: `docs/README.md`
- Register: `docs/register/` — read all; write only your trail
- Method: `docs/method/` (PM / SA)
- Visual law: `docs/build-foundation/` and the cursor-rules copies
- Tests: `src/lib/*.test.ts` next to the grain

**Travis the facilitator** does not get this repo (042). His where is the house.

---

## Locked where — Travis house (filed this day)

Runtime: `travis.os_node`. Writers: founder HTTP + Travis `write_os`. Not dest-seat tools. Not migrate auto-seed.

```text
/
  protocols/
    WHERE.md
    logging.md
    pm.md
    sa.md
    engineer.md
    travis.md
  templates/
    work-repo/
      TREE.md
      AGENTS.md
      README.md
      docs/
        README.md
        seats/pm.md
        seats/sa.md
        seats/engineer.md
        register/PHASE-ONE.md
        register/PHASE-ONE-LOG.md
        register/SYSTEMS-ANALYST-LOG.md
        register/ENGINEER-HANDOFF.md
        register/HOTFIXES.md
        build-foundation/PROJECT-BRIEF.md
        build-foundation/00-rudiments.md
        method/00-INDEX.md
      src/WHERE.md
```

Do not mint `/rooms` or `/agents` as OS folders (012 reserved). Agent folder = `agent_binding`. Room folder = `voice_session`.

`/templates/work-repo` is the accurate skeleton of **this** product repo — seats, register trails, build law, method index, `src/` split. It is **contents in his tree**. Unfold into a foreign git repo is POSIX later. Do not pretend we planted unfold.

---

## Stood-up truth (quote, do not remember)

Create prompt is still:

```text
You are ${label}. You sit in a Travis room.
```

`room_membership.role` is `member` | `facilitator` only.

`absorbStreamingAgentPost` (014, [PR #104](https://github.com/bywale-com/travis/pull/104)) splits dest-seat beats. Not this pocket.

Queue: `queued_utterance` + `sendOrEnqueue` — busy → wait on **that** binding. That is the row D4 corrects.

House ensure: `/`, `/protocols`, `/templates` dirs. This envelope’s labor **files** the children. It does not remint the table.

---

## What SA must cut (no leftover analysis)

1. **Seated write.** Agent → protocol. Identity should be a **house path** (`/protocols/pm.md`) unless you have a hard reason for a new table. Do not overload `seat_key`. Do not put PM in `room_membership.role`. Do not attach at create.
2. **Idle lookup.** “The PM” = an open member of **this** room already seated on `/protocols/pm.md` whose Cursor run is idle. If none, `create_agent` + join + sit. No cap.
3. **Busy → next.** New work for a seated-as-PM when that binding is busy does **not** enqueue on that binding. It goes to another idle PM or a new person. Say what remains of `queued_utterance` (same-run follow-up only, or gone).
4. **Hand the protocol.** After sit, the agent must see the protocol + WHERE without a 12k stub at create. Pick the port. Test it. 042: Travis still cannot see their repo.
5. **Logging port.** The protocol says *where* they write. If the log is still a file in a work repo (`docs/register/PHASE-ONE-LOG.md`), say so. If a disposable PM has no work repo, name the silence or the house path. Do not invent a `seat_log` table from this envelope unless Story cannot live in a file.
6. **Do not remint** 012, 013, 014, dest-seat hang 064. Do not auto-seed from `docs/seats/` in migrate. Re-PUT from [`house-now/`](./house-now/) is labor.

---

## Out of this cut

- POSIX unfold into a foreign repo.
- Computer use.
- Integrations table.
- Cross-room log look.
- Killing create / in-the-room as separate moments.
- Growing the create-agent stub into a seat block.
- PM face plates for “pick a role” unless you need one door. Spoken + house is enough if you say so.

---

## Engineer after you

Plant only what the packet names. House files are already filed. Do not invent the pool. Do not kill the queue until you ascribe D4.
