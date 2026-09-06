# SYSTEMS-CHANGE-PACKET-026 — Serve (ticket thread, plates, offer)

**Number:** `026` — next systems packet is `027`. Never reuse a number.  
**Status:** **Signed.** Plant on this PR ([#134](https://github.com/bywale-com/travis/pull/134)).  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-06  
**PM packet:** [`PM-PACKET-010-SERVE.md`](./PM-PACKET-010-SERVE.md)  
**Test:** [`PM-PACKET-010-SERVE-TEST.md`](./PM-PACKET-010-SERVE-TEST.md)  
**FACE (look, do not mint from PNG):** [`PLATES-ARTIFACTS.md`](./PLATES-ARTIFACTS.md) **O2 / O1 / A1 / A2**.  
**Prior (do not remint):** 007 Hear C3/C4 · 023 `dest_job` · **024** `travis.stream` · **025** close hang · 062 / 064 `turn_artifact` · 051 New  
**Flag (read-only):** PHASE-ONE-LOG **14:00 UTC 2026-08-25**.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

---

## 1. Intent

One walk. Dest a seat on a ticket. That dest user line and the answering seat post stamp onto **that** ticket. The completed Stream card hangs on the landed post via existing `close_turn_id` — no `stream.initiative_id`. A plate the run emits hangs on that post (`turn_artifact`) and paints in the bubble and in Artifacts. Voice learns it from the first-icon badge, not a still on the orb. Seat insert does not speak the body. Travis offers with seat + ticket title (or “that other thing”). Hear is a computed gist. Skip writes heard and leaves the post. Do not remint 023–025. Do not remint hang SQL. Do not mint a second messages or artifact store.

---

## 2. Story

### Must

- Work done **on** a ticket is **on** that ticket: founding, dest user lines, seat posts, hung plates, completed Stream card for that work.
- Follow-on dest without `id` inherits the last ticket this room dest’d onto. Do not mint a cousin from “also dest SA.”
- A dest user line that already has `initiative_id` is not retargeted.
- Stream belongs to the ticket through stamped turns. No new stream column.
- Seat insert does not start TTS / a second mouth. One mouth: Travis.
- When the ear is free, Travis **offers** — seat + context. Not the body. Not “New message from engineer.” Not `{label} finished.` as the product.
- Hear / Next → gist (`summarizeSeatReply`). Full text stays in the Log. Verbatim on request.
- Skip drops the offer (`heard_at`). Post stays in the Log and on the ticket.
- Several landings while he talks: chip updates; **one** coalesced offer when the ear frees.
- A plate that hung appears in the Log bubble, in order. Same plate is in Artifacts. Badge = unseen count. Seen = sat in view on the Log **or** opened in Artifacts.
- Dead artifact ref → muted line.

### Must-not

- Remint `travis.stream` / `travis.stream_event`. Recut 023. Remint hang SQL. New messages store. New artifact store. Cousin PR.
- Add `stream.initiative_id`.
- Plant canvas / board / Fieldtop. Still on the Voice orb.
- Recut C3 / C4 (`queued_utterance` is your send-queue).
- Auto-read a 40k body. Invent triage (which landing matters).
- Mint invited-urgency. General backfill of old unstamped posts.
- Merge ticket Artifacts tab with the first-icon Artifacts compartment in the SPA.

### Chain

Travis dest (`send_to_seat` / `dispatch_to_seat` / ticket dest) → `ticketForHand` resolves ticket → dest user turn + `dest_job` stamped → seat `agent_post` copies that stamp → harvest hangs `turn_artifact` on that post → 024/025 close hangs Stream on `close_turn_id` → ticket Messages / `read_initiative` see those rows → landing is New (`heard_at` null) → ear free → offer (seat + title) → Hear (gist) or Skip → `heard_at` set. Plate `seen_at` is a different write.

### Silence (named — do not invent)

| Silence | Why |
|---------|-----|
| **Old unstamped posts** | No general repair. New dests stamp. Old cousins stay until a later seat names rows. |
| **Invited urgency** (“tell me when Engineer is done”) | 007 R1. Not this walk. |
| **Second-tab live sync bus** | Poll + `heard_at` / `seen_at` is enough. No SSE. |
| **Voice beat “There’s an image.”** | Considering Wave 1. This glass is the icon + badge. |
| **Canvas / Fieldtop** | 023 must-not. Later. |
| **`link` kind / founder upload** | 009/064 `image` \| `file` only. |
| **022 / SSE bus** | Stand. |

---

## 3. Requirements (extraction)

From PM-010 + founder 02:28 + O2/O1/A1/A2. Not a second invention.

1. Ticket thread is complete for dests that belong to it.
2. Travis `read_initiative` / “what’s on that ticket?” speaks that thread. A miss is no match, not an empty cousin.
3. Landings offer with context; Hear / Skip; no barge.
4. Plates that hang paint on the Log (already). After O1 / O2: first icon + badge + compartment + full.

Plate staples (not scenery):

- **Artifacts** (compartment title).
- Same **document** icon on Voice and Log. Voice: **top** of the header (leading, before the room pill).
- Badge numeral = unseen count. Gone at 0; icon stays.
- **New** weight on unseen rows. **X** out of full.
- Offer names the **seat** and the **ticket title** (or “that other thing”).

Do not build from the PNG: lamp photograph, fake filenames (`output-type-image.png`, `hear-queue-o2.png`), desktop DevTools, four seat marks as law, a second header row, filter grid, search, type tabs.

---

## 4. Stood-up truth (quote, do not remint)

### Ticket stamp

Seat post copies `initiative_id` from the dest user turn only:

```267:308:src/server/seat-pipe.ts
    const [answered] = await db
      .select({ initiativeId: voiceTurn.initiativeId })
      .from(voiceTurn)
      .where(eq(voiceTurn.id, params.userTurnId))
      .limit(1);
    const initiativeId = answered?.initiativeId ?? undefined;
    // ...
        initiativeId,
```

`ticketForHand` without `id`: named title in send / Travis speech, else `ensureViaTravis` (latest founder→Travis line — **mints** if that line is unstamped):

```270:294:src/server/initiative.ts
export async function ticketForHand(
  sessionId: string,
  initiativeId?: string,
  sendText?: string,
): Promise<Initiative | null> {
  // id → that ticket
  // else namedTicketFromSpeech(open titles, send + recent Travis speech)
  // else ensureViaTravis(sessionId)
}
```

After dest, `stampLatestPassOn` → `stampPassOn` → `ensureViaTravis` then `stampTurn` on the dest user line. That **overwrites** a dest line that `insertUserTurn` already stamped with `prior.id`.

`dest_job.initiative_id` already exists (`src/server/db/schema.ts` L204). File it. Do not remint the table.

Ticket Messages = `turnsForInitiative` = `voice_turn.initiative_id`. `readInitiative` then runs `canonicalPosts` — **latest post per seat only** (`src/lib/initiative.ts` L64–73). Ticket Messages / Travis read must list **all** stamped dest user lines and cursor-seat posts, in `seq` order. `canonicalPosts` stays for `next` / lit seats only.

`formatInitiativeRead` says “No seat has posted on this ticket.” when that filtered list is empty (`src/server/initiative.ts` L748).

`travis.stream` has `trigger_turn_id` and `close_turn_id`. No `initiative_id`. Card paint is already `closeTurnId === turn.id` (`Room.tsx` L2629–2631). Ticket face (`BacklogTicket`) does not paint Stream cards.

### Harvest

```57:108:src/server/artifacts.ts
export async function harvestTurnArtifacts(params: {
  post: VoiceTurn | null;
  binding: AgentBinding;
  startedAt: Date | null;
}): Promise<void> {
  // return if !post, !startedAt, !cursorAgentId
  // listCursorArtifacts(agentId) — [] on !ok / no key / bad id
  // shouldHangArtifact requires startedAt AND updatedAt
}
```

```37:44:src/lib/artifact-kind.ts
export function shouldHangArtifact(params: {
  startedAt?: Date | null;
  updatedAt?: Date | null;
}): boolean {
  if (!params.startedAt || !params.updatedAt) return false;
  return params.updatedAt.getTime() >= params.startedAt.getTime();
}
```

Cursor port: `GET https://api.cursor.com/v1/agents/{id}/artifacts` (`src/server/cursor-port.ts` L62–96). Agent-scoped folder. Bytes via download URL; Travis never stores the 15-minute URL. Proxy at `/api/artifacts/{id}`.

Harvest runs after dest close (`seat-pipe.ts` L713) and reap (`L858`). If `destClose.action !== "close"`, no post, no hang.

### New / offer (session-local)

051: `newIds` + `newBaselineSeqRef` in `Room.tsx`. First poll sets baseline to max seq — refresh forgets New. Beat is `newReportBeat`: “Engineer has something new.” (`src/lib/new-report.ts` L58–68). Leaving Log → Voice clears `newIds` (`Room.tsx` L1926–1928) and does not persist.

Dest-job closer is a **speakable** Travis line with no ticket and no Hear:

```194:202:src/server/dest-job.ts
    const line =
      params.status === "completed"
        ? `${label} finished.`
        : /* timed_out / failed */;
    await insertAgentPostTurn(params.sessionId, line, "travis");
```

`summarizeSeatReply` already exists (`src/server/travis-summarize.ts`). `read_seat_reply` uses it. Hear reuses it. Do not mint a gist store.

Header today starts with the room pill (`Room.tsx` L2142–2171). No chrome icon registry in `src/`.

---

## 5. Stores / fields / contracts

### Add — two columns. No new table.

Story bears durable facts. 007 R1 / 051 named the hole. Pocket 4 and O2 badge cannot be session-local.

| Column | Law |
|--------|-----|
| **`travis.voice_turn.heard_at`** `timestamptz NULL` | Null = unheard. Ready / New = speakable cursor-seat `agent_post` with `heard_at IS NULL`. Set when Hear starts the gist, Skip, or the post sat in view on the Log. Skip does not delete the turn. |
| **`travis.turn_artifact.seen_at`** `timestamptz NULL` | Null = unseen. Badge = count of this session’s artifacts with `seen_at IS NULL`. Set when the still sat in view on the Log **or** the row / full screen opened in Artifacts. Different from `heard_at`: a post can be heard while its plate is unseen. |

Signed SQL (isolate-once in `ensureInitiativeStore` / `ensureArtifactStore` **and** `migrate.ts`):

```sql
ALTER TABLE travis.voice_turn
  ADD COLUMN IF NOT EXISTS heard_at timestamptz;

ALTER TABLE travis.turn_artifact
  ADD COLUMN IF NOT EXISTS seen_at timestamptz;
```

No backfill of old posts as heard. Existing rows stay New until Hear / Skip / Log view. Existing artifacts stay unseen until seen.

### Change — runtime (existing columns)

| What | Law |
|------|-----|
| **`ticketForHand` without `id`** | (1) Named open title in send text or recent Travis speech — already. (2) Else latest `dest_job` in this session with `initiative_id IS NOT NULL`, newest `created_at`, ticket still `open` — inherit that id. (3) Else latest dest `voice_turn` (`kind=user`, cursor seat, `initiative_id` set), ticket still `open` — inherit. (4) Only then `ensureViaTravis` (may mint). |
| **`stampPassOn` / `stampLatestPassOn`** | If the dest user line **already has** `initiative_id`, **do not** `stampTurn` onto `ensureViaTravis`. Leave it. File `dest_job.initiative_id` as the dest’s ticket; do not retarget. |
| **Seat post stamp** | Unchanged: copy from dest user turn. Once the dest line is right, the post is right. |
| **Ticket Messages / `readInitiative` posts** | All stamped `kind=user` dest lines and cursor-seat `kind=agent_post` on that `initiative_id`, `seq` asc. Not `canonicalPosts`. `canonicalPosts` stays for `next` / `litSeatKeys` only. |
| **Stream on ticket** | No new column. A stream belongs to the ticket when `trigger_turn.initiative_id` **or** `close_turn.initiative_id` is that ticket. Ticket Messages paint the completed Stream card above the close post (same filter as Log: `status IN ('completed','failed')` AND `close_turn_id` set). `read_initiative` / `formatInitiativeRead` name those cards (title **Stream**, trigger text). Live stream: wait until close; do not hang live on the ticket. |
| **`formatInitiativeRead` empty line** | “No seat has posted on this ticket.” only when there is no stamped cursor-seat `agent_post`. A completed Stream on a stamped close post is a post. |
| **`shouldHangArtifact`** | If `updatedAt` is missing and `startedAt` is set and the path is not already hung on this `(session_id, binding_id)`, **hang**. Still skip if `startedAt` is missing. If both times exist, keep `updatedAt >= startedAt`. |
| **Harvest retry** | After dest close / reap, if the post landed and `listCursorArtifacts` returned `[]`, **one** retry then mute. Fail stays `console.error` + no row. Dead proxy → muted line on glass. Do not remint `turn_artifact` besides `seen_at`. |
| **Dest-job closer** | Keep the tape line. `insertAgentPostTurn(..., "travis", null, false)` — **`speakable=false`**. No `initiative_id`. Not Hear. Not the offer. |
| **Offer (replace `newReportBeat` as the spoken product)** | When the ear is free and there is at least one unheard cursor-seat speakable `agent_post`: Travis Live mouth (if up) or conductor. Copy below. Chip stays 051 **New** (`n new · Eng`). Not the word `waiting`. |
| **Hear / Next** | Oldest unheard, or named seat’s oldest unheard. Speak `summarizeSeatReply(body)`. If gist is empty (no `OPENAI_API_KEY` / fail): do **not** TTS the raw body. Say the offer once more and that the full text is in the Log. Then set `heard_at`. Verbatim only on request (`form=full` / “read it”) with the existing `READ_CAP` clip. |
| **Skip** | Set `heard_at` now. Turn stays. Ticket stamp stays. |
| **Coalesce** | Ear busy: chip only. Ear frees: **one** offer for everything still unheard. Not a stack of barges. |
| **New cut** | Hairline sits on the first unheard report in display order (`heard_at IS NULL`), not session `newIds`. Leaving Log → Voice still clears the chip **and** writes `heard_at` for posts that sat in view. |
| **First icon** | Document glyph. Token tint `t.textSecondary`. Plant a chrome **registry** map (one slug, e.g. `artifacts`). Do not import a raw SVG in `Room.tsx`. Same control on Voice and Log. Voice: **leading** of the shared header, before the room pill. |
| **Badge** | Count of `turn_artifact` in this session with `seen_at IS NULL`. `t.accent` (Mission oxblood). No numeral at 0; icon stays. |
| **Artifacts compartment** | Title **Artifacts**. Same sheet family as Stream / Requests. Close. Quiet list: thumb + filename. Unseen = weight. Seen = muted. Empty = one muted line. File (`kind=file`) = quiet row, open/save, not a still. Overlay portals. |
| **Full (A2)** | Most/full screen. **X** returns to the list. Then Close returns to Voice or Log. Opening a row or full sets `seen_at`. Inline `TurnAttachments` stays; viewing the still sets `seen_at`. |
| **Ticket Artifacts tab** | Stays `attachmentsForInitiative`. Do not merge with the first-icon compartment. |

### Offer copy (locked — do not invent)

Seat word = `Engineer` / `PM` / `SA` / else `agent_binding.label`.  
Context = `initiative.title` if the post (or its dest user / `dest_job`) has `initiative_id`, else the literal **that other thing**.

| Case | Speak |
|------|--------|
| One, has title | `About {title}, this is what the {Seat} has to say. Hear it?` |
| One, no ticket | `About that other thing, this is what the {Seat} has to say. Hear it?` |
| Two+ coalesced | `About {titles or that other thing}, this is what the {Seat} and the {Seat} have to say. Hear it?` (more seats: list, one “Hear it?”). |

Not stored. Not a table. Not the post body.

### Refuse

- New table. New `voice_turn.kind`. `stream.initiative_id`. Gist table. Hear-queue table. Invited store.
- Remint 023 / 024 / 025 SQL. Remint `turn_artifact` hang uniqueness / kind check.
- Opening Stream on the ticket while live.
- General unstamped-post backfill.
- Caps on landings or artifact count.
- Canvas. Attach-from-phone. Gallery.

---

## 6. Runtime

### Who writes

| Writer | When | What |
|--------|------|------|
| `ticketForHand` | dest without / with `id` | Resolve ticket (inherit law above). |
| `insertUserTurn` / `insertDestJob` | dest start | Stamp dest user + `dest_job.initiative_id`. |
| `stampLatestPassOn` | after dest | Stamp **only** if dest user `initiative_id` is null. |
| `absorbStreamingAgentPost` | seat land | Copy stamp from dest user. Unchanged. |
| `harvestTurnArtifacts` | dest close + reap | Hang `image` \| `file`. New hang window + one retry. |
| `closeStream` | dest done (025) | `close_turn_id` = landed post. Unchanged. |
| `finishDestJobsForBinding` | dest complete / fail / timeout | Quiet `{label} finished.` (`speakable=false`). |
| Hear / Skip / Log-in-view | founder | `voice_turn.heard_at`. |
| Log still in view / Artifacts open | founder | `turn_artifact.seen_at`. |
| Travis offer | ear free + unheard | Live notify / conductor. Not a `voice_turn` unless you already persist facilitator beats — do **not** insert the offer as a second mouth on the ticket. |

### Who reads

| Reader | What |
|--------|------|
| Ticket Messages / `read_initiative` | Stamped dest lines + all cursor-seat posts + Stream cards via close/trigger stamp + attachments. |
| `formatInitiativeRead` | Same, gist-length clips. Names Stream trigger lines. |
| New chip / cut | Unheard cursor-seat speakable posts. |
| Artifacts badge / list | This session’s `turn_artifact`, unseen first (weight). |
| Hear rundown | `summarizeSeatReply` at invite time. |

### Triggers (faceless)

- Dest user stamped → seat post stamped → harvest → stream close.
- Seat speakable `agent_post` insert → New / chip. No body TTS.
- Ear frees → one offer.
- Hear / Skip / Log view → `heard_at`.
- Plate in view or Artifacts open → `seen_at`. Badge dies at 0.

---

## 7. Ports

| Port | This packet |
|------|-------------|
| Cursor `GET /v1/agents/{id}/artifacts` | Real. Empty / fail → no row (one retry). Do not invent a second list. |
| Cursor artifact download | Real. Proxy only. Never persist the signed URL. |
| `summarizeSeatReply` (OpenAI text) | Real if `OPENAI_API_KEY`. Empty gist → no 40k TTS. |
| Travis Live notify | Real offer mouth when Live is up. Else conductor. Never Google-TTS the seat body. |
| Chrome icon registry | Plant. One document slug. Token tint. |

No stand-in table. No new Cursor puppet.

---

## 8. Verify

Walk [`PM-PACKET-010-SERVE-TEST.md`](./PM-PACKET-010-SERVE-TEST.md) on PR **#134** preview. Phone-first Voice + Log.

1. Dest on a named open ticket. Dest user line has that `initiative_id`. Receipt. Not a new cousin.
2. Seat posts. Bubble in the Log. Plate in that bubble if harvest hung (O1). Stream card **above** that line if this episode had a stream (076 / 025 — not a new object).
3. Open the ticket. Messages has that dest line + that post + plate + Stream card. Not empty while the Log has the work.
4. Dest Travis. `What's on that ticket?` He names the ticket and the seat post. He does **not** say no one has posted.
5. Dest a seat on the same ticket again (no `id` if Travis forgets — inherit). While they finish, keep talking to Travis. Seat body does **not** speak over you. Offer: about **that ticket**, this is what {seat} has. Hear it? Not “New message from engineer.” Not `{label} finished.` as speech.
6. Skip. Offer gone. Post stays in the Log and on the ticket. Refresh: still heard (not New).
7. Another landing. Hear. Gist. Not the raw 40k. Plate: icon + badge; no still on the orb (O2). View log shows the still.
8. Two landings while he spoke: one coalesced offer.
9. Artifacts icon top-left on Voice, same on Log. Badge = unseen. Open list (A1). Open full (A2). **X**. Badge 0 after seen.
10. No new `travis.stream` column. No cousin PR. No canvas.

---

## 9. Out of scope

- Remint 023 / 024 / 025 tables. Hang uniqueness. `link` kind.
- Canvas. Attach-from-phone. Gallery. Share-to-web. Video. Cost.
- Invited urgency. General stamp repair.
- Recut C3 / C4. 003 waiting chip.
- Planting `src/` from this seat.

---

## 10. Engineer (paste)

On **this PR** ([#134](https://github.com/bywale-com/travis/pull/134)), in this order:

1. `ALTER` `voice_turn.heard_at` and `turn_artifact.seen_at`. Drizzle + isolate-once + `migrate.ts`.
2. Rewrite `ticketForHand` inherit (dest_job → last dest user → then `ensureViaTravis`). `stampPassOn` must not retarget a dest line that already has `initiative_id`.
3. Ticket Messages / `readInitiative` / `formatInitiativeRead`: all stamped dest lines + cursor-seat posts + Stream cards via existing hang. `canonicalPosts` only for `next` / lit.
4. Harvest: hang without `updatedAt` if path is new; one retry on empty list. Dest-job closer `speakable=false`.
5. Offer / Hear / Skip / New cut on `heard_at`. Reuse `summarizeSeatReply`. Chip stays New.
6. First icon + badge + Artifacts sheet + full (O2/O1/A1/A2). Registry glyph. `seen_at`. Inline `TurnAttachments` stays. No still on the orb.
7. Smoke the test sheet. Phone-first Voice + Log.

Do not remint 023–025. Do not remint hang SQL. Do not mint a cousin.

Do not send **That’s fine.**
