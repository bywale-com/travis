# SYSTEMS-CHANGE-PACKET-027 — Voice New, reply thread, stay

**Number:** `027` — next systems packet is `028`. Never reuse a number.  
**Status:** **Signed.** Plant on this PR ([#140](https://github.com/bywale-com/travis/pull/140)).  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-06  
**PM packet:** [`PM-PACKET-011-VOICE-TPM.md`](./PM-PACKET-011-VOICE-TPM.md)  
**Test:** [`PM-PACKET-011-VOICE-TPM-TEST.md`](./PM-PACKET-011-VOICE-TPM-TEST.md)  
**FACE (look, do not mint from PNG):** [`NEW-MESSAGES-FACE.md`](./NEW-MESSAGES-FACE.md) — staple is **New**, not `ready`. Reply door is a control on a selected message, not a new plate. Stream card staple stays ST3 (025).  
**Prior (do not remint):** **023** `dest_job` · **024** `travis.stream` · **025** hang-on-answering-post · **026** `heard_at` / `seen_at` / offer · 051 New chip · 014 `reference_turn_id` / `nextSeatBeat` · 073 / 074 / 075 Technical PM hang  
**Flag (read-only):** PHASE-ONE-LOG **14:00 UTC 2026-08-25**.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)  
**Held (not this plant):** Travis appends PHASE-ONE-LOG. [`TRAVIS-AS-PM.md`](./TRAVIS-AS-PM.md). No log store.

---

## 1. Intent

One desk. New is an unseen landing **after** the 026 `heard_at` cutoff. Rows that already existed are seen — one-shot write, no remint. Seen is written **now**: Log bubble in view, or a founder `kind=user` turn after that landing. Hear / Skip **buttons** come off. Spoken Hear / Skip / “read it” stay. A reply to a **specific** message writes `reference_turn_id` on that message (column exists). Dest timeout is a dest_job closer, not a stream close with a null card. A later completed post still hangs Stream **above that post**. Refresh restores this phone’s room, view, Talk|Type, and scroll — device persist, no new table. Glass dest is **Technical PM**. Catalog `pm` is hidden and is never the dest binding. Gist is outcome only. When Travis restates the founder, he polishes — same points, his words, excerpts — he does not paraphrase the request away.

---

## 2. Story

### Must

- New = speakable non-Travis `agent_post` with `heard_at` null, **not** catalog `pm`, **after** the cutoff write.
- Cutoff write: every existing unheard cursor-or-person landing is seen at plant. After that, only new inserts are New.
- Seen now: Log intersection (threshold 0.55) **POSTs `/heard` immediately**. A founder `kind=user` turn hears every still-unheard landing with `seq` less than that turn.
- Voice may show the New chip. No Hear / Skip / Hear it **buttons**.
- Spoken `Hear it` / `Skip` / `read it` stay (`parseHearInvite` / `serveInvite`).
- Reply-to a message sets `reference_turn_id` on the new founder (or Travis dest) user line. Copy `initiative_id` from the referenced turn. Ticket Messages is that chain.
- Dest-seat first beat still references the dest user line; later beats reference their last post (`nextSeatBeat`). Unchanged unless he pointed them at another message (the dest user line then references that message).
- Dest job timeout may insert quiet `{label} timed out.` (`speakable=false`). It must **not** call `failLiveStreamWithoutCard`. Stream stays live until a completed dest post lands (025 hang) or the Cursor run ends with no post (then fail without card).
- Refresh (reload / pull-to-refresh) opens the same room, same Voice|Log, same Talk|Type, same scroll. Rooms list only if he was on the rooms list.
- Face dest / New / roster chips do not show catalog `pm`. Spoken / typed “PM” / “Technical PM” dests the seated Technical PM **person** (`resolveRoleDest("pm")`), never `openBindingForSeat(..., "pm")`.
- Empty gist = the offer line once. No “full text / do not read / see the chat” closer.
- Travis restatement (receipt, dest send text, spoken/written line about what he asked) keeps the points and excerpts. `summarizeSeatReply` is for **seat** bodies only.

### Must-not

- Remint 023–026 tables. Remint `heard_at`, `reference_turn_id`, `travis.stream`. New thread store. New stay table. Cousin PR.
- Mint `/protocols/technical-pm.md`. Touch catalog `pm`’s `seat_key`. Plant Travis-appends-PHASE-ONE-LOG.
- Backfill as a general repair of unstamped posts (026 silence stands). This backfill is **heard_at only**.
- Replace Hear / Skip buttons with another pair.
- Close a live stream with `close_turn_id` null because dest_job timed out.
- Invent product caps. Plant canvas.

### Chain

026 `heard_at` exists → **027 cutoff write** marks pre-plant landings seen → a new dest lands → New chip names **that** seat → Log in view **or** his next user turn writes `heard_at` now → Travis does not re-offer it.

Initiative dest → dest user line (optional `reference_turn_id`) → seat `nextSeatBeat` chain → ticket Messages.

Dest run → dest_job may time out (quiet closer) → Cursor run may still finish → absorb post → 025 `close_turn_id` = that post → Stream card above it.

This phone writes `travis-stay` (localStorage) → reload reads it → `enterRoom` + session `view_mode` / `log_submode` + scroll to the persisted turn.

### Silence (named — do not invent)

| Silence | Why |
|---------|-----|
| **Travis writes PHASE-ONE-LOG** | Founder 09:52 / `TRAVIS-AS-PM.md`. Discussed. No port. No store. |
| **Invited urgency** | 007 R1 / 026. Stands. |
| **SSE / job bus** | 023. Poll. |
| **Mutate the tape** | 023. |
| **Heard / Hear / Next as a table** | Spoken invites stay. No hear-queue table. |
| **Cross-device stay** | Device persist only. Not a shared row. |
| **Old unstamped posts** | 026. Not this write. |
| **Failed dest, no post ever** | 025: `failLiveStreamWithoutCard`. Do not invent a card. |
| **022** | Stand. |

---

## 3. Requirements (extraction)

From PM-011 + founder 09:30 / 09:43 / 09:52. Not a second invention.

1. New is true after the cutoff. Stale catalog names die.
2. No Hear it / Skip buttons.
3. Reply-to a specific message. `reference_turn_id` is the staple.
4. Timeout + later complete → Stream card above that post.
5. Refresh = same place.
6. Technical PM on glass. Catalog `pm` hidden.
7. Gist has no invented closer.
8. Travis polishes the request. He does not paraphrase it away.

Plate staples (not scenery):

- **New** (chip names the landing seat). Not `waiting`. Not `3 new · PM, Eng, SA` for old tickets.
- **Stream** card **above** the completed dest bubble (025 / ST3). Timeout line may stay; the card is not required above the timeout line.
- **Technical PM** (dest / roster name). Not catalog `PM`.
- Reply hangs on **that** message. Shared label is the message, not a new compartment title.

Do not build from scenery: Hear/Skip button pair, “do not read” closer, rooms-list dump on refresh.

---

## 4. Stood-up truth (quote, do not remint)

### New / heard

`listUnheardReports` is every speakable cursor `agent_post` with `heard_at` null, filtered by `isCursorSeat` (`pm` \| `sa` \| `engineer` only):

```28:63:src/server/serve.ts
export async function listUnheardReports(
  sessionId: string,
): Promise<UnheardRow[]> {
  // ... kind=agent_post ...
  // isNewReportTurn (heardAt null, speakable, isCursorSeat)
}
```

```15:18:src/lib/seats.ts
export function isCursorSeat(
  key: string | null | undefined,
): key is "pm" | "sa" | "engineer" {
  return key === "pm" || key === "sa" || key === "engineer";
}
```

Person dest `technical-pm` is **not** `isCursorSeat`. A Technical PM landing does not register as New today. Catalog `pm` old posts do.

026 did not backfill:

```189:197:docs/register/SYSTEMS-CHANGE-PACKET-026-SERVE.md
ALTER TABLE travis.voice_turn
  ADD COLUMN IF NOT EXISTS heard_at timestamptz
-- No backfill of old posts as heard.
```

Log-in-view writes only on Log → Voice, and only ids in `seenInLogRef`:

```2047:2057:src/components/Room.tsx
    if (viewModeRef.current === "log" && mode === "voice") {
      const viewed = [...seenInLogRef.current];
      // POST /api/session/${session.id}/heard
    }
```

Intersection collects ids at threshold 0.55 and does **not** POST (`Room.tsx` L2159–2173). His reply in chat does not write `heard_at`. `insertUserTurn` does not call `markTurnsHeard`.

Chip:

```58:63:src/lib/new-report.ts
export function newReportChip(seats: NewSeat[]): string {
  if (!seats.length) return "";
  const names = seats.map((s) => seatShortLabel(s.seatKey, s.label));
  if (seats.length === 1) return `1 new · ${names[0]}`;
  return `${seats.length} new · ${names.join(", ")}`;
}
```

`seatShortLabel("pm")` is `"PM"`.

### Hear / Skip buttons

```2610:2640:src/components/Room.tsx
                  <div ...>
                    <button ...>Hear</button>
                    <button ...>Skip</button>
                  </div>
```

Spoken path already exists: `parseHearInvite` · `serveInvite` · live transcript short-circuits before `insertUserTurn` (`src/app/api/session/[id]/live/transcript/route.ts` L78–86).

### Reply / reference

Column exists (`schema.ts` L69). Dest-seat beats already chain:

```91:116:src/lib/beats.ts
export function nextSeatBeat(...) {
  // first insert → userTurnId
  // later insert → current.id
}
```

`insertUserTurn` does **not** take `referenceTurnId`:

```223:236:src/server/seat-pipe.ts
export async function insertUserTurn(
  sessionId: string,
  prompt: string,
  seatKey: SeatKey,
  initiativeId?: string | null,
): Promise<VoiceTurn> {
  return insertTurn(sessionId, {
    role: "user",
    kind: "user",
    seatKey,
    speakable: true,
    text: prompt,
    initiativeId: initiativeId ?? undefined,
  });
}
```

`insertTurn` already accepts `referenceTurnId`. Send body and live transcript have no field. Face has no reply door.

### Dest timeout vs Stream

```195:210:src/server/dest-job.ts
    const line = ... timed_out ? `${label} timed out.` : ...
    await insertAgentPostTurn(..., false)
    await failLiveStreamWithoutCard({ sessionId, bindingId })
```

```377:383:src/server/stream.ts
export async function failLiveStreamWithoutCard(...) {
  await closeStream({ streamId: live.id, status: "failed", closeTurnId: null });
}
```

`closeStream` only updates `status='live'`. A later reap that lands a post cannot rehang:

```366:374:src/server/stream.ts
    .where(and(eq(stream.id, params.streamId), eq(stream.status, "live")));
```

Reap **can** still absorb the post (`seat-pipe.ts` L832–880) after timeout. Card paint is `closeTurnId === turn.id` (`Room.tsx`). Null close → no card.

`timeOutStaleDestJobs` runs from `inspectAndNudgeQueue` **after** reap (`seat-pipe.ts` L891–897). The lived miss is timeout **while the Cursor run is still live**, then the post lands.

### Stay

`voice_session.view_mode` and `log_submode` already persist on PATCH (`schema.ts` L41–43 · `Room.tsx` `switchViewMode`). `attachSession` restores them.

Room boots `plate: "index"` (`Room.tsx` L305). Mount loads rooms, does not enter (`L1998–2012`). Character persist is `localStorage` key `travis-character` (`src/theme/character.tsx`). No last-room key.

### Technical PM vs catalog pm

```11:18:src/server/db/ensure-bindings.ts
    seatKey: "pm" as const,
    label: "PM",
```

```181:186:src/server/room-membership.ts
export async function openBindingForSeat(sessionId, seatKey) {
  return members.find((m) => m.seatKey === seatKey)?.binding ?? null;
}
```

Spoken “PM” → `parseCallByName` → `seatKey: "pm"` → `openBindingForSeat(..., "pm")` = **catalog** row.

Travis role dest already goes to idle seated of `/protocols/pm.md`:

```191:200:src/server/sit.ts
export async function resolveRoleDest(...) {
  const idle = await findIdleSeated(params.sessionId, parsed.path);
  if (idle) return idle;
  return spinSeatedRole(...)
}
```

Sit path `/protocols/pm.md` is already Technical PM (`docs/register/house-now/protocols/pm.md`). Hang SQL: `src/server/db/hang-technical-pm.sql` — do not touch catalog `pm`. Person dest `technical-pm` is the living bind.

Typed chips drop non-union keys:

```9:21:src/lib/typed-dest.ts
const SEATS: readonly SeatKey[] = ["pm", "sa", "engineer", "travis"];
export function uniqueSeatKeys(...) {
  // drops technical-pm
}
```

`SeatKey` union is `pm | sa | engineer | travis` (`schema.ts` L338). Do not widen the union as source of truth for dest. Dest is an **open member binding**.

### Gist / restatement

```78:80:src/lib/offer.ts
export function gistEmptyFallback(offer: string): string {
  return `${lead} The full text is in the Log.`;
}
```

```13:14:src/server/travis-summarize.ts
const SUMMARY_SYSTEM =
  "Condense this agent reply for someone listening on a phone. Lead with the outcome. ..."
```

`TRAVIS_SYSTEM` opens “Speak short. One or two sentences…” (`travis-tools.ts` L1111). That is the paraphrase pressure on a restatement. `summarizeSeatReply` is the seat-body port only.

---

## 5. Stores / fields / contracts

### Add — no new table. No new column.

| What | Law |
|------|-----|
| **Cutoff write** | One-shot. Signed SQL below. Isolate-once in `ensureInitiativeStore` **and** `migrate.ts`. After this write, New = inserts with `heard_at` null. |
| **Device stay** | `localStorage` key `travis-stay` (same family as `travis-character`). JSON: `{ sessionId, plate: "index" \| "room", scrollTurnId, scrollOffsetPx }`. Not a table. `view_mode` / `log_submode` stay on `voice_session`. |

Signed SQL (heard cutoff — **once**):

```sql
UPDATE travis.voice_turn
SET heard_at = created_at
WHERE heard_at IS NULL
  AND kind = 'agent_post'
  AND speakable = true
  AND seat_key IS DISTINCT FROM 'travis';
```

Do not remint `heard_at`. Do not backfill `seen_at`. Do not stamp `initiative_id`.

### Change — runtime (existing columns / contracts)

| What | Law |
|------|-----|
| **New predicate** | Speakable `kind=agent_post`, `heard_at IS NULL`, `seat_key` is not `travis` and not catalog `pm`. Person dests (`technical-pm`, disposable seats) **count**. Do **not** reuse `isCursorSeat` for New (that function stays for thought/queue/resume). Chip names `label` (Technical PM), not `PM`. |
| **Log in view** | Intersection still 0.55. On intersect of a New report: POST `/heard` **now** with that id. Do not wait for Voice. `seenInLogRef` may still coalesce; the write is the POST. |
| **His answer** | `insertUserTurn` after insert: `markTurnsHeard` on every still-unheard New-predicate row in this session with `seq` < this user turn. Spoken Hear/Skip already short-circuit and do not insert. |
| **Hear / Skip buttons** | Delete both from `Room.tsx`. Chip may stay. Do not plant a replacement pair. |
| **Spoken invites** | Unchanged: `parseHearInvite` / `serveHear` / `serveSkip` / `read it` verbatim. Offer copy still ends `Hear it?` (spoken, not a button). |
| **`insertUserTurn`** | Add optional `referenceTurnId`. Pass through to `insertTurn`. If set and `initiativeId` is empty, copy `initiative_id` from the referenced turn (same as `insertAgentPostTurn`). |
| **Send / live / finalize** | Body field `referenceTurnId?: string`. Face reply door sets it on the next send, then clears. Ticket dest without a pointer: dest user line references the ticket founding / last dest line already stamped (026 inherit). With a pointer: that message. |
| **Reply door** | Control on the **selected** Log or ticket bubble (quiet until invited — not an always-on row chrome stack). Sets pending `referenceTurnId`. Overlay portals (`docs/build-foundation/07-overlay-escape.md`). No second thread store. |
| **Dest-seat chain** | `nextSeatBeat` unchanged. First seat post references the dest user line. Later posts reference the last post of that seat. |
| **`finishDestJobsForBinding`** | Insert the quiet closer. **Do not** call `failLiveStreamWithoutCard`. Dest_job status still `timed_out` / `failed` / `completed`. Stream close is not this function’s job. |
| **Stream close after timeout** | Stream stays `live`. When a dest post lands (`pipeOneSend` / reap absorb): existing 025 hang — `close_turn_id` = that post, `status=completed`. Card above **that** post. Timeout tape line may stay. |
| **Stream close, no post** | When the Cursor run is actually over and `decideDestStreamClose` is not `close`: then `failLiveStreamWithoutCard`. Not at dest_job timeout. |
| **Stay write** | On enter room: `plate="room"` + `sessionId`. On leave / rooms list: `plate="index"`. On Log/Voice thread scroll: persist the turn id at the top of the viewport (`scrollTurnId`) + pixel offset. Talk\|Type already PATCHes the session. |
| **Stay read** | Boot: if `travis-stay.plate === "room"` and that session still exists, `enterRoom(sessionId)` (attachSession restores view + Talk\|Type), then scroll so `scrollTurnId` is at the same place. If `plate === "index"` or no stay: rooms list. Ended room: still enter that room (he was there). Missing turn id: stay in the room; do not dump to index. |
| **Catalog `pm` hidden** | Dest chips, roster dest chips, New names, Create-room picker: omit `seat_key === "pm"`. Show the open member whose `protocol_path` is `/protocols/pm.md` and whose `seat_key` is **not** `pm` (the Technical PM person). Label **Technical PM**. |
| **Spoken / typed “PM”** | `parseCallByName` / typed dest / address / finalize / live transcript: role `pm` resolves with `resolveRoleDest({ sessionId, role: "pm" })` (or the already-idle seated person of `/protocols/pm.md`). **Never** `openBindingForSeat(sessionId, "pm")` and never `bindingForSeat("pm")` as the send target. Aliases: `PM`, `P.M.`, `technical pm`, `technical product manager`. `SIT_ROLE_LABEL.pm` glass string = `Technical PM`. Sit key stays `pm`. Sit files stay the three locked paths. |
| **Person dest chips** | `uniqueSeatKeys` / send must accept an open member’s `seat_key` (including `technical-pm`). Do not drop a person dest because it is outside the `SeatKey` union. Look up `agent_binding` by that key; `requireOpenMember`. |
| **Offer / shorts** | `offerSeatWord` / `newReportBeat` / `seatKeyToLabel`: do not print catalog `PM` as a dest or New name. Person label wins. |
| **`gistEmptyFallback`** | Return the offer line only (or `Hear it?` if offer empty). No second sentence. Recut `offer.test.ts`. |
| **`SUMMARY_SYSTEM`** | Outcome only. Do not append `do not read`, `don't read`, `full text is in the Log`, or `see the chat`. |
| **`TRAVIS_SYSTEM`** | Add a locked paragraph (not a table): when restating the founder — receipt, dest send text, or the next spoken/written line about what he asked — **polish**: same points, his words, excerpts where a stamp would quote. Do not replace the request with a shorter paraphrase that drops a lock. `Speak short` applies to status / receipts, not to a restatement of the ask. `send_to_seat` / `dispatch_to_seat` text is that polish. Never run `summarizeSeatReply` on a founder line. |

### Refuse

- New table. New `voice_turn.kind`. Remint `heard_at` / `reference_turn_id` / `travis.stream`.
- `/protocols/technical-pm.md`. Delete or rename catalog `pm`’s `seat_key`.
- Stay as `voice_session` columns or an operator last-room table.
- Hear-queue table. Gist table.
- General unstamped-post repair. Caps.
- Travis-writes-the-PM-log port.
- Canvas. Cousin PR.

---

## 6. Runtime

### Who writes

| Writer | When | What |
|--------|------|------|
| `ensureInitiativeStore` / `migrate.ts` | 027 plant, once | Cutoff `heard_at` on existing speakable non-Travis `agent_post`. |
| Intersection + `/heard` | Log bubble ≥ 0.55 in view | `heard_at` now. |
| `insertUserTurn` | Founder line (Voice or Type, dest anyone) | `heard_at` on prior unheard New rows. Optional `reference_turn_id` + inherited `initiative_id`. |
| Hear / Skip spoken | `serveHear` / `serveSkip` | `heard_at` on the picked row (026). |
| Dest-seat `nextSeatBeat` | Seat land | `reference_turn_id` as today. |
| `finishDestJobsForBinding` | complete / fail / timeout | Dest_job status + quiet closer. **Not** stream close. |
| Dest absorb / 025 close | Post lands | `stream.close_turn_id` = that post. |
| Cursor run over, no post | reap / pipe | `failLiveStreamWithoutCard`. |
| Face stay | enter / leave / scroll | `travis-stay` localStorage. |
| Face view | existing PATCH | `voice_session.view_mode` / `log_submode`. |

### Who reads

| Reader | What |
|--------|------|
| New chip / offer / hairline | New predicate (not `isCursorSeat`). |
| Ticket Messages / `read_initiative` | 026 list + `reference_turn_id` chain. |
| Stream card | `closeTurnId === turn.id` (unchanged). |
| Dest chips / roster | Open members minus catalog `pm`. |
| Boot | `travis-stay` then session view columns. |

### Triggers (faceless)

- Plant → cutoff write → Voice quiet if nothing newer has landed.
- Seat speakable insert (not catalog `pm`, not Travis) → New chip for **that** seat.
- Log intersect or founder user turn → heard now → chip dies → Travis does not re-offer.
- Dest_job timeout → quiet line. Stream stays. Later post → card above the post.
- Reload → stay restore.

---

## 7. Ports

| Port | This packet |
|------|-------------|
| `summarizeSeatReply` (OpenAI) | Seat bodies only. Empty gist → offer once. Recut closer. |
| Spoken Hear / Skip / verbatim | Real. Buttons off. |
| Cursor dest run / stream | Real. Timeout is dest_job, not Cursor done. |
| `resolveRoleDest("pm")` | Real dest for spoken/typed PM. Catalog `pm` is not a port. |
| Device `localStorage` | Stay. Same family as `travis-character`. |
| Travis-writes-PHASE-ONE-LOG | **Stand-in / silence.** Do not plant. |

No new Cursor puppet. Keys stay server-side.

---

## 8. Verify

Walk [`PM-PACKET-011-VOICE-TPM-TEST.md`](./PM-PACKET-011-VOICE-TPM-TEST.md) on psi, phone, room Travis.

1. Voice: no `3 new · PM, Eng, SA`. No Hear / Hear it / Skip buttons.
2. Sit on an old bubble in Log. Back to Voice: still quiet. Those rows have `heard_at`.
3. Dest Engineer on a named open ticket. New chip names Engineer only. Sit on that bubble → chip gone. Dest again → New. Dest Travis “Yes, stay on that same line.” → chip gone without a long look.
4. Reply door on that Engineer bubble. Line hangs on **that** message. Same ticket. `reference_turn_id` set. Not a cousin initiative.
5. Dest Technical PM (not catalog `PM`). If `{label} timed out.` appears and a completed bubble later lands: Stream card **above that completed bubble**.
6. Log, mark a bubble, pull-to-refresh: same room, Log, same Talk\|Type, same place. Not the rooms list.
7. Dest list: Technical PM. No catalog `PM`.
8. Dest Travis the three-point 011 line. If he restates: those points survive. Empty gist: offer once, no “do not read” closer.

---

## 9. Out of scope

- Remint 023–026. Hang uniqueness. `link` kind.
- Travis-as-trail write port. PHASE-ONE-LOG append from Travis.
- Canvas. Attach-from-phone. SSE bus.
- Recut C3 / C4. 003 waiting chip.
- Delete catalog `pm` row. New sit protocol file.
- Planting `src/` from this seat.

---

## 10. Engineer (paste)

On **this PR** ([#140](https://github.com/bywale-com/travis/pull/140)), in this order:

1. Cutoff `UPDATE` in `ensureInitiativeStore` + `migrate.ts`. Do not remint the column.
2. New predicate without `isCursorSeat`; hide catalog `pm`. Chip uses person `label`.
3. Log intersect POSTs `/heard` now. `insertUserTurn` hears prior unheard. Remove Hear / Skip buttons. Spoken invites stay. Recut `gistEmptyFallback` + `SUMMARY_SYSTEM`. Recut tests that expect the old closer.
4. `insertUserTurn` + send/live/finalize accept `referenceTurnId`. Reply door on selected Log/ticket bubble. Copy `initiative_id` from the referenced turn.
5. `finishDestJobsForBinding` stops calling `failLiveStreamWithoutCard`. Hang 025 when the dest post lands. Fail-without-card only when the Cursor run is over and there is no post.
6. `travis-stay` localStorage. Boot enter + scroll. Leave writes index. `view_mode` / `log_submode` stay on the session.
7. Glass dest: hide catalog `pm`. Spoken/typed PM → `resolveRoleDest("pm")`. Person chips survive send. `SIT_ROLE_LABEL.pm` = `Technical PM`.
8. `TRAVIS_SYSTEM` polish paragraph. `summarizeSeatReply` never on founder lines.
9. Smoke the test sheet. Phone-first Voice + Log.

Do not remint 023–026. Do not mint a cousin. Do not plant Travis-writes-the-PM-log.

Do not send **That’s fine.**
