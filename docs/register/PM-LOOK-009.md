# PM look — 009 stream-close

**Packet:** PM-PACKET-009
**Change packet:** SYSTEMS-CHANGE-PACKET-025
**PR:** https://github.com/bywale-com/travis/pull/127
**Preview:** https://travis-git-cursor-technical-pm-seat-35b2-wale-omotayos-projects.vercel.app
**Verdict:** Pass

## Look

**Lock (PM-009 / 025 / ST3).** Stream does not open itself. Stay live until this episode’s answering speakable Travis `agent_post`. `close_turn_id` = that post — after this trigger and after this episode’s process — not session-latest. Card titled **Stream** sits **above** that completed line. Trigger on the card = this user sentence. Message events for the words he said. Dest close stays on the landed `post.id`. Do not remint 023/024 tables. Named backfill of walk row `643e3e50-…` → seq 747.

**src/ (planted, this PR).** The old “latest speakable in the session” close is gone. Close now loads this stream’s trigger seq, the last `process` floor, then picks an answering post after both:

```186:196:src/lib/stream.ts
export function isAnsweringPost(params: {
  post: TravisCloseCandidate;
  triggerSeq: number;
  processFloor: Date | string | number;
}): boolean {
  if (params.post.seq <= params.triggerSeq) return false;
  return (
    new Date(params.post.createdAt).getTime() >=
    new Date(params.processFloor).getTime()
  );
}
```

```236:244:src/lib/stream.ts
  if (params.laborOpen) return { action: "stay" };
  if (params.answeringPostId) {
    return { action: "close", closeTurnId: params.answeringPostId };
  }
  if (params.failed) return { action: "fail-without-card" };
  if (params.foundingFallback && params.foundingFallbackPostId) {
    return { action: "close", closeTurnId: params.foundingFallbackPostId };
  }
  return { action: "stay" };
```

```498:538:src/server/stream.ts
            gt(voiceTurn.seq, trigger.seq),
          ),
        )
        .orderBy(desc(voiceTurn.seq))
    : [];

  const answering = pickAnsweringPost(
    afterTrigger,
    trigger?.seq ?? -1,
    processFloor,
  );
  // ...
  if (decision.action === "stay") return;
  await closeStream({
    streamId: live.id,
    status: "completed",
    closeTurnId: decision.closeTurnId,
  });
```

Tool `finish` still calls close (no-op until that post exists) — `src/server/travis-tools.ts` ~654. Speakable persist mirrors, then closes: `insertAgentPostTurn` / `absorbLiveTravisPost` in `src/server/seat-pipe.ts` 339–342 and 430–433. `pipeTravisText` end uses `foundingFallback: true` (`src/server/travis-reply.ts` 79–82). Dest left on this run’s post: `dispatch.ts` `closeTurnId: post.id`; `seat-pipe.ts` `postTurn?.id` / `post?.id`.

Card paint is still `closeTurnId === turn.id`, rendered **above** that turn (`src/components/Room.tsx` 2629–2637). `StreamCard` is titled Stream and shows `triggerText` (`src/components/plates/StreamDoor.tsx` 117–126). `openStreamId` starts null; Stream opens from a card tap or a live seat mark — not by itself.

Named walk SQL is in `ensureStreamStore` / `migrate.ts`: `643e3e50-%` + seq 747. Tests in `src/lib/stream.test.ts` use the 008 numbers: 745 is not the hang; 747 is; labor-open and no-post stay live.

ST3 staple is the card above the completed line. Chevron / Talk-selected / bezel on the PNG are scenery — not this cut.

**Preview.** Opened the #127 preview, not `travis-psi`. Phone viewport (iPhone 14 Pro Max, 430×932). The URL redirected to Vercel login (`vercel.com/login?next=…sso-api…travis-git-cursor-technical-pm-seat-35b2…`). Heading: “Log in to Vercel.” I did not sign in. I did not open production psi. I did not see the Log glass from this seat.

## Test

Walked from [`PM-PACKET-009-STREAM-CLOSE-TEST.md`](./PM-PACKET-009-STREAM-CLOSE-TEST.md).

**URL I opened:** https://travis-git-cursor-technical-pm-seat-35b2-wale-omotayos-projects.vercel.app  
**Device:** phone-first Chrome (430×932).  
**Talk | Type:** Type (as the sheet says). Never reached the toggle.

### Setup S.1
**I saw:** Vercel SSO wall. Not Log. Not room-title pill. Not Talk | Type.

### Resume R.1–R.3
**I saw:** nothing on the Log. Could not scroll to seq 747 or tap a card.

### Packet 1.1–1.5
**I saw:** did not type `Name the open initiatives.` Did not wait for a Travis line. Did not see a Stream card. Did not tap Stream. Auto-open: not observed on glass; `src/` does not auto-open.

**Steps I could not do (human):** Vercel team SSO. Travis email link (founder’s inbox). Talk on a phone. Type/send in room Travis. Look at / tap the Stream card above the 008 answer and above a new send. Those are the human’s. I do not fail the look for them.

## Loop

Pass. Emerged. Human may walk the same sheet on this preview (SSO + email, then S.1 → R.1–R.3 → 1.1–1.5). Same PR. No cousin. No `fail-look`.
