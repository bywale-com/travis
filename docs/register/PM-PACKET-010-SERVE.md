# PM packet 010 — Serve (plates, ticket thread, hear)

**Number:** `010` — next PM packet is `011`. Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Technical PM. **SA** ascribes as **026**. **Engineer** plants after that ascription. PM does not plant.  
**When:** Named 2026-09-06 — founder: work **2, 3, and 4** in one packet; tests are connected. Pocket **1** (cost) is done.  
**Status:** **2 glass drawn** ([`PLATES-ARTIFACTS.md`](./PLATES-ARTIFACTS.md) O2 / O1 / A1 / A2). **3 and 4 specified.** Founder signs the four plates, then SA **026**.  
**Test spec:** [`PM-PACKET-010-SERVE-TEST.md`](./PM-PACKET-010-SERVE-TEST.md)  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **14:00 UTC 2026-08-25**.  
**Builds on:** 007 hear-queue (locked; do not remint C3/C4) · New / 051 · 008 / 009 / 076 Stream · 062 / 064 `image` \| `file` · considering [`OUTPUT-TYPES-SPEC.md`](./OUTPUT-TYPES-SPEC.md).  
**Next SA:** **026**. Do not remint 023 / 024 / 025. Do not remint hang SQL. Do not remint `travis.stream`.  
**Not a hotfix.** Next hotfix still **077**.

**Where:** this PR. SA and Engineer commit here. Do not mint a cousin.

---

## Founder lock (do not overwrite)

> we can do 2, 3, and 4 … because the tests … are kind of pretty connected. … this would definitely be a packet.

> plates that naturally emerge … just needs plates, really. For three … less about plates. … you stated it very well. … as far as four … we don't even really need plates.

**Canvas later. Do not plant it.** 023 named canvas as must-not.

---

## Why one packet

One walk. Dest a seat on a ticket. That seat posts — text, and often a **plate**. Voice: Travis **offers** it with **that ticket’s context**. Hear / Skip. The ticket read sees the same post (and the plate). Stream card still hangs on the finished line (076).

If 3 is thin, 4 has nothing to name. If 2 never lands in chat, Hear has nothing to point at. Do not split.

---

## Pocket 2 — Output types (plates in chat + voice)

**Job:** The common output he needs to see is a **plate in chat**, in order, without opening Cursor. Voice must tell him it is there without stealing the orb or reading pixels.

**Planted (quote; do not remint):**

- Store: `travis.turn_artifact`, kinds `image` \| `file` (`src/server/db/schema.ts`, 062 / 064).
- Hang: `harvestTurnArtifacts` on the seat `agent_post` (`src/server/artifacts.ts`).
- Log paint: `TurnAttachments` — filename + `<img>` under the turn (`src/components/TurnAttachments.tsx`).
- Ticket files: `attachmentsForInitiative` only sees artifacts on **stamped** turns.

**Lived miss:** plates often never hang (`turn_artifact` was 0 on the 09-04 walk). Voice had no door except View log.

**Glass (founder 03:16, drawn 03:51):** [`PLATES-ARTIFACTS.md`](./PLATES-ARTIFACTS.md).

| ID | File | Job |
|----|------|-----|
| **O2** | Voice | First icon (document) at the **top**. Badge = unseen count. No still on the orb. |
| **O1** | Log | Same icon + badge. Inline plate in the bubble stays planted. |
| **A1** | Compartment | Title Artifacts. List. New = weight. |
| **A2** | Full | Most/full screen. **X**. |

**Seen:** sat in view on the Log, **or** opened in Artifacts. Badge dies at 0.

**Achievement (product):**

1. A plate the run emits **appears in the Log bubble**, in stream order. Not a gallery. Not canvas.
2. Same plate is in **Artifacts**. Voice learns it from the **badge**, not a still on the orb.
3. Talk and Type can open it. Dead ref → muted line.
4. Links stay 005. Files are quiet rows. Wave 2–4 later.

Considering Wave 1 beat (“There’s an image.”) is **not** this glass. The icon is.

---

## Pocket 3 — Initiative curate + Travis query

**Job:** When he is in Voice talking to Travis about a ticket, Travis can query the **real thread** — founding line, dests, seat posts, streams that belong to that work — not a thin stamp that misses follow-ons.

**Planted (quote; do not remint):**

- Ticket Messages = `turnsForInitiative` = `voice_turn` where `initiative_id` is set (`src/server/initiative.ts`).
- Seat post copies the stamp from the **answered user turn** (`src/server/seat-pipe.ts`). If that dest line has no `initiative_id`, the post has none.
- `read_initiative` then says **“No seat has posted on this ticket.”** even when Engineer posted in the room (`formatInitiativeRead`).
- `stampLatestPassOn` / `ticketForHand` try to hang a dest on an open ticket when Travis passed `id` or named a title. Direct dest and follow-on seats often never get it.
- Stream is planted (008 / 009 / 076). Stream is **not** this ticket. 008 said: initiatives are curated **completed** logs; do not plant curate inside 008.

**Achievement (product):**

1. Work done **on** a ticket is **on** that ticket. Founding, dest user lines, seat posts, hung plates, and the completed Stream card for that work.
2. Follow-on seats on the same ticket stamp. A second Engineer, SA, this Technical PM — if the dest was that ticket, the post is on it.
3. Travis `read_initiative` / “what’s on that ticket?” speaks that thread. A miss is no match, not an empty cousin.
4. Voice can ask about an initiative and get the messages and streams that belong to it.

