# PM look — 017 lived redesign

**Packet:** PM-PACKET-017
**Change packet:** SYSTEMS-CHANGE-PACKET-033
**PR:** https://github.com/bywale-com/travis/pull/159
**Preview:** https://travis-git-cursor-packet-017-live-e9ccd9-wale-omotayos-projects.vercel.app
**Verdict:** Pass

## Look

**Lock (PM-017 / SCP-033 / ST1–ST3 staples).** Dest-gate classifies the founder’s last `kind=user` ask — not `destFork.assembled`. Dest after a chat that mentioned “create” still leaves a `dest_job`. Create is Cursor Cloud `POST /v1/agents` on the same host + Basic dest artifacts already use — not `@cursor/sdk` `Agent.create`, not a local `sdk-agent-store`. Ticket follows a real leave (`insertDestJob` then `ticketForHand`). Role dest `seat=pm` hangs the living seated person of `/protocols/pm.md` (newest active seated bind with a `bc-` id, not catalog `pm`, not `bc-25c5c6bf-…`). Type send stays `invokeDeepAgent` only (016 / 032). Dest body stays ask + print (015 / 031). Stream chrome is 008 (ST1–ST3). Dest leave `tool=dest_with_context` `body` = the print. Log · Type first. No Hear it / Skip **buttons**. Do not remint `dest_job` / dest assemble / Here clip / 016 kit-only. Do not restore Responses. Do not invent a second keyword list. Do not hard-code a living `bc-` in `src/`.

**src/ (planted, this PR, `6c18b33`).** Engineer handoff last plant **033 lived redesign** on #159. Gate helper prefers the ask. Classify never reads assembled when an ask exists.

```49:56:src/lib/dest-gate.ts
/** SCP-033 — gate the last ask. Never the assembled dest print. */
export function destClassifyText(
  ask: string | undefined,
  assembled: string,
): string {
  const a = (ask ?? "").trim();
  return a || assembled.trim();
}
```

```697:721:src/server/travis-tools.ts
    const assembled = destFork
      ? destFork.assembled
      : String(args.text ?? "").trim();
    const ask = destClassifyText(destFork?.ask, assembled);
    const text = destFork ? destFork.assembled : ask;
    // ...
      await handToDest({
        sessionId,
        seat,
        who,
        text,
        ask,
        ticketHint: String(args.id ?? ""),
      }),
```

`handToDest` classifies `ask`. Job + dispatch still get assembled `text`. Refuse returns before the job.

```461:527:src/server/travis-tools.ts
  const promptClass = classifyDestPrompt(ask);
  if (destLeaveRefused(promptClass)) {
    if (promptClass?.class === "his") {
      return { ok: false, text: hisWorkReceipt() };
    }
    // ...
  }
  // resolve living / who ...
  const job = await insertDestJob({
    sessionId,
    binding,
    text,
    status: "created",
  });
```

Ticket is after the job row. Then `fileDestJobInitiative`. Then `dispatchToSeat`.

```529:551:src/server/travis-tools.ts
  let ticket;
  try {
    ticket = await ticketForHand(sessionId, ticketHint, text);
  } catch (err) {
    // ...
  }
  if (ticket) {
    await fileDestJobInitiative({
      sessionId,
      initiativeId: ticket.id,
    });
  }

  const outcome = await dispatchToSeat({
    sessionId,
    binding,
    prompt: text,
```

Create is Cloud HTTP. `Agent.create` is gone from `createAgentBinding`. No row without a `bc-` id.

```227:233:src/server/create-agent.ts
  const cursorAgentId = await createCursorAgent({
    name: label,
    prompt: `You are ${label}. You sit in a Travis room.`,
    modelId: opts.model,
    repository: opts.repository,
    ref: opts.ref,
  });
```

```111:127:src/server/cursor-port.ts
  const res = await fetch(`${CURSOR_API}/v1/agents`, {
    method: "POST",
    headers: {
      Authorization: cursorBasicAuth(key),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  // ...
  const id = cursorAgentIdFromCreate(data);
  if (!id) {
    throw new Error("Cursor create returned no bc- id.");
  }
```

New room hangs Travis + one `livingSeated` per `/protocols/pm.md` · `/protocols/sa.md` · `/protocols/engineer.md`. Role dest: idle living in this room, else add the global living bind, else spin.

```10:27:src/server/living-seated.ts
export async function livingSeated(
  protocolPath: string,
): Promise<AgentBinding | null> {
  // newest created_at among active + that path + bc- id, skip catalog pm
}
```

```209:214:src/server/room-membership.ts
  const seated: AgentBinding[] = [];
  for (const path of SIT_PROTOCOL_FILES) {
    const living = await livingSeated(path);
    if (living && !seated.some((b) => b.id === living.id)) seated.push(living);
  }
```

