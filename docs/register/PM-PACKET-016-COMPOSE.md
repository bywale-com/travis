# PM packet 016 — Compose the send harness (find, don’t grind)

**Number:** `016` — next PM packet is `017`. Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Technical PM. **SA** ascribes as **032**.  
**When:** Named 2026-09-07.  
**Status:** Specified.  
**Wake:** sa
**Test spec:** [`PM-PACKET-016-COMPOSE-TEST.md`](./PM-PACKET-016-COMPOSE-TEST.md)  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **14:00 UTC 2026-08-25**.  
**Law:** [`docs/BUILD-PROTOCOL.md`](../BUILD-PROTOCOL.md) — Compose, don’t invent.  
**Builds on:** 014 / 015 / 030 / 031 planted. Dest mail stays ask + print. This packet is the process around the model, not a remint of dest.  
**Next SA:** **032**.

**Where:** this PR. SA and Engineer commit here. Do not open a cousin. Do not remint 011–015 / 027–031.

---

## Founder lock

> Why the fuck are we designing and implementing infrastructure that should already be solved?

> Mostly integration code over what already exists.

> If we didn't know what we actually want to accomplish, we know what we want to accomplish very, very well. Okay, the problem has been implementation. … we do this incrementally, but if we can start from the place that it matters, which is the harness … when I send a message. What process happens? Okay, in what order giving what case around the … model … That's what I want us to find pre-existing implementations of … I WANT us to write as little novel code. When I say novel code, I mean code where we have to like reverse engineer things. Even if it's a concept and we are the ones that have to kind of engineer. Oh, this is how we would implement it. … I literally just want us to leverage what already exists. And just write the integration code, or how we just make it work for us. … the setup … setting it up for Travis … I want us to have as little ingenious. … that's the work, it's to find out what already exists. What pieces exist? If there's any gap, how can we let's find something? Let's find something. Let's just keep finding things. Let's not gride, anything that's like new … I don't care. If it's open source or closed source or vendor or provider that we need to pay. … you can also toss. In cost, as a as a thought … that's the gap. I've said the gap, and I think i've stayed it in the way that doesn't, you know minimize what it is

---

## What this packet is

We know the product. The gap is not another face. The gap is that the **send loop** — what happens when you send a line, in what order, given what case, around the model — has been ours to invent (phrase gates, cousin classifiers, a six-step fallback we wrote, dest grain we designed beside the kit).

This cut starts there. Find what already runs that loop. Hang Travis on it. Write setup and integration. Do not reverse-engineer a Travis process engine. Open source, closed source, paid — all fine. Cost is a thought, not the start.

The harness here is **not** the whole app. It is that send-to-model process.

---

## Face (plain)

You Type a line and send. What happens next around the model is an existing kit’s process, configured for Travis — not a process we designed because we did not look. Dest still leaves as your ask plus this chat (015). Here stays clipped. Phone chrome unchanged.

---

## Lock

1. **Find first.** SA inventories the planted send path as **kit vs ours**. Then names existing mature primitives that already do: every send runs a process; order; forks by case; around the model. Keep looking until the gap is small. Do not open with “here is our harness architecture.”
2. **Novel only if missing.** Engineer writes setup and integration so the chosen primitive works for Travis (keys, tools we already own, dest mail 015, Stream as it exists). Reverse-engineering a concept we could have adopted is a miss. A longer marker list is a miss.
3. **Start at send, incrementally.** Not “rebuild chat.” Not “rebuild Voice.” Type send first. Live / Voice: same cut or named silence.
4. **015 dest mail stays.** Ask + print on dest. Dest seats stay Cursor. Do not remint `dest_job`. Do not put Hear it / Skip buttons back.
5. **Paid is allowed.** Cost is considered, not the gate.
6. **Log · Type first.**

## Technical cut (Engineer implements after SA)

Quoted, not memory.

Type send is `/api/session/:id/send` → `pipeTravisText` → `generateTravisText`:

```156:184:src/server/travis-openai.ts
export async function generateTravisText(params: {
  sessionId: string;
  prompt: string;
}): Promise<string> {
  // ...
      const { invokeDeepAgent } = await import("@/server/travis-deep-agent");
      return await invokeDeepAgent({
        sessionId: params.sessionId,
        prompt: params.prompt,
        room,
      });
    } catch {
      return await generateTravisTextViaResponses({
```

Deep Agents is already hung. We still wrap every tool, write `TRAVIS_SYSTEM`, write dest middleware and dest grain, and keep a six-step Responses loop we authored as fallback:

```141:148:src/server/travis-deep-agent.ts
  const agent = createDeepAgent({
    model: travisChatModel(),
    systemPrompt: TRAVIS_SYSTEM,
    tools: wrapTravisTools(params.sessionId),
    backend: new StateBackend(),
    middleware: [destKitMiddleware(params.sessionId)],
    subagents: [],
  });
```

`pipeTravisText` is our insert-user / generate / insert-post pipe (`src/server/travis-reply.ts`). That hang may stay if it is only integration. The **process around the model** must not be a second engine we designed.

**Grain.** SA names the adopted primitive(s) and what Travis-specific hang remains (tools we already have, dest assemble, Here clip). Engineer replaces or deletes the novel process we do not need. Do not mint a table. Do not remint 015 dest body.

---

## Must / must-not

- After this cut, a Type send’s model loop is an existing primitive, set up for Travis — not a new Travis process design.
- Inventing another classifier, another six-step tool cycle, or another “how we would implement a harness” is a miss.
- Dest instruction-only when tape exists is still a miss (015).
- Do not remint `voice_turn` / `dest_job` / `travis.stream`.
- Do not remint 014 / 015 / 030 / 031 as if dest mail never locked.
- Do not put Hear it / Skip buttons back.

---

## SA 032

Ascribe. Quote planted send (`send/route.ts` · `pipeTravisText` · `generateTravisText` · `invokeDeepAgent` · Responses fallback · dest grain). Find, then hang. No new table unless you name a store that is actually missing.

1. Inventory this send path: what is already a kit, what is ours, what is reverse-engineered process.
2. What existing primitive(s) already run “every send, order, case, around the model”? Name them. Open source or paid. Cost as a thought.
3. Gap only: what the primitive cannot do that Travis must (dest to Cursor people, 015 print mail, Here clip, Travis tools). Setup/integration — not a new engine.
4. What we delete or stop calling (Responses cousin, custom process we no longer need).
5. Stream: same 008 desk. Process you watch is the adopted loop, not a mystery wrap. Live: same cut or named silence.
6. Do not remint dest_job. Do not remint 031 dest assemble.
