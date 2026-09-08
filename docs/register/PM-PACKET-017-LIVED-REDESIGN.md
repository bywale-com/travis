# PM packet 017 — Lived redesign (After new law)

**Number:** `017` — next PM packet is `018`. Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Technical PM. **SA** ascribes as **033**.  
**When:** Named 2026-09-07.  
**Status:** Specified.  
**Wake:** sa
**Test spec:** [`PM-PACKET-017-LIVED-REDESIGN-TEST.md`](./PM-PACKET-017-LIVED-REDESIGN-TEST.md)  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **14:00 UTC 2026-08-25**.  
**Law:** [`docs/BUILD-PROTOCOL.md`](../BUILD-PROTOCOL.md) — Compose, don’t invent.  
**Tape:** room **After new law** `38f491eb-a881-4e1f-b9a6-2ac9b67a462c` · live Travis app. First try 18:52–18:54 UTC (before 016 merge). Retry 19:00–19:01 UTC (after #157 merged 18:59).  
**Builds on:** 015 / 031 dest assemble. 016 / 032 kit-only send. Do not remint dest mail. Do not remint 016.  
**Next SA:** **033**.

**Where:** this PR. SA and Engineer commit here. Do not open a cousin. Do not remint 011–016 / 027–032.

---

## Founder lock

> Look at the logs, and here is, I want you to do this. Everything that went, that went wrong in there, every system that was touched, or was supposed to be touched, that wasn't touched, or was touched improperly, I want a redesign. … rethink with our new law … look at what failed, and every single system that was touched, or not touched, that was supposed to be touched, and the ones that were touched, that were not supposed to be touched, is on the chopping block for a system redesign. … look at the most recent session in the new chats, in the new room.

> At the time I sent the 1st message, I hadn't merged the PR. True, but I've done, I've merged, I merged the PR, and I tried again. Look at the logs, okay? Everything I said in that 1st message, in that message just now, still counts, because look at the, look at the logs.

> Novel code requires a reason. Commodity infrastructure requires justification for rebuilding. … find out what already exists.

---

## Tape (quoted)

Room title **After new law**. Log · Type. Live app. #157 (016) merged **18:59:15 UTC**. Same two asks after that merge. First brief still counts.

### First try — 18:52–18:54 (lock, before 016)

| Seq | What |
|-----|------|
| 1–2 | `Hey` → Travis answers. Type send / Deep Agents **worked**. |
| 3 | Create another agent / any seat. |
| 4–6 | `create_agent` twice. Stream failed. `ENOENT: no such file or directory, mkdir '…/sdk-agent-store/…'`. No person created. |
| 7 | Dest to PM: sending this from the Travis app, from Travis PSI. |
| 8–13 | `dest_with_context` **did** assemble the print. Then: `That is mine — create, sit, prove, unfold, box, or house. I will not send it.` Three times. |
| 14 | Speakable: routing tool rejected the handoff. |
| dest_job | **0**. Cursor dest never left. |
| Stream | Five episodes, all **failed**. |
| list_seats | Technical PM seated `/protocols/pm.md`, idle. Roster was right. |
| initiative | Minted **`no worries I want you to pickle PM that`** — dest sentence, dest never left. |
| membership | Technical PM in this new room is `bc-25c5c6bf-…` (prior bind, done). Living bind is `bc-b64bcdbb-…`. |

### Retry — 19:00–19:01 (after 016 on the live app)

| Seq | What |
|-----|------|
| 15 | Same create ask. |
| 16–17 | `create_agent` twice (`Creating Engineer.` / `Creating Additional Engineer.`). |
| 18 | Same hole: `ENOENT` / agent store filesystem. No person created. |
| 19 | Dest to Technical PM: sending this from the Travis app, from Travis PSI. |
| 20 | Status: `Travis error: Cannot use import statement outside a module`. Dest **never assembled**. No `dest_with_context`. |
| dest_job | Still **0**. |
| Stream | Two more failed create episodes. One completed create reply (`list_seats` + ENOENT). **No dest stream.** |
| initiative | No new ticket from seq 19. First dest ticket still open. |
| membership | Still the dead Technical PM bind. |

016 only deleted the Responses cousin around the model. It does not touch dest-gate, dest leave, create, or who sits in a new room. That is why the first brief still holds.

---

## Chopping block

| System | What happened | Under the law |
|--------|---------------|----------------|
| **dest-gate `isHisWork`** | First try: scans the **assembled** dest body (`ask + print`). Print contained “create another agent.” Gate refused dest as Travis’s own work. Retry dest never reached the gate. Touched **improperly** when dest ran. | Do not invent another keyword list. Classify the **founder’s last ask only**, or drop this regex. Dest mail is Cursor’s. The kit already has tools for create/sit/box. Seq 19’s ask has no create-word. Gate on print is the lie. |
| **`dest_job` / `dispatchToSeat`** | Supposed to leave. **Not touched** on either try. | Same Cursor dest we already use. Do not remint the table. |
| **`create_agent` / `@cursor/sdk` `Agent.create`** | Touched both tries. Died on a local `sdk-agent-store` mkdir on Vercel. Same class as this morning’s 907. | Create is Cursor’s product. Hang the **Cloud Agents API** we already dest with, or name a **blocker** (writable store / missing API). Do not keep a serverless SDK filesystem we reverse-engineered. |
| **`ticketForHand` / initiative** | First dest: touched **before** dest succeeded. Ticket from a dest that never left. Retry dest died before a second ticket. | Stamp a ticket when `dest_job` is inserted. Not on the attempt. |
| **New-room sit / roster** | New room hung a **dead** Technical PM bind. Still hung after 016. | Sit already exists (015). Hang the living seated person. Do not mint a fourth PM. |
| **Type send / Deep Agents** | First try and retry **create** ran the kit. Retry **dest** send died at `invokeDeepAgent` (`Cannot use import statement outside a module`). Dest never assembled. Touched **improperly** on that send. | 016 already deleted the cousin. Do **not** remint 016. Do **not** bring Responses back. The 080 hang (`deepagents/node`) still throws ESM on a later send. Fix that hang or name the hole. |
| **dest assemble (015 / 031)** | First dest: touched **correctly**. Stream process body was the print. Retry dest: **not reached**. | Leave assemble. The gate must not punish the print. |
| **`list_seats`** | Touched **correctly** both tries. | Leave it. |
| **`TRAVIS_SYSTEM` create-vs-dest** | He created when they asked for a seat, then dested. Create failed; dest should still have left. | Do not add phrases. Dest of a seated Technical PM is `seat=pm`. |

---

## Face (plain)

You send a line to Technical PM after the chat mentioned creating someone. The dest **leaves**. The body is still your ask plus this chat. A word like “create” in an earlier turn does not eat the mail.

You ask to create a person. Either Cursor actually creates them (the same cloud create the screen uses), or Travis names the hole as a blocker — not `ENOENT` on a folder we invented.

A dest that never leaves does not mint a backlog ticket from that sentence.

A new room talks to the living Technical PM, not a finished bind.

A dest send does not die as `Travis error: Cannot use import statement outside a module`. Type send already uses the Deep Agents kit. That hang must run, or name the hole. Do not put the old backup loop back.

---

## Lock

1. **Dest gate does not read the print.** `classifyDestPrompt` / `isHisWork` run on the founder’s last `kind=user` ask, or they go away. They do not run on `destFork.assembled`. Do not add markers.
2. **Dest leaves.** After a dest to Technical PM, a `dest_job` row exists. Stream dest process may fail only if Cursor dest failed — not because the print said “create,” and not because Type send threw ESM.
3. **Create uses Cursor’s create, or blocker.** No `sdk-agent-store` mkdir on the phone host as the create path. Cloud Agents API already on the dest hang, or `BLOCKER-033-*.md` naming the missing port. Do not remint `dest_job`.
4. **Ticket follows a real leave.** `ticketForHand` / `ensureViaTravis` do not insert from a dest that `handToDest` refused.
5. **New room sits the living PM.** Role dest `seat=pm` resolves to the seated living person. Do not hang `bc-25c5c6bf` as the room’s Technical PM.
6. **Type send stays kit-only.** 016 / 032 stands. `generateTravisText` stays `invokeDeepAgent` only. Fix the 080 hang so a later dest send does not throw `Cannot use import statement outside a module`. Do not restore `generateTravisTextViaResponses`.
7. **Log · Type first.** No Hear it / Skip buttons.

## Technical cut (Engineer after SA)

Quoted.

Gate on assembled dest text (the miss):

```17:35:src/lib/dest-gate.ts
const HIS_WORK =
  /\b(create|sit|prove|unfold|authorize)\b/i;
export function isHisWork(text: string): boolean {
  // ...
  if (HIS_WORK.test(t)) return true;
```

```457:459:src/server/travis-tools.ts
  const promptClass = classifyDestPrompt(text);
  if (promptClass?.class === "his") {
    return { ok: false, text: hisWorkReceipt() };
```

`text` here is `destFork.assembled` (ask + print) after 031. `destWithContextFor` already has `ask` = last `kind=user`.

```29:40:src/server/dest-with-context.ts
  const lastUser = [...turns].reverse().find((t) => t.kind === "user");
  // ...
    ask: lastUser.text,
    print,
    assembled: assembleDestWithContext({ ask: lastUser.text, print }),
```

Create path (the other miss):

```229:248:src/server/create-agent.ts
      const { Agent } = await import("@cursor/sdk");
      const created = await Agent.create({
        apiKey: key,
        name: label,
```

Ticket before dest:

```705:724:src/server/travis-tools.ts
    const prior = await ticketForHand(sessionId, String(args.id ?? ""), text);
    return postHandReceipt(
      sessionId,
      await handToDest({ ..., initiativeId: prior?.id }),
    );
```

Retry dest send (016 made the throw visible; the hang still threw):

```86:96:src/server/travis-openai.ts
    const { invokeDeepAgent } = await import("@/server/travis-deep-agent");
    return await invokeDeepAgent({
      sessionId: params.sessionId,
      prompt: params.prompt,
      room,
    });
```

```58:65:src/server/travis-reply.ts
    reply = (await generateTravisText({ sessionId, prompt })).trim();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = await insertStatusTurn(
      sessionId,
      travisGenerateMiss(msg),
    );
```

**Grain.** SA ascribes: dest-gate input = last user ask; create = Cloud API or blocker; ticket = after `insertDestJob`; new-room sit = living `technical-pm`; Type send hang = 080 / Deep Agents, not a new cousin. Find existing Cursor create. Do not mint a table. Do not remint 031 assemble. Do not remint 032 kit-only.

---

## Must / must-not

- Dest after a chat that mentioned “create” still leaves a `dest_job`.
- `ENOENT` `sdk-agent-store` on create is a miss (fix or blocker).
- A refused dest must not mint `no worries I want you to pickle PM that`.
- A dest send must not end as `Travis error: Cannot use import statement outside a module`.
- Do not remint `dest_job` / dest assemble / Here clip / 016 kit-only send.
- Do not put Hear it / Skip buttons back.
- Do not invent a second keyword list.
- Do not restore the Responses cousin.

---

## SA 033

Ascribe. Quote dest-gate, `handToDest`, `createAgentBinding`, `ticketForHand`, sit on new room, `invokeDeepAgent` hang. Compose: find Cursor create; do not design a Travis agent store; do not remint 016.

1. Dest-gate: ask only, or delete HIS_WORK. Print stays in dest body.
2. Create: Cloud Agents API vs SDK store. Blocker if the port is missing.
3. Initiative: only when dest_job exists.
4. New room: living seated Technical PM.
5. Stream: dest process + a real dest job, or a failed Cursor dest — not a gate lie, not an ESM throw before dest.
6. Type send: 080 hang runs on a later dest send, or name the hole. No Responses cousin.
7. Do not remint 031 / 032 / `dest_job`.
