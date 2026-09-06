# SYSTEMS-CHANGE-PACKET-028 — Usable chat (reply dest, hang visible images, ticket stay)

**Number:** `028` — next systems packet is `029`. Never reuse a number.  
**Status:** **Signed.** Plant on this PR ([#142](https://github.com/bywale-com/travis/pull/142)).  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-06  
**PM packet:** [`PM-PACKET-012-USABLE-CHAT.md`](./PM-PACKET-012-USABLE-CHAT.md)  
**Test:** [`PM-PACKET-012-USABLE-CHAT-TEST.md`](./PM-PACKET-012-USABLE-CHAT-TEST.md)  
**Story (glass):** [`USABLE-CHAT.md`](./USABLE-CHAT.md)  
**FACE (look, do not mint from PNG):** [`PLATES-LOG-FACE.md`](./PLATES-LOG-FACE.md) · [`LOG-FORMAT-FACE.md`](./LOG-FORMAT-FACE.md) — staple is the **author** on Reply (quote names who) and the **picture under that post**. Ticket Messages stays the thread he is in.  
**Prior (do not remint):** **027** `reference_turn_id` / Reply door / stay / New cutoff · **026** `heard_at` / `seen_at` / harvest retry · **025** hang-on-answering-post · **024** `travis.stream` · **023** `dest_job` · **062 / 064** `turn_artifact` `image` \| `file` · 014 `nextSeatBeat`  
**Flag (read-only):** PHASE-ONE-LOG **14:00 UTC 2026-08-25**.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)  
**Desk:** `https://travis-psi.vercel.app` — room Travis. Voice parked. Walk the **Log**.

---

## 1. Intent

The Log is already a chat in the store. Reply already writes `reference_turn_id`. Dest still comes from chips / call-by-name / sticky `activeBindingId`. That is the hole: a reply to a person does not dest that person, and a reply to a reply walks neither the author nor the first dest — it ignores the pointer. Ticket Reply closes the ticket and dumps him on the room Log. Harvest only lists Cursor’s artifacts API after `run_started`, keyed session-wide, so a printed existing plate and a markdown / tool image never hang on **this** post. Same columns. Same tables. Dest the referenced turn’s **author**. Hang every picture that is visible in that Cursor turn on that `agent_post`. Stay on the ticket to finish the send. Smoke on **psi**, not `src/`.

---

## 2. Story

### Must

- Reply to an `agent_post` dests **that post’s author** (`voice_turn.seat_key` of the referenced row). Reply to a reply dests **that** author — this turn only. Do not walk `reference_turn_id`.
- He does not `@` again. Chips / sticky / call-by-name do not replace the author dest when the pointer is a dest-able author.
- Quote names **who** (author label), not only sliced body.
- If the picture is in the Cursor turn — artifacts API item, tool image path, or markdown image — it hangs on **that** `agent_post` as `turn_artifact` (`image` \| `file`) and paints under that post. Same path may hang on a later post.
- Ticket Reply compose + send stay on **that ticket**. Same `reference_turn_id`. Same dest-the-author lock. He is not sent to the room Log to finish.
- Type send is the walk. Same dest-from-reference function on `/send` (and on live / finalize so Voice does not rot).
- Verify on **psi** Log · Type. Preview-only Pass is not Pass.

### Must-not

- Remint 023–027 tables or columns. Remint `reference_turn_id`, `heard_at`, `seen_at`, `turn_artifact`, `travis.stream`. New messages / artifact / stay / dest table. Cousin PR.
- Walk the reply chain to the first dest. Dest the founder. Mint `/protocols/technical-pm.md`.
- Put Hear it / Skip **buttons** back. Plant canvas. Invent product caps.
- Treat `kind=user` `seat_key` as author (that field is who the line was sent **to**).
- Keep session+binding `alreadyHung` (that blocks a printed existing plate on a new post).
- Pass from `src/` alone.

### Chain

Reply door sets `pendingReferenceTurnId` → Type send writes `reference_turn_id` (027, stands) → **destFromReferencedTurn** reads **that** row’s author → `resolveDestBinding` / Travis bind → `sendOrEnqueueMany` / `pipeTravisText` → sticky follows the author.

Dest seat post lands → harvest (API window **or** markdown image **or** process image path) → `turn_artifact` on **this** `post.id` → `TurnAttachments` under that bubble.

Ticket Messages → Reply → ticket stays mounted → Type compose on that ticket → same `/send` → new user line inherits `initiative_id` (027) → dest author → ticket Messages shows the new line.

### Silence (named — do not invent)

| Silence | Why |
|---------|-----|
| **Reply to a founder line** (`kind=user`) | Author is him. `seat_key` on that row is dest-they-sent-to, not author. Dest stays chips / call-by-name / sticky. Stay-on-ticket still applies. |
| **Walking `reference_turn_id` to the first dest** | Refused. This turn’s author only. |
| **`link` kind / founder upload** | 009 / 064. `image` \| `file` only. Bare `http(s)` text stays a tappable link (062). |
| **Hear / Next / Skip as a table** | 027. Spoken invites stay. Buttons stay off. |
| **Voice conductor / barge-in** | Voice parked this cut. |
| **Chunked box / PTY** | 024. |
| **Canvas / Fieldtop** | 023. |
| **022 / SSE bus** | Stand. Poll. |
| **Mutate the tape** | 023. |
| **Old unstamped posts** | 026. |

---

## 3. Requirements (extraction)

From PM-012 + [`USABLE-CHAT.md`](./USABLE-CHAT.md) + founder lock. Not a second invention.

1. Reply dests the person who wrote the bubble. Reply-to-reply dests that person.
2. Visible Cursor-turn pictures hang on that Log post and paint as pictures.
3. Ticket Reply stays on that ticket. Quote names who.
4. The app he opens is psi. Engineer computer-uses the Log until the test sheet matches.

Plate staples (not scenery):

- **Who** on the quote (author label). Shared with dest. Not a clip of body copy alone.
- **Picture under that post** (same `turn_artifact` the Artifacts door already reads).
- Ticket **Messages** is the thread he answers in.

Do not build from scenery: Hear/Skip button pair, a second chat store, a new image table.

---

## 4. Stood-up truth (quote, do not remint)

### Dest ignores the pointer

`referenceTurnId` is accepted and written. Dest is chips / name / sticky only:

```51:55:src/app/api/session/[id]/send/route.ts
  const decided = resolveTypedSend({
    chipSeatKeys: uniqueSeatKeys(body.chipSeatKeys ?? []),
    chipSeatKey: body.chipSeatKey ?? null,
    text: body.text ?? "",
  });
```

```74:82:src/app/api/session/[id]/send/route.ts
  if (decided.kind === "switch" || decided.kind === "send") {
    const keys =
      decided.kind === "switch" ? [decided.seatKey] : decided.seatKeys;
    for (const key of keys) {
      const dest = await resolveDestBinding(sessionId, key);
      if (dest) destBindings.push(dest);
    }
  }
```

```142:144:src/app/api/session/[id]/send/route.ts
  const bindings = destBindings.length ? destBindings : [active];
```

`resolveDestBinding` never reads a turn:

```8:33:src/server/dest-resolve.ts
export async function resolveDestBinding(
  sessionId: string,
  destKey: string,
): Promise<AgentBinding | null> {
  // catalog pm → resolveRoleDest; else bindingBySeatKey / openBindingForSeat
}
```

`insertUserTurn` copies `initiative_id` from the referenced turn. It does not dest:

```232:239:src/server/seat-pipe.ts
  if (referenceTurnId && !inherited) {
    const [answered] = await db
      .select({ initiativeId: voiceTurn.initiativeId })
      .from(voiceTurn)
      .where(eq(voiceTurn.id, referenceTurnId))
```

User-turn `seat_key` is the **dest they sent to**, not the founder:

```521:528:src/server/seat-pipe.ts
  const userTurn =
    params.userTurn ??
    (await insertUserTurn(
      sessionId,
      prompt,
      seatKey,  // dest binding's seat_key
```

`kind=user` vs `kind=agent_post` is the author split. Do not dest from a user row’s `seat_key`.

### Quote does not name who

```3005:3018:src/components/Room.tsx
                        {refTurn && (
                          <p ...>
                            {refTurn.text.slice(0, 120)}
```

No author label. `LogComposer` has no pending-reply rail.

### Ticket Reply leaves the ticket

```3328:3336:src/components/Room.tsx
          onReply={(turnId) => {
            setPendingReferenceTurnId(turnId);
            pendingRefTurnRef.current = turnId;
            setTicket(null);
            setDoor(null);
            if (viewMode === "log" && logSubmode !== "type") {
              void setLogInput("type");
            }
          }}
```

`BacklogTicket` has Reply on founding / dest lines / posts. No Type compose.

### Harvest misses visible pictures

```61:70:src/server/artifacts.ts
export async function harvestTurnArtifacts(...) {
    if (!post || post.kind !== "agent_post") return;
    if (!params.startedAt) return;
```

```73:81:src/server/artifacts.ts
    const hung = await db
      .select({ path: turnArtifact.path })
      .from(turnArtifact)
      .where(
        and(
          eq(turnArtifact.sessionId, post.sessionId),
          eq(turnArtifact.bindingId, params.binding.id),
        ),
      );
```

Session+binding `alreadyHung` + `shouldHangArtifact` `updatedAt >= startedAt` skips a printed existing plate. `listCursorArtifacts` is `GET /v1/agents/{id}/artifacts` only (`cursor-port.ts` L63–96). `AgentPostBody` / `parseAgentPost` have no image block. `TurnAttachments` already paints hung `image` via `/api/artifacts/:id`. Proxy always `downloadCursorArtifact` (`src/app/api/artifacts/[id]/route.ts`).

Kinds stand:

```157:172:src/server/db/schema.ts
export const turnArtifact = travis.table("turn_artifact", {
  ...
  kind: text("kind").notNull(),
  path: text("path").notNull(),
```

`CHECK (kind IN ('image', 'file'))`. Unique `(turn_id, path)`. `seen_at` stands (026).

---

## 5. Stores / fields / contracts

### Add — no new table. No new column.

None.

### Change — runtime (existing columns / contracts)

| What | Law |
|------|-----|
| **`destFromReferencedTurn(sessionId, referenceTurnId)`** | Load `voice_turn` in this session. **This row only** — do not follow `reference_turn_id`. If `kind !== 'agent_post'` or `seat_key` empty → `null`. If `isTravisSeat(seat_key)` → that open Travis member. Else `resolveDestBinding(sessionId, seat_key)` (catalog `pm` still becomes Technical PM). Missing / left member → same as today’s failed dest (do not invent a cousin bind). |
| **Type `/send`** | After `resolveTypedSend`: if `referenceTurnId` and `destFromReferencedTurn` is non-null, dest **that** binding. Empty chips / empty name / sticky do **not** replace it. Explicit chips or call-by-name **add** dests (fan-out); author stays in the set. `setActiveBinding` to the author (last sticky may still be a chip if he tagged extras — author is first dest, sticky = last in the send set is fine as long as author ran). If dest-from-reference is `null`, today’s dest stands. |
| **live / finalize** | Same function when `referenceTurnId` is set. Voice is not this smoke. |
| **Quote names who** | Rail (Log + ticket) prefixes the referenced turn’s author label: member `label`, else `SIT_ROLE_LABEL` / `seatKeyToLabel` / Technical PM glass. Then the clipped text. Pending Type rail: `Reply to {label}` (or hold). Same staple. |
| **Ticket stay** | `onReply` sets pending ref. **Does not** `setTicket(null)` / `setDoor(null)`. Ticket stays. Type compose for that reply lives **on the ticket** (same `POST /send` + `referenceTurnId`). After send: ticket remains; pending clears; new line is on that ticket (`initiative_id` inherit already). `onBack` still closes the ticket. |
| **Harvest visibility** | One hang on this `post.id`. Union of: (1) existing API window when `startedAt` is set — 026 retry stands; (2) markdown `![alt](src)` srcs in `post.text`; (3) image paths in this episode’s `stream_event` `kind=process` bodies (`close_turn_id = post.id`, or the live stream for this binding if not yet closed). `kind` from `artifactKindFromPath`. Missing `startedAt` still hangs (2)+(3). |
| **`alreadyHung`** | Paths already on **this** `turn_id` only. Same path on an older post may hang again. Unique `(turn_id, path)` + `onConflictDoNothing` stands. |
| **`http(s)` image path** | Allowed in `turn_artifact.path` (column is text). Proxy: if `path` matches `^https?:\/\/`, **302** to that URL (or stream it). Do **not** call `downloadCursorArtifact`. Do not store Cursor’s 15-minute signed URL as a new field. Dead ref → muted line (026). |
| **Face paint** | `TurnAttachments` under that post (already). `parseAgentPost` **omits** `![...](src)` from text runs so the raw markdown / path is not the picture. Do not remint `AgentPostBody` as a second store. |
| **Stay / New / Hear buttons** | 027 stands. Refresh still `travis-stay`. Buttons stay off. |

Grain helpers (no table): `destFromReferencedTurn` · markdown-src extract · image-path extract from a process body (any `IMAGE_SUFFIX` path in the string — do not mint a closed tool-name list).

### Refuse

- New table. New `voice_turn` / `turn_artifact` column. New kind. Remint 062 unique / check.
- Session+binding hang-once. Walking the reply chain. Dest-from-user-`seat_key`.
- Hear/Skip buttons. Cousin PR. Caps. Canvas.

---

## 6. Runtime

### Who writes

| Writer | When | What |
|--------|------|------|
| Face Reply (Log or ticket) | Tap Reply | `pendingReferenceTurnId`. Ticket stays if ticket. |
| `POST /send` (Type) | Send with pending ref | `voice_turn.reference_turn_id`. Dest set from author (plus optional chips). Sticky update. |
| `insertUserTurn` | That send | `initiative_id` inherit (027). Unchanged. |
| Dest / Travis pipe | After dest resolve | Existing `sendOrEnqueueMany` / `pipeTravisText`. |
| `harvestTurnArtifacts` | After dest absorb / reap | `turn_artifact` rows on **this** post from API ∪ markdown ∪ process paths. |
| Artifact proxy | GET hung image | Cursor download **or** 302/stream for `http(s)` path. |
| Face stay | Reload | 027 `travis-stay`. Unchanged. |

### Who reads

| Reader | What |
|--------|------|
| `/send` / live / finalize | `destFromReferencedTurn` then existing dest ports. |
| Log + ticket quote | Referenced turn `seat_key` → label. |
| `TurnAttachments` / Artifacts door / ticket files | Same `turn_artifact` on `turn_id`. |
| Ticket Messages | Stamped dest line + posts (026). New reply line must appear here without leaving. |

### Triggers

- Faceless: dest post persist → harvest. Stream process events already written (024) → harvest reads them.
- Control: Reply, Type send, ticket Back.

---

## 7. Ports

| Port | Real vs stand-in |
|------|------------------|
| Cursor `GET /v1/agents/{id}/artifacts` + download | **Real.** Keep. Not the only visibility source. |
| Cursor run stream `process` events | **Real** (024). Read for image paths. |
| `resolveDestBinding` / `resolveRoleDest("pm")` | **Real.** Author key goes through here. |
| Artifact GET | **Real.** Add `http(s)` path branch. |
| STT / TTS / Voice finalize | Stand; Voice parked. Same dest function if the field is set. |
| Computer use | Engineer **verify** method on psi. Not a store. Not a Travis tool this packet. |

---

## 8. Verify

Smoke is [`PM-PACKET-012-USABLE-CHAT-TEST.md`](./PM-PACKET-012-USABLE-CHAT-TEST.md) on **psi**, room Travis, Log · Type, phone or 430×932. **Pass from `src/` only is a miss.**

In order:

1. **A** — Land in Travis Log Type (not rooms list).
2. **B** — Reply to a left-side Engineer (or named) post, no `@`. Dest is **that person**. Reply-to-reply dests **that** author.
3. **C** — A dest that prints an existing image (attachment or markdown image): picture **under that post**, not a raw path.
4. **D** — Reload stays in this room, Log, Type.
5. **E** — Backlog → ticket → Messages → Reply → send: still on **that ticket**; dest is that post’s author; not the room Log.

Engineer computer-uses until every **I saw** matches Expect. Do not write Pass from files.

---

## 9. Out of scope

- Voice parked (conductor, orb, Hear/Skip buttons, offer TTS).
- Remint 023–027, 062/064 SQL, 014 beat closer.
- Canvas, `link` kind, founder upload, hear-queue table, SSE bus, 022.
- Cousin PR. Product caps. Travis-writes-PHASE-ONE-LOG.
- General repair of old unstamped posts or old missing hangs (new dests hang; do not backfill the room).

---

## 10. Engineer cut (no leftover analysis)

1. Add `destFromReferencedTurn`. Wire `/send` (and live / finalize). Recut dest tests: reply to Engineer post dests Engineer; reply to Engineer’s reply dests Engineer, not the first dest; reply to `kind=user` does not dest from that row’s `seat_key`; chips add, they do not drop the author.
2. Quote rails name the author. Pending Type rail names who.
3. Ticket `onReply` keeps the ticket. Type compose on the ticket. Same `/send`.
4. Recut harvest: per-turn hung set; markdown + process paths; API window still when `startedAt` set; `http(s)` proxy branch; `parseAgentPost` omits image markdown.
5. Computer-use the test sheet on psi. Do not Pass from `src/`.

Do not remint 027 doors. Do not mint a table. Do not open a cousin.
