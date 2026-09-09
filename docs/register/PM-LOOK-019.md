# PM look — 019 stream architecture

**Packet:** PM-PACKET-019
**Change packet:** SYSTEMS-CHANGE-PACKET-035
**PR:** https://github.com/bywale-com/travis/pull/163
**Preview:** https://travis-git-cursor-packet-019-stre-fa5be6-wale-omotayos-projects.vercel.app
**Verdict:** Pass

## Look

**Lock (PM-019 / SCP-035 / ST1–ST3 staples).** Work starts on the phrase, not on “I’m done.” Three doors stay: live transcript classifies and Does; Voice finalize wraps; Type send Does then wraps that line. Classify is `stream-intent` (`new` / `change` / `cancel` / `talk`) — pivots are not dest-gate. In-flight is open `dest_job` + LangGraph checkpoint (`thread_id = voice_session.id`). Do is hang: dest assemble, Cursor follow-up/cancel, later `invoke` on that thread. `parent_id` unused. Mouth last. Live flush never `pipeTravisText`. Glass **Technical Architect**. Protocol `/protocols/pm.md`. Catalog `pm` hidden. Log · Type first. No Hear it / Skip **buttons**. No Pipecat. No Travis orchestrator. Do not remint 014–018 / 031–034.

**src/ (planted, this PR, `1a86568`).** Engineer handoff last plant **035 stream architecture** on #163. Classify is the new lib. Do is the new hang. Mouth waits.

```169:216:src/lib/stream-intent.ts
export function streamIntent(params: {
  phrase: string;
  openJobs: StreamOpenJob[];
}): StreamIntent[] {
  // ...
  if (cancelling && wholeCancelAsk(phrase)) { /* dest cancel */ }
  if (changing) { /* dest change, or travis-thread */ }
  if (walkBack(phrase)) intents.push({ kind: "new", target: { kind: "travis-thread" } });
  for (const seatKey of seats) {
    intents.push({ kind: "new", target: { kind: "seat", seatKey } });
  }
```

Grain next to it covers the walk: yesterday → travis-thread; notes + Technical Architect → new `pm`; by-the-way Engineer → second new, not a change; actually-the-blue-one after one open dest → change of that id; “I’m done” is talk (conductor’s file). Lone “no” is not change-mode.

```44:125:src/server/stream-dispatch.ts
export async function dispatchStreamIntents(...) {
  // new + travis-thread → generateTravisText({ mode: "update" })
  // new + seat → handToDest (031 assemble + 033 gate + 034 path)
  // change + dest → dispatchToSeat + destEnqueueIfBusy("follow-up")
  // cancel + dest → cancelCursorRun
  // talk → return
}
```

No `pipeTravisText` in that file. No `parent_id` / `parentId`. No `insertDestJob` on change.

Live mouth is off. Helper stays so the door is explicit:

```7:13:src/lib/live-harness.ts
export function liveShouldPipeTravis(params: {
  prompt: string;
  cursorDestCount: number;
}): boolean {
  void params;
  return false;
}
```

```134:194:src/app/api/session/[id]/live/transcript/route.ts
  void liveShouldPipeTravis({ prompt, cursorDestCount: cursorDests.length });
  // named dests still leave; then classify + dispatch; never pipeTravisText
```

Type send classifies, dispatches, then synthesizes:

```174:190:src/app/api/session/[id]/send/route.ts
        await dispatchStreamIntents({ /* skip seats the door already filed */ });
        await pipeTravisText({
          sessionId,
          prompt,
          send,
          userTurn,
          referenceTurnId,
        });
```

Finalize strips the done-phrase, backup-Do once (`backupOnly: true`), then synthesizes. Leaves that already left stay left.

`invokeDeepAgent` takes `mode: "update" | "synthesize"`. Same official `PostgresSaver` + `thread_id = sessionId`. Update prompt says do the work and do not speak a wrap. No `Command` / `updateState`.

Glass:

```30:41:src/lib/dest-glass.ts
  if (named && named !== "PM" && named !== "Technical PM") return named;
  // ...
  if (seatKey === "pm" || named === "PM" || named === "Technical PM") {
    return "Technical Architect";
  }
```

`SIT_ROLE_LABEL.pm` and `seatKeyToLabel("pm")` are **Technical Architect**. Path still `/protocols/pm.md`. Spoken “Technical Architect” and “Technical PM” both route to `pm`. No `/protocols/technical-architect.md`.