```216:244:src/server/sit.ts
  const living = await livingSeated(parsed.path);
  const idle = await findIdleSeated(params.sessionId, parsed.path);
  const pick = roleDestPick({
    idleInRoomId: idle?.id ?? null,
    livingId: living?.id ?? null,
  });
  if (pick === "idle" && idle) return idle;
  if (pick === "living" && living) {
    // addMember if missing; sit only if protocol_path empty
    return living;
  }
  return spinSeatedRole({ sessionId: params.sessionId, role: parsed.role });
```

Type send stays kit-only. No Responses cousin.

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

Dest assemble 031 stands. Stream dest process body is the print.

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

```649:653:src/server/travis-tools.ts
        tool: destLeave ? "dest_with_context" : name,
        body: destLeave ? (destFork?.print ?? "") : argsBody(args),
```

`src/` search for `generateTravisTextViaResponses` / `Agent.create(` / `sdk-agent-store` is empty on the create path. `bc-25c5c6bf` / `bc-b64bcdbb` are not planted as constants in `src/` (074 SQL file stands as history; not reminted on this PR). No Hear it / Skip **buttons** in `Room.tsx` or `LogComposer.tsx`. Spoken `parseHearInvite` stays.

Grain I ran: `dest-gate.test.ts` · `dest-leave.test.ts` · `dest-glass.test.ts` — 17 pass. Classify of dest ask `Send this to Technical PM: I am sending this from the Travis app.` is not `his` when the assembled print contains “create another agent.” `classifyDestPrompt("create a new PM")` is still `{ class: "his" }`. `roleDestPick` spins only when nobody living. `create-agent.ts` has no `Agent.create`. Type send has no Responses cousin.

Must-not hold: no dest-gate on assembled, no SDK create, no ticket-before-leave, no catalog dump on new room, no Responses cousin, no Hear / Skip buttons, no cousin PR, no remint of 031 / 032 / `dest_job`.

**Preview.** Opened the #159 preview, not `travis-psi`. Phone viewport (430×932). 302 → `vercel.com/sso-api?url=…travis-git-cursor-packet-017-live-e9ccd9…` → `vercel.com/login?next=…`. Title: “Login – Vercel.” Heading: “Log in to Vercel.” Email / Google / GitHub / ChatGPT / SAML SSO / Passkey. I did not sign in. I did not open production psi. I did not see Voice / Log / Type glass from this seat. Vercel status on `6c18b33` is Ready. I do not treat SSO as a plant miss. This PR is unmerged — I do not treat production psi as this plant.

## Test

Walked from [`PM-PACKET-017-LIVED-REDESIGN-TEST.md`](./PM-PACKET-017-LIVED-REDESIGN-TEST.md).

**URL I opened:** https://travis-git-cursor-packet-017-live-e9ccd9-wale-omotayos-projects.vercel.app
**Device:** phone-first (430×932).
**Log | Type:** never reached the room.

### A. Create does not die on our folder — A.1 Ask to create
**I saw:** SSO wall. Did not type `Create another agent. Any seat.` Plant: create is `POST https://api.cursor.com/v1/agents` via cursor-port Basic auth. `Agent.create` is gone. Missing key or missing `bc-` id throws; no binding row. Not `ENOENT` / `sdk-agent-store` / `mkdir`.

### B. Dest still leaves after “create” was on the tape — B.1 Send to Technical PM
**I saw:** did not type the dest sentence. Plant: classify reads `destFork.ask`. A dest ask with no create-word is not `his` even when the print says “create another agent.” Job inserts before ticket and dispatch. Stream dest process body is the print. Type send is `invokeDeepAgent` only — no `Cannot use import statement outside a module` from a Responses cousin, and SDK create no longer loads on that send.

### C. No ticket from a refused dest
**I saw:** did not reproduce a refuse on the glass. Plant: `destLeaveRefused` (`his` / `nobody`) returns before `insertDestJob` and `ticketForHand`. A refused dest does not call `ensureViaTravis`.

### After — Voice
**I saw:** no Hear it / Skip **buttons** in `Room.tsx` or `LogComposer.tsx`. Spoken invites stay.

**Steps I could not do (human):** Vercel team SSO. Travis email link (founder’s inbox). Type the create sentence. Confirm a `bc-` person sits, or a named Cursor hole on the Log. Type the dest sentence. Confirm a `dest_job` row and dest body = ask + print. Confirm he does not say “That is mine — create, sit, prove…”. Confirm the send is not `Travis error: Cannot use import statement outside a module`. Dest landing on the living Technical PM bind (`bc-b64bcdbb-…` on psi today — verify glass, not a planted constant). Talk on a phone. Paying Cursor. Those are the human’s. I do not fail the look for them.

## Loop

Pass. Emerged. Human may walk the same sheet on this preview (SSO + email, then A–C). Same PR. No cousin. No `fail-look`. Walk a Ready deploy of `6c18b33`, not production psi.
