# PM packet 009 — Stream close / card hang

**Number:** `009` — next PM packet is `010`. Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Technical PM. **SA** ascribes as **025**. **Engineer** plants after that ascription. PM does not plant.  
**When:** Locked 2026-09-05 — founder walked 008; Stream did not open itself (fine); the **card was missing** because it hung on the wrong line. Fix that.  
**FACE:** still [`PLATES-STREAM.md`](./PLATES-STREAM.md) ST3 — card **above** the completed message. No new plates.  
**Test spec:** [`PM-PACKET-009-STREAM-CLOSE-TEST.md`](./PM-PACKET-009-STREAM-CLOSE-TEST.md)  
**Builds on:** [`PM-PACKET-008-STREAM.md`](./PM-PACKET-008-STREAM.md) · SA **024** planted. Do not remint `travis.stream`.  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **14:00 UTC 2026-08-25**.  
**Where:** [PR #126](https://github.com/bywale-com/travis/pull/126) — same PR. Do not mint a cousin.

---

## Founder lock (do not overwrite)

Stream does **not** open itself. A fast reply can close the live door before you tap. That is fine.

The **card** must sit **above the completed message for this episode**. If the card is missing next to the answer you just got, the hang is wrong.

---

## Walk (quote)

Session `0e8875f8-283b-4dae-bf54-76c82a05b6ef`. Sentence: `What's on the desk in this room?`

| Grain | What happened |
|-------|----------------|
| User | seq 746 · `bfa67009-…` · 16:32:30 |
| Stream | `643e3e50-…` live 16:32:35 → closed 16:32:41 (**six seconds**) |
| Event | one row: `process` / `list_backlog`. No `message`. |
| Close hang | `close_turn_id` = seq **745** (10:41 — “I started listing the files…”) |
| Answer | seq **747** · 16:32:46 — **no card** |

---

## Stood-up (quote; do not remint 024 tables)

`maybeCloseTravisStream` closes when no motion is running, then hangs on the **latest** Travis speakable `agent_post` in the session — not the post **after this trigger**:

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

Called from `runTravisTool` after **each** tool (`src/server/travis-tools.ts`). First tool return closed the stream **before** seq 747 existed. Latest speakable at that moment was 745.

024 already named the law: `close_turn_id` = latest Travis `agent_post` **after the trigger**. Plant missed.

024 also: live Travis text → `stream_event` `message`. This walk had none.

---

## Five buckets

### Specified and clear — Engineer after SA 025

1. **Do not auto-open Stream.** Not this packet.
2. **Stay live** until this episode’s labor ends — the completed speakable Travis `agent_post` that answers **this** trigger. Not when the first tool returns if he is still going to speak.
3. **`close_turn_id`** = that post. Not an older Travis line. Card paints **above** that line. Trigger on the card = this user sentence.
4. **Message events** in the stream for the words he actually said (024). Process `list_backlog` (or whatever ran) stays. Completely.
5. Same for a later dest close if it has the same “latest post in the room” miss — SA says if dest already hangs on the landed post (`dispatch.ts` / `seat-pipe.ts` quote `post.id`).

### Specified but not clear — SA ascribes

1. **Backfill** row `643e3e50-…` (repoint `close_turn_id` to 747, write the missing `message`) vs forward-only. Name it.
2. **Labor end** when he speaks with no tool; when a tool fails; when a second user line lands mid-stream (023 interrupt: stream stays).
3. Dest path: already correct or same miss.

### Do not build from the plate

Bezel. Term label. Second Room. Auto-open Stream.

### Do not plant

Remint `travis.stream` / `stream_event`. Recut 023. Initiative curate. New table. Cousin PR.

### Parked

008 remainder (idle door, live compartment while you catch it) — already specified. Hear / Next / Skip. Sandbox test space.

---

## Must-not

- Do not remint 023 or 024 tables.
- Do not make Stream open itself.
- Do not hang the card on “latest Travis post in the session.”
- Do not mint tables.
- Technical PM does not plant `src/`.

---

## Paste — Systems Analyst

```
You are Travis’s Systems Analyst. Accept docs/README.md § Systems Analyst.

Packet: docs/register/PM-PACKET-009-STREAM-CLOSE.md
Test: docs/register/PM-PACKET-009-STREAM-CLOSE-TEST.md
Prior: 024 planted. Do not remint travis.stream.

Next SA packet is 025. Same PR #126.

Ascribe: close after this trigger’s completed agent_post; labor end (not first tool);
message events; backfill of 643e3e50 vs forward-only; dest path.

Do not mint a table in the SPA. Do not append PHASE-ONE-LOG. Do not plant src/.
```

---

## Paste — Engineer

```
You are Travis’s Engineer. Accept docs/README.md § Engineer. Read ENGINEER-HANDOFF.md.

Packet: docs/register/PM-PACKET-009-STREAM-CLOSE.md
SA: wait for 025. Do not invent the store. Do not remint 024 tables.

After 025: stay live until this episode’s speakable post; close_turn_id = that post;
card above it; message events; do not auto-open Stream.

Must-not: remint 023/024 tables; hang on latest session post; cousin PR.

Same PR #126. Smoke the phone face.
```
