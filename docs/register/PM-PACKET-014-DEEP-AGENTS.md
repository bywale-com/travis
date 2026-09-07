# PM packet 014 — Deep Agents (Travis harness)

**Number:** `014` — next PM packet is `015`. Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Technical PM. **SA** ascribes as **030**.  
**When:** Named 2026-09-07.  
**Status:** Specified.  
**Wake:** hold
**Test spec:** [`PM-PACKET-014-DEEP-AGENTS-TEST.md`](./PM-PACKET-014-DEEP-AGENTS-TEST.md)  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **14:00 UTC 2026-08-25**.  
**Builds on:** 011 polish · dest `text` · Here / `LINE_CAP` · `dispatch_to_seat`.  
**Next SA:** **030**.

**Where:** this PR. SA and Engineer commit here. Do not open a cousin. Do not remint 011–013 / 027–029.

---

## Founder lock

> it's the harness that's the problem. We don't have a harness. … we have a harness in code, but it clearly is not working well enough … It's about the process, the process of protocol that … fires every time on every message … And then maybe depending on what the message is, you know, they're forks in the, in that process. That's, that's the whole reason I want to talk about deep agents today.

> The gap is in how it's accessing context. … how it's leveraging the tools and how it's translating our, what we mean when we give it tasks.

> let's not throw Lanxian as … the silver bullet. Is it the silver bullet? Come on.

> Just let's, let's, let's build and we'll talk, we'll talk about cost. What do we need, can we just, can we plan this build and, and, you know, get it ready?

> We all working towards deep agents right now, right? Like as a packet, right?

---

## What this packet is

Travis’s loop is the Deep Agents harness: a process that fires on **every** message, then forks. Context, tools, translating the task — those three. Not a new phone face. Not LangChain as magic.

Lived miss this morning: dest sent the **ask**, not the **context**. That dest-with-context fork is the first fork this harness must not miss.

---

## Lock

1. **Every message runs a process.** Not `TRAVIS_SYSTEM` hoping. A harness step fires, then a fork (answer / dest-with-context / tools / …). Deep Agents (LangChain) is that harness — middleware every call, graph forks, filesystem so a 2k list does not die at `LINE_CAP` 300.
2. **Dest-with-context is a fork, not a wrap.** “Send that as context” / “the printed chat” / “including the one we just discussed” → the dest `text` **is** the print plus the ask. Not “tell Technical PM to include the chat.” `dispatch_to_seat` / `send_to_seat` prompt is that body. `dest_job.payload.text` is that body. Do not remint `dest_job`.
3. **Here stays clipped.** `LINE_CAP` / `WINDOW_TURNS` / `WINDOW_CHAR_CAP` stay on Travis’s mouth (cost). Dest assembly and the harness filesystem read **unclipped** tape. Do not “fix” dest by unclipping Here.
4. **Not a silver bullet.** The kit does not write the protocol. We write the forks. Dest to Technical PM / SA / Engineer is still a Cursor run unless SA ascribes that wire. A subagent with “include the chat” and no body is the same miss.
5. **Log · Type first.** Voice parked this cut (012). Phone chrome unchanged. No Hear it / Skip buttons.

Do not plant a second Travis. Do not mint `/protocols/technical-pm.md`. Do not remint 011–013.

---

## Must / must-not

- After a Travis list, “send that as context to Technical PM” dests a prompt that **contains the list**.
- Dest instruction-only when the list is on the tape is a miss.
- Cost later. Here clip stays.
- Do not remint `voice_turn` / `dest_job` / `heard_at` / `reference_turn_id` / `travis.stream`.
- Do not put Hear it / Skip buttons back.

---

## SA 030

Ascribe, quote planted loop (`travis-openai.ts` / Live / `runTravisTool` / `dispatchToSeat`). No new table unless the harness filesystem needs a store you name.

1. Where Deep Agents sits on the planted OpenAI text loop (Log · Type). Live: same cut or named silence.
2. Dest-with-context fork: who concatenates unclipped tape into `prompt` before Cursor. Grain, not hope.
3. What stays Cursor dest vs Deep Agents subagent. Do not silently replace Technical PM dest with a subagent.
4. No new table unless you mint one. `payload.text` is the dest body today.
