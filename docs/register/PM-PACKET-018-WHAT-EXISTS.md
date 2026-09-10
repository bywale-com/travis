# PM packet 018 — What already exists for the life loop

**Number:** `018` — next PM packet is `019`. Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Technical PM. **SA** ascribes as **034**.  
**When:** Named 2026-09-09.  
**Status:** Specified.  
**Wake:** sa
**Test spec:** [`PM-PACKET-018-WHAT-EXISTS-TEST.md`](./PM-PACKET-018-WHAT-EXISTS-TEST.md)  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **14:00 UTC 2026-08-25**.  
**Law:** [`docs/BUILD-PROTOCOL.md`](../BUILD-PROTOCOL.md) — Compose, don’t invent.  
**Meaning:** PHASE-ONE-LOG **23:25 UTC 2026-09-08** — walk back in; route-plus; interrupt; modify in motion.  
**Builds on:** 014–017 hung. Do not remint dest mail, kit-only send, dest-gate-on-ask, Cloud create.  
**Next SA:** **034**.

**Where:** this PR. SA and Engineer commit here. Do not open a cousin. Do not remint 011–017 / 027–033.

---

## Founder lock

> Here's the real, here's how we build from this. Again, and this is, this aligns with our new law. We want to, it might, it may take creativity, and it very well may not. It very well may be that there are systems that absolutely, identically emulate this, need, this use case, and it may be that they don't quite embody it, or the systems that have a shape like this are not, well, chat systems. Whatever the case is, I'm looking for what already exists, what cases you can make for what exists, whether it, it matches identically or not. That's what I'm looking for. I'm not looking for, oh, let's get the engineer to try to create it. No, I want to know what exists. I want us to set the stage for the engineer, what the engineer is looking for. How, can this be made possible with what exists?

> That's the real architectural question. That's what Travis means for me. I don't give a shit what it means for the product.

---

## What the Engineer is looking for

Not a Travis process engine. These ports, already in the world or already hung:

1. **A durable thread for Travis’s own think** — same room, same thread, resume after a break. LangGraph checkpointer + `thread_id` is that. Deep Agents already sits on LangGraph. We invoke fresh every send with no checkpointer.
2. **Follow-up on a living Cursor person** — `Agent.resume` + `send` is already the dest hang. Cloud `POST /v0/agents/{id}/followup` and `POST /v1/agents/{id}/runs` are the same product. A later “add this” / “change that” on **that seat** is follow-up, not a new person.
3. **The print of this chat in the letter** — dest assemble (015) already exists. Route-plus is that leave plus follow-up, not a new mail format.
4. **Walk-back after twenty minutes or a day** — the room tape + dest print + `search_room` already exist. A memory product (Letta conversation search, Zep, Deep Agents `AGENTS.md` / StoreBackend) is a case only if the tape is not the object.

Do not design a Travis orchestrator that reimplements interrupt, resume, or “modify all of those.”

---

## Cases (what exists)

| What | Match | Gap |
|------|--------|-----|
| **Deep Agents** (already hung) | Harness on every model call. Filesystem (`/print.md` we already write). Memory, summarization, HITL `interrupt_on`, async subagents that can be steered. | We create the agent **per send**, `subagents: []`, no checkpointer, no `thread_id`. Kit is there; the durable thread is not hung. |
| **LangGraph** (under Deep Agents) | Identical shape for “process still in motion”: `interrupt()`, `Command(resume=)` / `Command(update=)`, `update_state`, checkpointer, same `thread_id`. Time-travel / edit-and-resume is “I thought of a modification.” Not a chat product. | Dest to a Cursor person is still Cursor’s wire. Graph does not replace `dest_job`. |
| **Cursor Cloud Agents** | Identical for a **seat**: resume the same `bc-`, send again, get conversation. Follow-up while a run is live is `409 agent_busy` — wait, cancel, or queue. We already `Agent.resume` + `send`. Create is Cloud `POST /v1/agents`. | Travis himself has no Cursor thread. “Modify all of those” across **two** seats is two follow-ups, not one Cursor object. |
| **Planted Travis** | Dest mail = ask + print. `dest_job` has `parent_id`. Queue for a named busy person. `work_in_flight`. Here card. `search_room`. | Each Type send is a new think. Here clips. `TRAVIS_SYSTEM` says do not recap. Queue is not follow-up. `parent_id` is unused as “all of those.” |
| **Letta (MemGPT)** | Closest **identical** “where are we?” after days: `conversation_search`, archival memory, core blocks. | Not dest. Not Cursor follow-up. Paid/hosted if we take the product. Case for memory, not for routing. |
| **Temporal / Inngest / Workflow** | Shape of “still in motion, then a signal.” Not a chat system. | Only if LangGraph checkpoint cannot hold the room thread. Do not open with this. |