**Specified but not clear — SA ascribes (do not mint a table):**

- How a follow-on dest inherits the ticket when Travis did not pass `id`.
- How a Stream / card hangs on the ticket (existing `travis.stream` + stamp, or named silence).
- Backfill of old unstamped posts: ascribe or name silence. Do not invent a second messages store.

**3 makes 4 true.** The offer needs a name for “that other thing.”

---

## Pocket 4 — Seat lands: offer, don’t barge

**Job:** No seat talks first. Travis offers a landing **with context**. Hear it / Skip. Five seats = five offers.

**Planted / locked (do not remint):**

- 007 Hear / Next / Skip — [`PM-PACKET-007-HEAR-QUEUE.md`](./PM-PACKET-007-HEAR-QUEUE.md) · [`HEAR-QUEUE-SPEC.md`](./HEAR-QUEUE-SPEC.md). C3 / C4 stay **003** (your send-queue).
- New / 051: unheard seat posts are **New**. Travis notifies. Bodies are not a second mouth. [`NEW-MESSAGES-FACE.md`](./NEW-MESSAGES-FACE.md). Heard-that-survives-refresh still SA.
- Dest-job closer posts a Travis line `{label} finished.` with **no** ticket and **no** Hear (`src/server/dest-job.ts`).

**Lived miss:** interrupt **“New message from engineer,”** or the landing is **lost**. No context. 007 R2 (sheet + gist + Skip) not planted as the serve.

**New grain (02:28, founder):** a seat post is always a **response** (initiative or not). Travis offers it **with that context** — “about that other thing, this is what the Engineer has to say. Hear it?” **Skip** = out of the queue; the turn stays in the Log (and on the ticket once 3 is true).

**Achievement (product):**

1. Seat insert does **not** start Google TTS / a second mouth. One mouth: Travis.
2. When the ear is free, Travis **offers** — names the seat and the context (ticket title, or “that other thing” if there is no ticket). Not the body. Not “New message from engineer” as the product.
3. **Hear** / Next / play-on-bubble → rundown **gist**. Full text stays in the Log. Verbatim on request.
4. **Skip** drops the offer. Post remains.
5. Several landings while he talks: chip updates; **one** coalesced offer when the ear frees — not a stack of barges.
6. Log still paints the post (005). New cut (051) still means unheard.

**Specified but not clear — SA ascribes:**

- Durable heard / ready vs session-local New (007 R1 / 051 silence). Do not mint from vibes.
- Speakable gist vs existing summarize.
- Exact offer copy if the founder recuts 02:28.

---

## Must-not

- Do not plant canvas / board / Fieldtop.
- Do not remint C3 / C4.
- Do not remint `travis.stream`, hang SQL, 023 / 024 / 025 tables.
- Do not mint a second messages or artifact store.
- Do not invent triage (which landing matters).
- Do not auto-read a 40k body.
- Do not put the still on the Voice orb unless O2 says so.

---

## Five buckets

### Specified and clear — Engineer after SA 026

1. Ticket thread is complete for dests that belong to it (pocket 3).
2. Travis can read that thread (pocket 3).
3. Landings offer with context; Hear / Skip; no barge (pocket 4).
4. Plates that hang already paint on the Log (planted). After O1 / O2: Voice beat + inline look as signed.

### Specified but not clear — SA

1. Follow-on stamp + stream-on-ticket grain.
2. Heard bit.
3. Gist grain.
4. Image arrive / persist / fail (062 store exists; harvest miss is a contract, not a new table).
5. O2 glass — after plates.

### Completes (implied)

Skip leaves the Log intact. Jump / 035 still holds on a tall plate. 006 Voice-quiet stays. 076 one closer post stays.

### Out

Canvas. Attach-from-phone. Gallery. Share-to-web. Video. Second IDE. Cost dashboard.

### Must-not

Listed above.

---

## Paste — Systems Analyst

```text
Read docs/register/PM-PACKET-010-SERVE.md ALL THE WAY THROUGH, then PM-PACKET-010-SERVE-TEST.md. Founder: pockets 2 + 3 + 4 are one packet (010). Pocket 1 (cost) is done. Canvas later.

You are Travis’s Systems Analyst. Identity: docs/README.md § Systems Analyst. Stamp SYSTEMS-ANALYST-LOG. Change packet 026. Do not mint a table from the PM packet. Quote stood-up initiative stamp, turn_artifact, dest-job closer, 007 / 051, stream.

Ascribe: (1) follow-on dest + stream on the ticket — existing columns or named silence; (2) heard/ready vs session-local New; (3) speakable gist; (4) why harvestTurnArtifacts misses and how an image/file arrives; (5) offer copy fields (seat + context). Do not remint 023–025. Do not remint hang SQL. Do not remint travis.stream. Wait on O1/O2 only for Voice glass — 3 and 4 do not wait on plates.
```

## Paste — Engineer

```text
Read docs/register/PM-PACKET-010-SERVE.md ALL THE WAY THROUGH, then the test spec, then SA 026.

You are Travis’s Engineer. Identity: docs/README.md § Engineer · AGENTS.md. Do not overwrite PHASE-ONE-LOG 14:00. Do not append PM/SA logs. Do not mint tables. Do not plant canvas. Do not recut C3/C4.

Plant after SA 026. One PR — this one. Two buckets only.
```
