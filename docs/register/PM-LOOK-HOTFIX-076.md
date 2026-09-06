# PM look — HOTFIX-076 seat stream closer

**Packet:** HOTFIX-076
**Change packet:** none (hotfix)
**PR:** https://github.com/bywale-com/travis/pull/130
**Preview:** https://travis-git-cursor-plating-and-sit-d6be48-wale-omotayos-projects.vercel.app
**Verdict:** Pass

## Look

Lock ([`HOTFIX-076-SEAT-STREAM.md`](./HOTFIX-076-SEAT-STREAM.md) + 02:12): dest **done** and reap land **one** speakable `agent_post` — last stream `message` body, or `postText` if there is no event. `closeStream.closeTurnId` is that row. Stream events stay. Same `StreamCard` as Travis. Recut `driveDestCursorEvents` and `reapFinishedLiveRuns`. Leave `dispatch.ts` stand-in. Do not remint `travis.stream`, 023 MotionCard, or 025 Travis close. No new plates.

Plant (Engineer `1ce6bcc`, handoff last plant **076 dest closer**):

```247:281:src/lib/stream.ts
/**
 * Hotfix 076 — dest done / reap lands one Log post: the finished message.
 * Last stream `message` body, or `postText` when there is no event.
 * Stream events stay. The card hangs on that one row.
 */
export function destFinishedMessage(params: {
  messageBodies: string[];
  postText?: string;
  cancelled?: boolean;
  bareError?: boolean;
}): string | null {
  for (let i = params.messageBodies.length - 1; i >= 0; i--) {
    const body = params.messageBodies[i]?.trim();
    if (body) return body;
  }
  const post = (params.postText ?? "").trim();
  if (post) return post;
  if (params.cancelled || params.bareError) return null;
  return "Run finished (no assistant text).";
}

export function decideDestStreamClose(params: {
  messageBodies: string[];
  postText?: string;
  cancelled?: boolean;
  bareError?: boolean;
}): DestCloseDecision {
  const text = destFinishedMessage(params);
  if (!text) return { action: "no-post" };
  return { action: "close", text };
}
```

The boom loop is gone. `driveDestCursorEvents` no longer does `for (const beat of beats)` over `messageBodies`. One absorb:

```697:711:src/server/seat-pipe.ts
  const landed = streamId ? await messageBodies(streamId) : [];
  const destClose = decideDestStreamClose({
    messageBodies: landed,
    postText,
    cancelled,
    bareError,
  });
  if (destClose.action === "close") {
    postTurn = await absorbStreamingAgentPost({
      sessionId,
      userTurnId: userTurn.id,
      seatKey,
      text: destClose.text,
    });
  }
```

`closeStream.closeTurnId` is that row (`postTurn?.id`). `reapFinishedLiveRuns` uses the same grain on `harvested.beats` / `harvested.assistantText`, then `closeTurnId: post?.id`. `dispatch.ts` stand-in still lands one post (`closeTurnId: post.id`). `decideTravisStreamClose` is still in `src/lib/stream.ts` and still called from `src/server/stream.ts` — 025 not reminted. Card paint is still `closeTurnId === turn.id`, **above** that turn (`Room.tsx` 2629–2637). `StreamCard` title is still **Stream**. No `travis.stream` remint.

**Preview.** Opened this PR’s preview host, not `travis-psi`. Redirected to Vercel SSO (`vercel.com/sso-api?url=…travis-git-cursor-plating-and-sit-d6be48…`). I did not sign in. I did not see the Log glass. Latest Vercel deploy for `1ce6bcc` was still building when I fetched. Do not fail a hotfix look for that.

## Test

Walked [`HOTFIX-076-SEAT-STREAM-TEST.md`](./HOTFIX-076-SEAT-STREAM-TEST.md).

**URL I opened:** https://travis-git-cursor-plating-and-sit-d6be48-wale-omotayos-projects.vercel.app  
**Device:** this bind (no phone).  
**Talk | Type:** Type. Never reached the toggle.

### G.1 Dest closer lands one post
**I saw:** `driveDestCursorEvents` and `reapFinishedLiveRuns` call `decideDestStreamClose`. No `for (const beat of beats)` in `src/`. Grain test `dest closer: N stream messages land one Log post; card hangs on that id` — pass. Three bodies → `{ action: "close", text: "Finished message." }`. `postText` fallback and cancel/`bareError` no-post match the lock. `npx tsx --test src/lib/stream.test.ts` — 10 pass, 0 fail.

### D.1 Idle Log
**I saw:** SSO wall. Not Log. Not room Travis.

### D.2 Dest a seat
**I saw:** did not dest. Did not watch a live Stream.

### D.3 Done
**I saw:** did not wait for a finish. Did not see one bubble + card on glass.

### D.4 Travis unchanged
**I saw:** `decideTravisStreamClose` still planted; not reminted. Did not send Travis a line on the desk.

**Steps I could not do (human):** Vercel team SSO. Talk on a phone. Dest Engineer or `technical-pm` in room Travis. Watch Log stay quiet while they work; watch one finished bubble and the Stream card above it; tap that card; send Travis a short line to confirm 025. Those are the human’s. I do not fail the look for them.

## Loop

Pass: emerged. Human may walk the same sheet on this preview (SSO, then D.1–D.4). Same PR. No cousin. No `fail-look`.
