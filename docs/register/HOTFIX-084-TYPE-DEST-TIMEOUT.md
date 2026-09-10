# Hotfix 084 — Role dest resolution and handProtocol timeout on runtime walks

**Number:** `084` — next engineer hotfix is `085`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer.  
**When:** 2026-09-10  
**PR title shape:** `Hotfix 084 — Role dest resolution and handProtocol timeout on runtime walks`  
**Test:** [`HOTFIX-084-TYPE-DEST-TIMEOUT-TEST.md`](./HOTFIX-084-TYPE-DEST-TIMEOUT-TEST.md)

---

## Why

On the `vercel.deployment.ready` preview verification check (`runtime-doors.yml` on run `34537172870`):
- `come-back.spec.ts`, `type-send.spec.ts`, and `voice-wrap.spec.ts` passed.
- `type-dest.spec.ts` failed after 61.9s with a 504 Gateway Timeout from Vercel.

Two defects caused this:
1. `src/server/dest-resolve.ts`: `resolveDestBinding` only treated `"pm"` as a role dest (`destKey === "pm"`), while `"engineer"` and `"sa"` were treated as existing seat keys. Because the test operator's room only contains Travis, `openBindingForSeat(sessionId, "engineer")` returned `null`, returning an empty `cursorBinds = []` array on send.
2. Fallback to synchronous protocol execution: When `cursorBinds` was empty, `dispatchStreamIntents` ran in the stream body, matching `Engineer, inspect...` and spinning a seated role via `spinSeatedRole` -> `sitBinding` -> `handProtocol`. `handProtocol` used `sendOrEnqueue`, which blocked the request synchronously awaiting full Cloud Agent completion (~30–120s). Since no bytes had flushed to the HTTP response, Vercel timed out at 60s with 504.
3. Queue assertion in `type-dest.spec.ts`: `readQueue(desk)` returns `{ queue: QueueSnapshot, drainable, running }`, where `queue` is an object (`{ seats: [...] }`), not an array.

## Cut

1. `src/server/dest-resolve.ts`: Use `isSitProtocolRole(destKey)` so `"pm"`, `"sa"`, and `"engineer"` all resolve via `resolveRoleDest({ sessionId, role: destKey })`.
2. `src/server/sit.ts`: In `handProtocol`, use `dispatchToSeat` with `enqueueIfBusy: false` (Hotfix 039 write-and-leave at `run_started`) instead of `sendOrEnqueue`.
3. `src/app/api/session/[id]/send/route.ts` & `src/app/api/session/[id]/finalize/route.ts`: Immediately enqueue `: ping\n\n` SSE comment at stream start so HTTP headers flush over the wire immediately.
4. `src/runtime/walks/type-dest.spec.ts`: Allow `queueData.queue` to be a `QueueSnapshot` object (`queue.seats` array).

## Verify

`npm test` passes.
