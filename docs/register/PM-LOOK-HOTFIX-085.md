# PM look — 085 type-dest recut

**Packet:** HOTFIX-085
**Change packet:** none (hotfix)
**PR:** https://github.com/bywale-com/travis/pull/170
**Preview:** https://travis-git-cursor-hotfix-085-type-489ee8-wale-omotayos-projects.vercel.app
**Verdict:** Pass

## Look

Lock ([`HOTFIX-085-TYPE-DEST-RECUT.md`](./HOTFIX-085-TYPE-DEST-RECUT.md)): after 084, preview `runtime-doors` still 504’d `type-dest.spec.ts` at ~62s. Three holds: (1) `destBindingsForSend` ran *before* `new Response(stream)` — a role dest spin delayed headers; (2) `sendOrEnqueueMany` held the stream until the whole Cursor run finished; (3) SSE lacked `X-Accel-Buffering: no`. Cut: switch stays JSON and resolves dest on the way out; regular send returns the SSE stream immediately; inside `start`, flush `: ping\n\n`, write the user turn, then resolve dest and `dispatchToSeat` write-and-leave (`enqueueIfBusy: false` on sit roles). `sseHeaders()` adds the buffering header.

Plant (Engineer `5f56447`, handoff `b0f126a` last plant **085 type-dest recut** on [#170](https://github.com/bywale-com/travis/pull/170) — PR is **open**, not on `main`; do not treat psi as this plant):

```93:119:src/app/api/session/[id]/send/route.ts
  // Switch is JSON. Resolve dest here. Send must not — role dest can spin.
  if (decided.kind === "switch") {
    const destBindings: AgentBinding[] = await destBindingsForSend({
      sessionId,
      decided,
      referenceTurnId,
    });
    // ...
    return Response.json({
      matched: false,
      routerHandled: true,
      activeSeatKey: seatKey,
      activeLabel: bound.label ?? seatKeyToLabel(seatKey),
    });
  }
```

```135:200:src/app/api/session/[id]/send/route.ts
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(": ping\n\n"));
      // ...
        const userTurn = await insertUserTurn(
          sessionId,
          prompt,
          "travis",
          undefined,
          referenceTurnId,
        );
        const destBindings: AgentBinding[] = await destBindingsForSend({
          sessionId,
          decided,
          referenceTurnId,
        });
        // ...
        await Promise.allSettled(
          cursorBinds.map((binding) =>
            dispatchToSeat({
              sessionId,
              binding,
              prompt,
              enqueueIfBusy: isSitProtocolRole(binding.seatKey) ? false : undefined,
            }),
          ),
        );
        // ...
    },
  });

  return new Response(stream, { headers: sseHeaders() });
```

`sendOrEnqueueMany` is gone from this route. `dispatchToSeat` still stops at `run_started` (`src/server/dispatch.ts`).

```73:80:src/server/seat-pipe.ts
export function sseHeaders(): HeadersInit {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  };
}
```

Hang cut — no glass. `DATABASE_URL` is set. The hotfix named no tape row. I did not query psi as this plant. Handoff `b0f126a` prints the same verify run I walked (`34540106986`, `type-dest` 5.75s), not a SQL row.

**Preview I opened:** this PR’s host above — not `travis-psi`. 302 to Vercel SSO. I did not sign in. I did not see Voice / Log / Type glass. Do not fail a hang look for that.

## Test

Walked [`HOTFIX-085-TYPE-DEST-RECUT-TEST.md`](./HOTFIX-085-TYPE-DEST-RECUT-TEST.md).

**I saw, in order:**

1. `npm test` on this bind — `# tests 464` / `# pass 464` / `# fail 0`.
2. `runtime-doors.yml` against this PR’s Vercel deploy (run [`34540106986`](https://github.com/bywale-com/travis/actions/runs/34540106986), checkout `5f56447`, URL `https://travis-a52tctbbg-wale-omotayos-projects.vercel.app` — not psi):
   - `come-back.spec.ts` pass (10.79s).
   - `type-dest.spec.ts` pass (5.75s; lock named ~5.3s / 62s timeout).
   - `type-send.spec.ts` pass (4.23s).
   - `voice-wrap.spec.ts` pass (14.00s).
   - `# tests 4` / `# pass 4` / `# fail 0`. Check `runtime-doors` is green on the PR.

Prior cited run [`34539561829`](https://github.com/bywale-com/travis/actions/runs/34539561829) also passed the same four walks (`type-dest` 5.29s) on an earlier deploy SHA, not this head. This look uses `34540106986`.

**Steps I could not do (human):** Talk on a phone. Type a dest line on the live desk through Vercel team SSO. A stranger’s hands. Those are the human’s. I do not fail the look for them.

## Loop

Pass: emerged. Human may walk the same sheet. Same PR. No cousin. No `fail-look`.
