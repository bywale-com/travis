# SYSTEMS-CHANGE-PACKET-025 — Stream close / card hang

**Number:** `025` — next systems packet is `026`. Never reuse a number.  
**Status:** **Signed.** Plant on this PR ([#127](https://github.com/bywale-com/travis/pull/127)).  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-05  
**PM packet:** [`PM-PACKET-009-STREAM-CLOSE.md`](./PM-PACKET-009-STREAM-CLOSE.md)  
**Test:** [`PM-PACKET-009-STREAM-CLOSE-TEST.md`](./PM-PACKET-009-STREAM-CLOSE-TEST.md)  
**FACE (look, do not mint from PNG):** [`PLATES-STREAM.md`](./PLATES-STREAM.md) **ST3** — card **above** the completed message. No new plates.  
**Prior (do not remint):** 023 tape / `dest_job` / MotionCard hang **B** · **024** `travis.stream` + `travis.stream_event`  
**Flag (read-only):** PHASE-ONE-LOG **14:00 UTC 2026-08-25**.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

---

## 1. Intent

024 already minted the episode. This cut is the close seam the plant missed. Stay live until the speakable Travis `agent_post` that answers **this** stream’s `trigger_turn_id` has landed. Hang `close_turn_id` on that post. Mirror those words as `stream_event` `message` while the row is still live. Do not remint the tables. Do not open Stream by itself.

---

## 2. Story

### Must

- Stream does **not** open itself. A fast reply may close the live door before a tap. That is fine.
- Live Travis labor stays `status=live` until this episode’s answering speakable `agent_post` exists. Not when the first tool returns if he is still going to speak.
- `close_turn_id` = that answering post. Card paints **above** it. Trigger text on the card = this stream’s user line.
- Words he actually said while the stream is live are `kind=message` on the same `stream.id`. Process rows that already occurred stay.
- Dest close already hangs on the landed post of **this** run. Leave it.

### Must-not

- Remint `travis.stream` / `travis.stream_event`. Recut 023. New table. Cousin PR.
- Hang the card on “latest Travis `agent_post` in the session.”
- Auto-open the Stream compartment.
- Retarget `trigger_turn_id` when a second user line lands (023 interrupt: stream stays).
- Mint Look / Find / Term / Write / Hand. Plant initiative curate. Invent a product cap.

### Chain

Tool / motion may open (024) → events append → **stay live through tool return** → answering speakable Travis `agent_post` lands (014) → `mirrorTravisMessage` writes `message` → close with `close_turn_id` = that post → ST3 card above it. MotionCard hang **B** stays under `founding_turn_id`. Two hangs. Do not merge.

### Silence (named — do not invent)

| Silence | Why |
|---------|-----|
| **Speak-only, no live stream** | 024 open law stands: first his-tool / `file_plan` with a user trigger. No live row → no card. Do not open on speak-only this packet. |
| **Failed, no answering post** | 024: `failLiveStreamWithoutCard` — `failed` + null `close_turn_id` = no card. Row stays queryable. |
| **Hear / Next / Skip** | PM-007. Still SA. |
| **008 remainder** | Idle door / catch-it-live compartment. Already specified. Not this miss. |
| **General backfill** | Only the named walk row. Other hung cards stay until a later seat. |
| **022 / SSE bus** | Stand. Poll. Do not remint. |

---

## 3. Requirements (extraction)

From PM-009 + founder lock + ST3. Not a second invention.

1. Do not auto-open Stream.
2. Stay live until this episode’s answering speakable Travis post.
3. `close_turn_id` = that post. Card above it. Trigger = this user sentence.
4. Message events for the words he said (024). Process stays.
5. Dest: quote already hangs on `post.id` — do not “fix” it.

Plate staple (not scenery): **Stream** card **above** the completed message for **this** episode. Trigger line on the card = the user sentence.

Do not build from the PNG: bezel, Term label, second Room, auto-open.

---

## 4. Stood-up truth (quote, do not remint)

024 tables stand (`src/server/db/schema.ts` `stream` / `streamEvent`; `ensureStreamStore` in `src/server/stream.ts`).

Travis close picks **latest session** speakable Travis post — no `trigger_turn_id`, no “after this stream’s process”:

```412:438:src/server/stream.ts
export async function maybeCloseTravisStream(params: {
  sessionId: string;
  failed?: boolean;
}): Promise<void> {
  // ...
  const [closeTurn] = await db
    .select()
    .from(voiceTurn)
    .where(
      and(
        eq(voiceTurn.sessionId, params.sessionId),
        eq(voiceTurn.kind, "agent_post"),
        eq(voiceTurn.seatKey, "travis"),
        eq(voiceTurn.speakable, true),
      ),
    )
    .orderBy(desc(voiceTurn.seq))
    .limit(1);
  await closeStream({
    streamId: live.id,
    status: params.failed ? "failed" : "completed",
    closeTurnId: closeTurn?.id ?? null,
  });
}
```

Called from `runTravisTool` after **each** tool (`src/server/travis-tools.ts` `finish` → `maybeCloseTravisStream`). Walk: `list_backlog` returned, labor looked idle, latest speakable was seq **745**, stream `643e3e50-…` closed before seq **747**.

Message mirror only runs while live:

```354:366:src/server/seat-pipe.ts
async function mirrorTravisMessage(
  sessionId: string,
  text: string,
): Promise<void> {
  const bindingId = await travisBindingId();
  if (!bindingId) return;
  const live = await liveStreamForBinding(sessionId, bindingId);
  if (!live) return;
  await writeStreamMessage({
    streamId: live.id,
    text,
    closer: "travis",
  });
}
```

Speakable Travis posts already call it (`insertAgentPostTurn`, `absorbLiveTravisPost`). Walk had no `message` because close beat the post.

Card paint is already `closeTurnId === turn.id`:

```2629:2631:src/components/Room.tsx
                    {streamCards
                      .filter((card) => card.closeTurnId === turn.id)
                      .map((card) => (
```

Dest already hangs on **this** landed post — not session-latest:

```160:164:src/server/dispatch.ts
        await closeStream({
          streamId: opened.id,
          status: "completed",
          closeTurnId: post.id,
        });
```

```743:748:src/server/seat-pipe.ts
    await closeStream({
      streamId,
      status: failed ? "failed" : "completed",
      closeTurnId: postTurn?.id ?? null,
    });
```

```866:870:src/server/seat-pipe.ts
      await closeStream({
        streamId: liveStream.id,
        status: "completed",
        closeTurnId: post?.id ?? null,
      });
```

`list_backlog` is a motion-step allowlist tool and is **not** `IN_TURN_AUTO_FILE` (`src/lib/motion.ts`). In-turn it runs, writes `process`, then `maybeCloseTravisStream`. That is the walk.

---

## 5. Stores / fields / contracts

### Add

None. Do not mint.

### Change — runtime only (024 columns already exist)

| What | Law |
|------|-----|
| **Answering post** | Latest `voice_turn` where `kind=agent_post` · `seat_key=travis` · `speakable=true` · `session_id` = this stream · `seq` **>** trigger’s `seq` · `created_at` **≥** last `stream_event` of this stream with `kind=process`, or `stream.created_at` if none. That is the post **after this trigger and after this episode’s process**. Not session-latest. Not a founding line that landed **before** the process events. |
| **Stay live** | `maybeCloseTravisStream`: if `travisLaborStillOpen`, return. If no answering post, **return** — do not close, do not hang on an older line. |
| **Close** | When labor is not open **and** answering post exists: `status=completed`, `close_turn_id` = that post’s `id`. If `params.failed` and there is still no answering post, use `failLiveStreamWithoutCard` (already planted). If he speaks after a failed process, that speech **is** the answering post — `completed`, hang on it. |
| **Who calls close** | Keep the tool `finish` call (now a no-op until the post exists). **Also** call `maybeCloseTravisStream` after speakable Travis persist (`insertAgentPostTurn` / `absorbLiveTravisPost`, after `mirrorTravisMessage`). **Also** once at the end of `pipeTravisText` (after the post + `runMotionRunner`): if still live, labor idle, answering post still null, hang on the latest speakable Travis `agent_post` with `seq` > trigger `seq` (founding-only episode — he never spoke after tools). If that fallback is also null, stay live or `failLiveStreamWithoutCard` only on the existing error path (no post, `insertStatusTurn`). |
| **Interrupt** | New `kind=user` does **not** close, pause, delete, or retarget. 023/024 stand. New trigger after **close**. |
| **Message** | No new writer. Staying live until the answering post means `mirrorTravisMessage` sees the live row. Do not insert `message` after close as the default path. |
| **Dest** | **Refuse change.** `closeTurnId: post.id` / `postTurn?.id` / `post?.id` is the landed post of that run. |

### Refuse

- New table. New `voice_turn.kind`. New stream column. Remint 023 / 024 SQL.
- Opening a stream on speak-only.
- Auto-open compartment.
- Rewriting dest close to “latest in the room.”
- Caps on how long to stay live.

### Backfill — **SIGN** one named row; refuse general repair

Walk session `0e8875f8-283b-4dae-bf54-76c82a05b6ef`. Stream `643e3e50-…`. Hung on seq **745**. Answer is seq **747**. Test R.2 expects the card **if** this is signed.

```sql
UPDATE travis.stream AS s
SET
  close_turn_id = t.id,
  status = 'completed',
  closed_at = COALESCE(s.closed_at, now())
FROM travis.voice_turn AS t
WHERE t.session_id = '0e8875f8-283b-4dae-bf54-76c82a05b6ef'
  AND t.seq = 747
  AND t.kind = 'agent_post'
  AND t.seat_key = 'travis'
  AND s.session_id = t.session_id
  AND s.id::text LIKE '643e3e50-%';

INSERT INTO travis.stream_event (stream_id, seq, kind, body, tool)
SELECT
  s.id,
  COALESCE(
    (SELECT MAX(e.seq) FROM travis.stream_event AS e WHERE e.stream_id = s.id),
    0
  ) + 1,
  'message',
  t.text,
  ''
FROM travis.stream AS s
JOIN travis.voice_turn AS t
  ON t.session_id = s.session_id
 AND t.seq = 747
 AND t.kind = 'agent_post'
 AND t.seat_key = 'travis'
WHERE s.id::text LIKE '643e3e50-%'
  AND NOT EXISTS (
    SELECT 1
    FROM travis.stream_event AS e
    WHERE e.stream_id = s.id
      AND e.kind = 'message'
  );
```

One-shot. If those rows are gone, no-op. Do not scan every stream. Do not rewrite the `list_backlog` process row.

---

## 6. Runtime

### Who writes

| Writer | When | What |
|--------|------|------|
| `runTravisTool` `finish` | after each tool | Process body (024). Then `maybeCloseTravisStream` — **no-op** unless answering post already exists and labor is idle. |
| `insertAgentPostTurn` / `absorbLiveTravisPost` | speakable Travis | `mirrorTravisMessage` (024). Then `maybeCloseTravisStream`. |
| `pipeTravisText` end | after post + runner | Close check + founding-only fallback above. |
| Dest pipe / dispatch / reap | `done` / stand-in / harvest | **Unchanged.** `close_turn_id` = that run’s landed `post.id`. |
| One-shot SQL | plant | Named walk row only. |

### Who reads

Unchanged from 024. Card = `status IN ('completed','failed')` AND `close_turn_id` set. Paint above that turn. Glow = live row.

### Triggers (faceless)

- Tool return → close check (usually stay live).
- Answering speakable post → close.
- `pipeTravisText` end, labor idle, no answering-after-process → fallback hang on latest after-trigger speakable post.
- Dest `done` → dest close (already).
- Second user line → **not** a close.

---

## 7. Ports

| Port | This packet |
|------|-------------|
| Cursor cloud SSE | Unchanged from 024. Dest close already correct. |
| Box / Gemini Live | Unchanged. Live text still mirrors only while `live`. |
| Phone poll | Unchanged. 1–3s. No new bus. |

No new port. No stand-in.

---

## 8. Verify

Walk [`PM-PACKET-009-STREAM-CLOSE-TEST.md`](./PM-PACKET-009-STREAM-CLOSE-TEST.md) on PR **#127** preview.

- **R.2 / R.3** — after the one-shot SQL, card titled **Stream** sits **above** the 008 answer (seq 747), trigger `What's on the desk in this room?` Tap: `list_backlog` process + his words. Not above the 10:41 “listing the files” line.
- **1.1–1.5** — type exactly `Name the open initiatives.` Send. Do not require catching Stream live. When he is done: Stream card **immediately above that new message**, line = that sentence. Tap = this episode (process + words). Not the 008 sentence. Stream did **not** open itself.
- Fast tool must not close on an older Travis line. `close_turn_id` is never a post with `seq` ≤ trigger `seq`.
- Dest path: unchanged smoke — card still above **that** dest `agent_post`.
- 023 MotionCard still under founding. Two hangs.
- No new table. No cousin PR.

---

## 9. Out of scope

- Remint 023 / 024 tables. 022. SSE bus.
- Auto-open Stream. Speak-only open.
- Hear / Next / Skip. Initiative curate. Primitive table.
- General stream repair beyond `643e3e50-…`.
- Planting `src/` from this seat.

---

## 10. Engineer (paste)

On **this PR** ([#127](https://github.com/bywale-com/travis/pull/127)), in this order:

1. Rewrite `maybeCloseTravisStream` to the answering-post law above. Never session-latest. Never close with a pre-trigger `close_turn_id`.
2. Call it after speakable Travis persist and at `pipeTravisText` end (fallback only there).
3. Keep dest close on `post.id`. Do not touch those three sites except to leave them.
4. Run the one-shot SQL for `643e3e50-…` / seq 747. Once.
5. Smoke the test sheet. Phone-first Log.

Do not remint 023 or 024 tables. Do not auto-open Stream. Do not mint a cousin.

Do not send **That’s fine.**