Paid is allowed. Cost is a thought.

---

## Face (plain)

You walk back in and ask where we are. He answers from a thread that still has this room — not a new blank think with a clipped card.

You say an idea, then: send that to this seat, and add this. The letter has the idea and the add-on.

You interrupt: by the way, this other seat too. That is a second leave, with the same print, not a new story.

While those are still running, you say a modification to all of those. Each living Cursor person gets a follow-up. Travis’s own think is the same thread, updated — not a cousin process we wrote.

---

## Lock

1. **Find first.** SA inventories the cases above against planted `src/`. Quote. Name what already provides: walk-back, route-plus, interrupt-to-another-seat, modify-in-motion. Open source or paid.
2. **Engineer hangs. Engineer does not create the process.** Setup and integration only. A new Travis orchestrator is a miss.
3. **014–017 stay.** Dest body is ask + print. Type send is `invokeDeepAgent` only. Dest-gate on the last ask. Cloud create. Ticket after `dest_job`. Living seated PM.
4. **Same room = same Travis thread** if the chosen primitive is LangGraph / Deep Agents. Do not mint a new think per line unless the kit requires it.
5. **A living dest is Cursor follow-up**, not create, not a cold instruction.
6. **Log · Type first.** No Hear it / Skip buttons.

## Technical cut (Engineer after SA)

Quoted.

Fresh invoke, no thread (the miss):

```129:154:src/server/travis-deep-agent.ts
export async function invokeDeepAgent(params: {
  sessionId: string;
  prompt: string;
  room: string;
}): Promise<string> {
  // ...
  const agent = createDeepAgent({
    // ...
    backend: new StateBackend(),
    middleware: [destKitMiddleware(params.sessionId)],
    subagents: [],
  });
  const result = await agent.invoke({
    messages: [{ role: "user", content: input }],
    files: kitFiles(print, roster),
  });
```

Dest already resumes Cursor:

```466:473:src/server/cursor-port.ts
  const { Agent } = await import("@cursor/sdk");
  const agent = await Agent.resume(agentId, { apiKey: key });
  try {
    let run: Awaited<ReturnType<typeof agent.send>> | undefined;
    try {
      run = await agent.send(params.prompt);
```

Busy dest enqueues instead of follow-up:

```54:65:src/server/dispatch.ts
  if (await seatHasActiveRun(binding)) {
    if (params.enqueueIfBusy === false) {
      return { status: "busy", seatLabel };
    }
    const queue = await enqueueOnSeat({
```

`dest_job.parent_id` exists (`src/server/dest-job.ts`). Unused as “all of those.”

**Grain.** SA ascribes: which existing primitive is the room thread; which is seat follow-up; what Travis hang remains (tools, dest assemble, phone face). Engineer hangs those. Do not mint a table unless a store is actually missing. Do not remint 031 / 032 / 033.

---

## Must / must-not

- SA’s first line is what exists, not a Travis architecture.
- Engineer looks for the ports in **What the Engineer is looking for**.
- Inventing a Travis interrupt/resume/modify engine is a miss.
- Do not remint `dest_job` / dest assemble / kit-only send / dest-gate-on-ask.
- Do not put Hear it / Skip buttons back.
- Do not restore the Responses cousin.

---

## SA 034

Ascribe. Quote `invokeDeepAgent`, `streamCursorReply`, `dispatchToSeat`, dest assemble, `dest_job.parent_id`. Compose.

1. Inventory: kit vs ours vs Cursor vs a memory product.
2. Name the primitive for each situation (walk-back, route-plus, interrupt, modify). Identical or adjacent. Cost as a thought.
3. Gap only: what that primitive cannot do (phone face, dest print, seated people).
4. What we stop doing (fresh agent per send, enqueue-as-the-modify-path if follow-up exists).
5. Do not remint 031 / 032 / 033 / `dest_job`.
