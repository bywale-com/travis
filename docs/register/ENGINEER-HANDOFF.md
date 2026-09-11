# Engineer seat handoff — 2026-09-11

**This bind is done.** Last prior bind: this run (`fail-look` recut on probe [#173](https://github.com/bywale-com/travis/pull/173)). Do not start from a transcript.

**087 ESM recut on probe #173:** `next.config.ts` webpack alias `deepagents/node` → `dist/node.cjs` (removed from `serverExternalPackages` so Vercel does not `import()` ESM). Type send writes `Dest error:` when `dispatchToSeat` returns error. `npm test` 472 pass. `next build` pass. **Await CI** — preview deploy must rerun `runtime-doors` to confirm think-walks green. **type-dest** may still fail on Cursor hard-limit billing — founder dashboard, not Engineer.

**086 runtime is the app (merged [#171](https://github.com/bywale-com/travis/pull/171)):** Walks wait for the mouth. Red `runtime-doors` fresh-adds `fail-look`. Action on `main`. Playwright glass still SA 036. Signal is `runtime-doors`.

**085 type-dest recut (merged):** Type send returns SSE and writes the user turn before role dest resolve; chip dests dispatch write-and-leave (`dispatchToSeat` with `enqueueIfBusy: false` on role dests); SSE headers include `X-Accel-Buffering: no`. Merged on [PR #170](https://github.com/bywale-com/travis/pull/170).

**084 role dest timeout (merged):** Role dest resolves all sit roles (`isSitProtocolRole`), sit handoff uses `dispatchToSeat` write-and-leave, SSE emits immediate ping comment. Merged on [PR #169](https://github.com/bywale-com/travis/pull/169).

**020 runtime verify (merged):** `src/lib/live-connect.ts` — in-flight connect **waits**; unwired keeps **Travis isn’t wired**; a real miss still gets the phone-ear shirt. Room hangs those rules. `npm test` covers the three lies. **Walks planted:** `src/runtime/desk.ts` + `doors.ts` + `walks/voice-wrap.spec.ts` + `type-send.spec.ts` + `come-back.spec.ts` + `type-dest.spec.ts`; `npm run test:runtime`; Action `.github/workflows/runtime-doors.yml` on `vercel.deployment.ready` paints check `runtime-doors`. Operator resolution accepts email (`test-runner@travis.internal`) with isolated room scope (`ownerId === viewerIds[0]`). Merged on [PR #165](https://github.com/bywale-com/travis/pull/165). Do not remint dest assemble / 031–035.

**Trail:** git + PRs. **One PR per initiative.** Do **not** append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.

**Pickup file:** this page. Update it when you stop so the next Engineer does not start from a transcript.

---

## Where we stopped

**Probe #173 fail-look recut — ESM fix planted, CI pending.** Run [`34612643665`](https://github.com/bywale-com/travis/actions/runs/34612643665) showed five walks red: think-walks on `Travis error: Cannot use import statement outside a module`; type-dest on Cursor hard limit. This bind recut the ESM miss: webpack alias to `deepagents/dist/node.cjs` + dest dispatch error on tape. Cousin branch `cursor/runtime-verify-is-the-app-f07d` had the same fix (`cc8424f`); ported here on #173. **Do not merge #173 as product** — it is a probe; cherry the src/ diff to a proper Hotfix 087 PR if walks go green. Close probe when human is satisfied.

**035 stream architecture is planted on [#163](https://github.com/bywale-com/travis/pull/163).** Classify is `src/lib/stream-intent.ts` (new / change / cancel / talk). Do is `src/server/stream-dispatch.ts` — hangs dest assemble, 034 follow-up, `cancelCursorRun`, and `invokeDeepAgent({ mode: "update" })`. Mouth is last. Live `liveShouldPipeTravis` is always false; transcript dest-by-name still leaves, then dispatches the rest, never `pipeTravisText`. Type send writes the tape, files chip / call-by-name dests, dispatches remaining intents, then synthesizes. Finalize strips the done-phrase, backup-Do once if a leave never started, then synthesizes. `parent_id` unused. No new table. Glass: `destGlassName` / `SIT_ROLE_LABEL.pm` / `seatKeyToLabel("pm")` → **Technical Architect**. Spoken “Technical Architect” and “Technical PM” both route to `pm`. Path `/protocols/pm.md`. Grain tests + `next build` passed. Human look+test is [`PM-PACKET-019-STREAM-ARCH-TEST.md`](./PM-PACKET-019-STREAM-ARCH-TEST.md) on Log · Type after this lands on psi. Do not remint dest assemble, dest-gate-on-ask, Cloud create, `dest_job`, checkpointer, or 031–034.

**034 what exists is planted on [#161](https://github.com/bywale-com/travis/pull/161).** Type `invokeDeepAgent` hangs official `PostgresSaver` (`schema langgraph`, own `pg.Pool` max 1) and invokes with `thread_id = voice_session.id`. Walk-back may answer from that thread + `/print.md` + `search_room`; Here stays clipped. Dest: if `listOpenDestJobs` has an open row for the living bind, follow-up that same `bc-` (`dispatchToSeat` / `streamCursorReply`); no spin, no create, no new `dest_job`. Idle → send. Busy → enqueue on that bind; receipt names `agent_busy`. New leave (no open job) stays 015 / 031 / 033. Do not remint dest assemble, dest-gate-on-ask, Cloud create, `dest_job`, or Type Responses.

**033 lived redesign is planted on [#159](https://github.com/bywale-com/travis/pull/159).** Dest-gate classifies `destFork.ask` (last `kind=user`), not `assembled`. Create is `POST https://api.cursor.com/v1/agents` via the existing cursor-port host + Basic auth — `Agent.create` is gone from `createAgentBinding`. No binding row without a `bc-` id. `handToDest` order is classify → resolve living → `insertDestJob` → `ticketForHand` → `fileDestJobInitiative` → `dispatchToSeat`. Role dest uses `livingSeated` / `roleDestPick`; spin only when nobody living. `createStandInRoom` hangs Travis + one living seated per `/protocols/pm.md` · `/protocols/sa.md` · `/protocols/engineer.md`. Type send stays `invokeDeepAgent` only. Do not remint 031 / 032 / `dest_job` / 074 SQL.

**032 compose the send harness is planted on [#157](https://github.com/bywale-com/travis/pull/157).** Type `generateTravisText` is `invokeDeepAgent` only. `generateTravisTextViaResponses` and the silent catch are gone. A kit throw reaches `pipeTravisText` → `travisGenerateMiss`. Dest assemble, `/print.md`, `/roster.md`, Here clip, and `dest_job` were not reminted. Do not remint 032.

**081 Voice uses the Type hang is planted.** A spoken line to Travis on Live runs `pipeTravisText` → Deep Agents. Realtime is ear + mouth. 035 took the live full-pipe out; do not put it back. Do not remint dest grain.

**031 dest harness recut is on `main` via [#154](https://github.com/bywale-com/travis/pull/154).** Every dest leave assembles ask + dest print. Marker words are gone. `/print.md` and `/roster.md` hang on Type. Dest seats stay Cursor. Do not remint 031.

**080 Deep Agents must answer is planted on [#151](https://github.com/bywale-com/travis/pull/151).** Type hangs `createDeepAgent` from `deepagents/node`. 032 deleted the Responses cousin that 080 had restored. Do not remint the `/node` hang path — alias CJS instead.

**079 Talk HTML as JSON is planted on [#149](https://github.com/bywale-com/travis/pull/149).** Voice / Talk finalize and Type `/send` use `readJson`. SSE chunks use `parseJsonText`. `generateTravisText` lazy-loads Deep Agents after the route has returned SSE.

**030 Deep Agents (dest-with-context) is on `main` via [#147](https://github.com/bywale-com/travis/pull/147).** Type `generateTravisText` is `createDeepAgent().invoke`. 031 recut how that dest fork fires. 032 deleted the cousin. Do not remint 030 stores.

**029 The room stays live is planted on [#144](https://github.com/bywale-com/travis/pull/144).** In-room `GET /api/session/:id/events` resumes from last `seq` (or `Last-Event-ID`), emits turn / backlog / ticket / stream, then `LISTEN travis_room`. Do not remint the 029 index. Do not plant a websocket.

**027 Voice stay is on [#140](https://github.com/bywale-com/travis/pull/140).** Do not remint `heard_at`, `reference_turn_id`, `travis.stream`, hang SQL, or the cutoff UPDATE.

**026 Serve is on [#134](https://github.com/bywale-com/travis/pull/134).** Follow-on dest inherits the last open dest ticket.

**078 / 077 open desk** — on `main`. Production psi is open desk unless `TRAVIS_OPEN_DESK=0`.

**076 dest closer is on [#130](https://github.com/bywale-com/travis/pull/130).** Dest **done** and reap land one speakable `agent_post`.

Human leftover on 075: dest **by who** (`technical-pm`) on the phone still stands as leftover, not a remint. Do not mail catalog `pm`.

Do not remint 012 / 023–034 or the 074 SQL. Do not remint **035**. Do not remint **079**. Do not remint **080**. Do not remint **081**. Do not send **That’s fine.**

| What | Where |
|------|--------|
| Implementation trail | Root [`README.md`](../../README.md) — newest first |
| Hotfix index | [`HOTFIXES.md`](./HOTFIXES.md) — **087** ESM recut on #173. Next formal hotfix file **087** if merged separately. |
| One PR law | [`initiatives/README.md`](./initiatives/README.md) |
| Production | `https://travis-psi.vercel.app` |
| Store | Shared Postgres schema `travis`. Cloud Agent `DATABASE_URL` is the live DB. |
| Face | Phone-first Voice / Log / Backlog. Smoke there. |
| Last plant | **087 ESM recut** · [PR #173](https://github.com/bywale-com/travis/pull/173). Prior: **Hotfix 086** · [PR #171](https://github.com/bywale-com/travis/pull/171). |

**Do not redo** 012, 013, 014, 015, 016, 020 first slice, 021, 023, 024, 025, 026, 027, **029**, **030**, **031**, **032**, **033**, **034**, **035**, **081**, 062, 064, 065, 068, 069, 070, 071, 072, 073, 074 SQL, the 075 live hang, the 076 dest closer, the 027 cutoff write, the 029 index, **077 / 078** open desk, **079**, or **080**. Do not plant **022** except from the signed packet on #120. Do not remint dest-with-context grain. Do not remint Cloud HTTP create. Do not remint the LangGraph `langgraph` checkpointer. Do not remint `stream-intent` / `stream-dispatch`. Do not send **That’s fine.** from Engineer.

---

## Specified but not clear (name; do not invent)

| Gap | Why it is blocked |
|-----|-------------------|
| Cursor API hard limit on dest walks | type-dest red: `Dest error: You need to increase your hard limit…` ($2 remaining). Founder billing on Cursor dashboard — not Engineer plant. Tape + seatKey are correct. |
| Live / Realtime as a second brain | 032 / 081 / 035: Voice think waits for finalize. Realtime is ear + mouth. Do not remint dest-gate. |
| LangGraph checkpoint table | 030 silence. Official saver + later invoke. No `Command` / `updateState`. |
| Deep Agents `task` as dest | Dest is Cursor. Kit is not that wire. |
| Other harness forks | Type process is Deep Agents. Do not invent a catalog. |
| Live visuals (Gemini patterns) | Write-back [`ENGINEER-LIVE-VISUALS.md`](./ENGINEER-LIVE-VISUALS.md). Job table + `parent_id` + push bus not planted. Canvas store not ascribed. |
| Ports host + connectors plate | 022 signed on [#120](https://github.com/bywale-com/travis/pull/120). Do not remint `travis.port`. |
| `TRAVIS_GITHUB_TOKEN` | Unfold receipts `not wired` until founder sets it, or 022 hangs it on port `github`. Not `GITHUB_TOKEN`. |
| `link` / structured artifact kind · founder upload | SA named silence. |
| 007 R2 Hear-queue sheet · invited urgency | 027 removed Hear / Skip **buttons**; spoken invites stay. Invited urgency is still 007 R1 silence. |
| Chunked box stdout · Find rename · initiative stamp · process-primitive table | 024 named silence. Do not invent. |
| Idle door / catch-it-live compartment | 008 remainder. Already specified. Not 025. |
| Rooms index bus | 029 silence. Index is one-shot + last good. Not on the room wire. |
| 015 lived smoke | Phone face: create Pat (must not be picked as PM), sit, idle send, busy→spin, `who` still queues. Do not auto-sit existing `pm`/`sa`/`engineer`/`travis` rows. |
| 028 usable Log | PM-012 on [#142](https://github.com/bywale-com/travis/pull/142). Do not remint here. |
| 031 psi walk | [`PM-PACKET-015-DEST-HARNESS-TEST.md`](./PM-PACKET-015-DEST-HARNESS-TEST.md) after that PR is on psi. Grain tests are not that walk. |
| 032 psi walk | [`PM-PACKET-016-COMPOSE-TEST.md`](./PM-PACKET-016-COMPOSE-TEST.md) after this PR is on psi. Grain + compile are not that walk. |
| 033 psi walk | [`PM-PACKET-017-LIVED-REDESIGN-TEST.md`](./PM-PACKET-017-LIVED-REDESIGN-TEST.md) after this PR is on psi. Grain + compile are not that walk. |
| 034 psi walk | [`PM-PACKET-018-WHAT-EXISTS-TEST.md`](./PM-PACKET-018-WHAT-EXISTS-TEST.md) after this PR is on psi. Grain + compile are not that walk. |
| 035 psi walk | [`PM-PACKET-019-STREAM-ARCH-TEST.md`](./PM-PACKET-019-STREAM-ARCH-TEST.md) after this PR is on psi. Grain + compile are not that walk. |

---

## Next Engineer job

1. Accept the seat from the paste below. Fetch `main`. Read **this file**, then [`ENGINEER.md`](../seats/ENGINEER.md), then `AGENTS.md`.
2. Check **runtime-doors** on [#173](https://github.com/bywale-com/travis/pull/173) after preview deploy — think-walks should green if ESM alias holds on Vercel.
3. If green: cherry src/ to formal Hotfix 087 PR on `main`; close probe #173.
4. If type-dest still red on billing: name it; do not invent.
5. When **you** stop: rewrite the **Current** lines at the top of this file.

---

## Paste — new Engineer

```text
You are Travis’s Engineer (full-stack implementer). Read docs/README.md “Engineer — identity” and accept it. Read repo-root AGENTS.md (always-on). You are not the Product Manager. You are not the Systems Analyst. Product face = voice/chat pipe (phone-first). Do not overwrite PHASE-ONE-LOG founder wording. Do not mint tables. Do not hard-code data into the SPA. Do not ship API keys to the client. Specified-and-clear: build it. Specified-but-blocked on PM or SA: name why; do not invent. Detailed: docs/seats/ENGINEER.md.

You are a NEW bind. Read docs/register/ENGINEER-HANDOFF.md first.

Then, in order:
1. docs/register/ENGINEER-HANDOFF.md — where we stopped, planted, leftover, locks.
2. Root README.md Implementation trail (newest first).
3. docs/seats/ENGINEER.md · AGENTS.md.
4. docs/register/initiatives/README.md — one PR per initiative.
5. Smoke on https://travis-psi.vercel.app — Voice / Log / Backlog.

Trail is git + PRs. One PR per initiative. Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG. Ask me what pocket we are in.
```
