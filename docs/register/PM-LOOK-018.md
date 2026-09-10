# PM look — 018 what exists

**Packet:** PM-PACKET-018
**Change packet:** SYSTEMS-CHANGE-PACKET-034
**PR:** https://github.com/bywale-com/travis/pull/161
**Preview:** https://travis-git-cursor-packet-018-life-5fbbe1-wale-omotayos-projects.vercel.app
**Verdict:** Pass

## Look

**Lock (PM-018 / SCP-034 / ST1–ST3 staples).** Find first, then hang. Not a Travis process engine. Same room = same Travis thread: official LangGraph `PostgresSaver` (schema `langgraph`, not `travis`) + `thread_id = voice_session.id`. Walk-back answers from that thread + `/print.md` + `search_room`. Route-plus and interrupt stay dest leave: last `kind=user` + unclipped print. An open `dest_job` for that living bind is Cursor follow-up (`Agent.resume` + `send`) — not create, not spin, not a different idle. Idle → send. Busy → Cursor `agent_busy` named; enqueue the follow-up on that same bind. New leave (no open job) stays 015 / 031 / 033. Type send stays `invokeDeepAgent` only. Dest-gate on the last ask. Cloud create. Ticket after `dest_job`. Here stays clipped. Log · Type first. No Hear it / Skip **buttons**. Do not remint dest assemble, dest-gate-on-ask, Cloud create, `dest_job`, or Type Responses. Do not hang `MemorySaver`. Do not mint `travis.thread`. Do not open Letta / Temporal. Do not use `parent_id` as a DAG.

**src/ (planted, this PR, `037d4f0`).** Engineer handoff last plant **034 what exists** on #161. Type invoke hangs official `PostgresSaver` (own `pg.Pool` max 1) and `thread_id = voice_session.id`. Open dest_job for the living bind is follow-up; no new job, no spin, no create.

```143:159:src/server/travis-deep-agent.ts
  const checkpointer = await travisCheckpointer();
  const agent = createDeepAgent({
    model: travisChatModel(),
    systemPrompt: TRAVIS_SYSTEM,
    tools: wrapTravisTools(params.sessionId),
    backend: new StateBackend(),
    checkpointer,
    middleware: [destKitMiddleware(params.sessionId)],
    subagents: [],
  });
  const result = await agent.invoke(
    {
      messages: [{ role: "user", content: input }],
      files: kitFiles(print, roster),
    },
    { configurable: { thread_id: params.sessionId } },
  );
```

```24:39:src/server/travis-checkpointer.ts
async function makeSaver(): Promise<PostgresSaver> {
  const connectionString = process.env.DATABASE_URL?.trim() ?? "";
  // ...
  const pool = new Pool({
    connectionString,
    max: CHECKPOINTER_POOL_MAX,
  });
  const saver = new PostgresSaver(pool, undefined, {
    schema: CHECKPOINTER_SCHEMA,
  });
  await saver.setup();
  return saver;
}
```

`CHECKPOINTER_SCHEMA` is `langgraph`. `CHECKPOINTER_POOL_MAX` is 1. No drizzle pool share. `package.json` has `@langchain/langgraph-checkpoint-postgres`. `next.config.ts` lists that package and `pg` on `serverExternalPackages`.

Walk-back is a `TRAVIS_SYSTEM` exception, not Letta, not an unclip of Here:

```1179:1179:src/server/travis-tools.ts
Speak short. … Do not recap the last turns. When they ask where we are or what we discussed, answer from this thread, /print.md, and search_room. Do not recap unasked.
```

Open job is the staple. No phrase classifier.

```8:16:src/lib/dest-follow.ts
export function destPathForBind(openJobForBind: boolean): DestPath {
  return openJobForBind ? "follow-up" : "new-leave";
}

/** Follow-up busy → enqueue on that same bind. New role leave still never queues. */
export function destEnqueueIfBusy(path: DestPath): boolean | undefined {
  if (path === "follow-up") return true;
  return undefined;
}
```

```503:582:src/server/travis-tools.ts
    if (living && destPathForBind(open) === "follow-up") {
      // addMember if missing
      binding = living;
      followUp = true;
    } else {
      binding = await resolveRoleDest({ sessionId, role: seat });
      enqueueIfBusy = false;
    }
  // ...
  if (followUp) {
    const outcome = await dispatchToSeat({
      sessionId,
      binding,
      prompt: text,
      enqueueIfBusy: destEnqueueIfBusy("follow-up"),
    });
    // receipt — no insertDestJob
```

Follow-up busy receipt names `agent_busy`, not spin:

```58:73:src/lib/tool-receipt.ts
    if (o.followUp) {
      return o.waitingAhead > 0
        ? `Queued follow-up for ${o.seatLabel} (agent_busy) behind ${o.waitingAhead} already waiting.`
        : `Queued follow-up for ${o.seatLabel} — Cursor agent_busy. Same person.`;
    }
  // ...
    if (o.followUp) {
      return `${o.seatLabel} is agent_busy. Follow-up waits on that same person.`;
    }
```

