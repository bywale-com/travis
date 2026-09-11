# Hotfix 085 — Recut type-dest: SSE before dest resolve, write-and-leave chips

**Number:** `085` — next engineer hotfix is `086`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer.  
**When:** 2026-09-10  
**PR title shape:** `Hotfix 085 — Recut type-dest: SSE before dest resolve, write-and-leave chips`  
**Test:** [`HOTFIX-085-TYPE-DEST-RECUT-TEST.md`](./HOTFIX-085-TYPE-DEST-RECUT-TEST.md)

---

## Why

After Hotfix 084 landed the initial four file cuts, the deployment check on Vercel preview (`runtime-doors.yml` on run `34538652026` / `34538769175` / `34539144435`) still failed `type-dest.spec.ts` at ~62s with a 504 Gateway Timeout:
1. In `src/app/api/session/[id]/send/route.ts`, `destBindingsForSend` was executed *before* `new Response(stream)` was constructed. When a role dest needs to spin up, `resolveRoleDest` -> `spinSeatedRole` -> `createAgentBinding` creates a Cursor Cloud Agent over the network, delaying the return of the HTTP response headers.
2. Inside `stream.start`, `sendOrEnqueueMany` synchronously held execution awaiting the entire Cursor Cloud Agent run (30–120s) instead of writing-and-leaving at `run_started`.
3. Vercel serverless functions / edge proxy buffer headers unless `X-Accel-Buffering: no` is explicitly set on SSE responses.

## Cut

1. `src/app/api/session/[id]/send/route.ts`:
   - For `switch`, resolve dest bindings synchronously and return JSON.
   - For regular sends, return the SSE `ReadableStream` immediately. Inside `stream.start`, flush `: ping\n\n`, insert the user turn into the tape, resolve `destBindingsForSend`, and dispatch cursor chip dests using `dispatchToSeat` write-and-leave (`enqueueIfBusy: isSitProtocolRole(binding.seatKey) ? false : undefined`) instead of `sendOrEnqueueMany`.
2. `src/server/seat-pipe.ts`:
   - Add `"X-Accel-Buffering": "no"` to `sseHeaders()` to disable response buffering in reverse proxies and Vercel edge.

## Verify

1. `npm test` passes all unit tests (464 pass).
2. Live Vercel deployment check `runtime-doors.yml` (e.g. run `34539561829`) passes all 4 sequential walks in 34s, with `type-dest` completing in 5.29s (down from 62.05s timeout).