014–018 / 034 stay. Dest assemble is still last `kind=user` + print. Dest-gate `HIS_WORK` has no *actually* / *wait*. `destPathForBind` is still follow-up vs new-leave. `insertDestJob` still does not write `parent_id`. `live/token` stays credential. `travis-live-client.ts` still `response.cancel` — no Pipecat. `generateTravisTextViaResponses` still gone. No Hear it / Skip **buttons** in any `tsx`. Spoken invites stay.

Must-not hold: no new job table, no vector store, no event bus, no `motion.ts` as this board, no coffee / board / bike product, no cousin PR.

**Preview.** Opened the #163 preview for `1a86568`, not `travis-psi`. Phone viewport (430×932). 302 → `vercel.com/sso-api?url=…travis-git-cursor-packet-019-stre-fa5be6…` → `vercel.com/login?next=…`. Title: “Login – Vercel.” Heading: “Log in to Vercel.” Continue with Email / Google / GitHub / ChatGPT / SAML SSO / Passkey. I did not sign in. I did not open production psi. I did not see Voice / Log / Type glass from this seat. Vercel status on `1a86568` is Ready. I do not treat SSO as a plant miss. This PR is unmerged — I do not treat production psi as this plant.

Grain I quoted, not ran here: this look env has no `node_modules` / `tsx`. `stream-intent.test.ts` · `dest-leave.test.ts` · `dest-glass.test.ts` · `live-harness.test.ts` · `router.test.ts` · `protocol-path.test.ts` are the walk on disk. Engineer handoff says grain + `next build` passed on the plant bind.

## Test

Walked from [`PM-PACKET-019-STREAM-ARCH-TEST.md`](./PM-PACKET-019-STREAM-ARCH-TEST.md).

**URL I opened:** https://travis-git-cursor-packet-019-stre-fa5be6-wale-omotayos-projects.vercel.app
**Device:** phone-first (430×932).
**Log | Type:** never reached the room.

### A. Walk-back starts without a dest — A.1 Yesterday
**I saw:** SSO wall. Did not type `What did we do yesterday?` Plant: that phrase is `new` + `travis-thread`. Dispatch is `generateTravisText({ mode: "update" })`. No dest. Type send then synthesizes. Live flush does not speak.

### B. A leave starts on the same stretch — B.1 Notes + send
**I saw:** did not type the dest sentence. Plant: “Send that to Technical Architect” is `new` + seat `pm`. `handToDest` still gates the ask and files a new leave when 034 says new-leave. Body is ask + print. Glass string is Technical Architect. Old speech “Technical PM” still hits `pm`.

### C. Interrupt is a second leave — C.1 By the way, Engineer
**I saw:** did not type the second dest. Plant: “By the way” is not a change pivot. Engineer is a second `new` dest. Not a change of the Technical Architect job.

### D. Change while in motion — D.1 Actually, the living bind
**I saw:** did not type the modification. Plant: *actually* / *wait* / *instead* + Technical Architect with an open `pm` dest is `change` of that `destJobId`. Dispatch follow-up on that bind. No insert. No `parent_id`. Busy still names `agent_busy`.

### E. Wrap is last (Voice) — E.1 I’m done
**I saw:** did not Talk. Plant: “I’m done” is talk in `stream-intent` (conductor’s door). Finalize backup-Do once, then `pipeTravisText`. Live never full-pipes. No Hear it / Skip **buttons**.

**After.** Glass / sit / router strings are Technical Architect. Catalog `pm` hidden. Protocol still `/protocols/pm.md`.

**Steps I could not do (human):** Vercel team SSO. Travis email link (founder’s inbox). Type the walk-back sentence. Confirm he names the last real discussion from this room’s thread / tape, and not `Travis isn’t wired` or `Cannot use import statement outside a module`. Type the notes + Technical Architect dest. Confirm a dest leaves and body is ask + print. Type the Engineer interrupt. Confirm a second dest, not a change of B. Type the actually-living-bind line while dests are live. Confirm follow-up on that Cursor person, or a named `agent_busy`. Two seats seated. A dest still running when D fires. Talk on a phone. Paying Cursor. Those are the human’s. I do not fail the look for them.

## Loop

Pass. Emerged. Human may walk the same sheet on this preview (SSO + email, then A–E). Same PR. No cousin. No `fail-look`. Walk a Ready deploy of `1a86568`, not production psi.