014–017 stay. Dest assemble is still last `kind=user` + print. Gate still classifies `ask`. Type send is still `invokeDeepAgent` only. `insertDestJob` still does not set `parent_id`. `Agent.create(` / `generateTravisTextViaResponses` / `MemorySaver` / `InMemorySaver` are empty on the Type / create path.

```29:40:src/server/dest-with-context.ts
  const lastUser = [...turns].reverse().find((t) => t.kind === "user");
  if (!lastUser) return null;
  const print = unclippedPrint(turns);
  return {
    ask: lastUser.text,
    print,
    assembled: assembleDestWithContext({ ask: lastUser.text, print }),
  };
```

```85:97:src/server/travis-openai.ts
    // 032: kit throw reaches pipeTravisText → travisGenerateMiss. No cousin.
    // 033: create is HTTP — SDK create no longer loads on this send.
    const { invokeDeepAgent } = await import("@/server/travis-deep-agent");
    return await invokeDeepAgent({
      sessionId: params.sessionId,
      prompt: params.prompt,
      room,
    });
```

No Hear it / Skip **buttons** in `Room.tsx` or `LogComposer.tsx`. Spoken `parseHearInvite` stays.

Grain I ran: `dest-follow.test.ts` · `dest-leave.test.ts` · `tool-receipt.test.ts` — 20 pass. Open job is follow-up; Type invoke hangs `PostgresSaver` + `thread_id`; no `MemorySaver`; no `Agent.create`; no Responses cousin; follow-up busy names `agent_busy`. `travis-boundary.test.ts` did not load here (`drizzle-orm` not installed in this look env) — I quoted `TRAVIS_SYSTEM` instead.

Must-not hold: no Travis orchestrator, no `travis.thread`, no Letta / Temporal, no `MemorySaver` on Type send, no remint of dest assemble / dest-gate / Cloud create / `dest_job`, no Responses cousin, no Hear / Skip buttons, no cousin PR.

**Preview.** Opened the #161 preview, not `travis-psi`. Phone viewport (430×932). 302 → `vercel.com/sso-api?url=…travis-git-cursor-packet-018-life-5fbbe1…` → `vercel.com/login?next=…`. Title: “Login – Vercel.” Heading: “Log in to Vercel.” Email / Google / GitHub / ChatGPT / SAML SSO / Passkey. I did not sign in. I did not open production psi. I did not see Voice / Log / Type glass from this seat. Vercel status on `037d4f0` is Ready. I do not treat SSO as a plant miss. This PR is unmerged — I do not treat production psi as this plant.

## Test

Walked from [`PM-PACKET-018-WHAT-EXISTS-TEST.md`](./PM-PACKET-018-WHAT-EXISTS-TEST.md).

**URL I opened:** https://travis-git-cursor-packet-018-life-5fbbe1-wale-omotayos-projects.vercel.app
**Device:** phone-first (430×932).
**Log | Type:** never reached the room.

### A. Walk back in — A.1 Where are we
**I saw:** SSO wall. Did not type `Where are we? What was the last thing we discussed?` Plant: `invokeDeepAgent` hangs official `PostgresSaver` + `thread_id = sessionId`. `TRAVIS_SYSTEM` may answer from the thread + `/print.md` + `search_room` when they ask where we are. Here stays clipped. Not Letta.

### B. Route-plus — B.1 Idea, then send with an add-on
**I saw:** did not type the dest sentence. Plant: dest assemble is still last `kind=user` + print. Gate classifies `ask`. New leave (no open job) still `insertDestJob` then ticket then `dispatchToSeat`. Follow-up is only when `listOpenDestJobs` already has that living bind.

### C. Interrupt to another seat — C.1 By the way, this other seat
**I saw:** did not type the second dest. Plant: a second role with no open job for that living bind is a new leave (015 / 033). Same `destWithContextFor`. Not create. Graph does not replace the second `dest_job`.

### D. Modify while in motion — D.1 Change all of those
**I saw:** did not type the modification. Plant: open `dest_job` for that living bind → `destPathForBind` follow-up → same bind, `enqueueIfBusy` true, no new job, no spin. Receipt names `agent_busy`. Idle send. Not a cold wrap. Not a folder error.

### After — Voice
**I saw:** no Hear it / Skip **buttons** in `Room.tsx` or `LogComposer.tsx`. Spoken invites stay.

**Steps I could not do (human):** Vercel team SSO. Travis email link (founder’s inbox). Type the walk-back sentence. Confirm he names the last real discussion, not only “you said hey,” and not `Travis error: Cannot use import statement outside a module`. Type an idea, then the Technical PM dest with an add-on. Confirm a dest leaves and body is ask + print. Type the Engineer interrupt. Confirm a second dest of the same kind. Type the modification while dests are live. Confirm follow-up on the same Cursor people, or a named `agent_busy`. Two seats seated. A dest still running when D fires. Talk on a phone. Paying Cursor. Those are the human’s. I do not fail the look for them.

## Loop

Pass. Emerged. Human may walk the same sheet on this preview (SSO + email, then A–D). Same PR. No cousin. No `fail-look`. Walk a Ready deploy of `037d4f0`, not production psi.
