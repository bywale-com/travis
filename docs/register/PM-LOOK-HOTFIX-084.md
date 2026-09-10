# PM look — 084 type dest timeout

**Packet:** HOTFIX-084
**Change packet:** none (hotfix)
**PR:** https://github.com/bywale-com/travis/pull/169
**Preview:** none (SQL / hang — no glass)
**Verdict:** Fail

## Look

Lock ([`HOTFIX-084-TYPE-DEST-TIMEOUT.md`](./HOTFIX-084-TYPE-DEST-TIMEOUT.md)): run `34537172870` — `come-back`, `type-send`, `voice-wrap` passed; `type-dest` died at 61.9s with Vercel 504. Three cuts: (1) `resolveDestBinding` must use `isSitProtocolRole` so `"pm"`, `"sa"`, and `"engineer"` all go through `resolveRoleDest`. (2) `handProtocol` must `dispatchToSeat` with `enqueueIfBusy: false` (write-and-leave), not `sendOrEnqueue`. (3) Type send and Voice finalize must enqueue `: ping\n\n` at stream start. (4) `type-dest.spec.ts` must accept `queue.seats` on a `QueueSnapshot` object. Verify: `npm test`.

Plant (Engineer `f0740a8` on [#169](https://github.com/bywale-com/travis/pull/169); trail `536e345`. Handoff index names **084**):

```20:27:src/server/dest-resolve.ts
  if (isSitProtocolRole(destKey)) {
    try {
      return await resolveRoleDest({ sessionId, role: destKey });
    } catch (err) {
      if (err instanceof SitError) return null;
      throw err;
    }
  }
```

```120:132:src/server/sit.ts
async function handProtocol(
  sessionId: string,
  binding: AgentBinding,
  protocolPath: string,
): Promise<void> {
  const files = await readSitFiles(protocolPath);
  const prompt = harnessText(files);
  await dispatchToSeat({
    sessionId,
    binding,
    prompt,
    enqueueIfBusy: false,
  });
}
```

Send and finalize both enqueue the SSE comment at stream start (`src/app/api/session/[id]/send/route.ts` · `finalize/route.ts`). Queue assert allows `queue.seats`. The four file cuts match the lock.

Hang — no glass. Did not open psi. `DATABASE_URL` is set; the hotfix named no row. Did not invent a query.

**Walk I queried** (Action [`34538652026`](https://github.com/bywale-com/travis/actions/runs/34538652026), checkout `f0740a8`, URL `https://travis-3ju0j3kw0-wale-omotayos-projects.vercel.app` — this plant, not psi):

| Walk | Result |
|------|--------|
| Lib `npm test` | 464 pass |
| `come-back` | pass (11.7s) |
| `type-dest` | **fail** 62.2s — `assert.ok(sent.status >= 200 && sent.status < 500)` |
| `type-send` | pass |
| `voice-wrap` | pass |

Same 62s / non-2xx–4xx hang the lock named. The four cuts are in `src/`. The 504 is not gone.

This PR merged at 22:42 UTC while this look was walking. Do not treat psi as the plant. The walk above is this cut’s deploy.

## Test

Walked [`HOTFIX-084-TYPE-DEST-TIMEOUT-TEST.md`](./HOTFIX-084-TYPE-DEST-TIMEOUT-TEST.md).

1. `npm test` on this bind — **464 pass, 0 fail.** I saw that.
2. Runtime doors on this plant’s preview (`34538652026`, SHA `f0740a8`):
   - `come-back.spec.ts` — pass. I saw that.
   - `type-send.spec.ts` — pass. I saw that.
   - `voice-wrap.spec.ts` — pass. I saw that.
   - `type-dest.spec.ts` — **fail**, 62.2s, status not in 200–499. Same shape as `34537172870`. I saw that.

Steps I could not do (human): Talk on a phone. A stranger’s hands on Voice / Type. Those are the human’s. I do not fail the look for them.

## Loop

Fail: Engineer must recut so `type-dest` on this plant’s preview does not 504. The four file cuts are in; the hang is still there. Same PR. No cousin. `fail-look` — not `wake-engineer`.
