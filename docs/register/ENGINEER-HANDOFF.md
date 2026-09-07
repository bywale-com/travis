# Engineer seat handoff — 2026-09-07

**This bind is done.** Last Engineer: `bc-3fa710bb-cdbe-4df6-b216-5fb9db9cf887`. The next bind pastes the block at the bottom. Do not start from a transcript.

**Trail:** git + PRs. **One PR per initiative.** Do **not** append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.

**Pickup file:** this page. Update it when you stop so the next Engineer does not start from a transcript.

---

## Where we stopped

**080 Deep Agents must answer is planted on [#151](https://github.com/bywale-com/travis/pull/151).** Type hangs `createDeepAgent` from `deepagents/node` (CJS, not the browser ESM that Vercel `require()` died on). If import/invoke still throws, the same generate falls back to the six-step OpenAI Responses loop (same tools, same key). A generate miss writes `Travis error: …` so the Log shows it. Dest-with-context grain was not reminted. Human look+test is [`HOTFIX-080-DEEPAGENTS-ESM-TEST.md`](./HOTFIX-080-DEEPAGENTS-ESM-TEST.md) on the live Travis app after this PR is on psi.

**079 Talk HTML as JSON is planted on [#149](https://github.com/bywale-com/travis/pull/149).** Voice / Talk finalize and Type `/send` use `readJson`. SSE chunks use `parseJsonText` so the banner never says `Unexpected token '<'`. `generateTravisText` lazy-loads Deep Agents after the route has returned SSE. `jsonRoute` + `maxDuration = 60` on finalize / send / live-token. Dest-with-context grain was not reminted. Human look+test is [`HOTFIX-079-TALK-HTML-JSON-TEST.md`](./HOTFIX-079-TALK-HTML-JSON-TEST.md) on the live Travis app.

**030 Deep Agents (dest-with-context) is on `main` via [#147](https://github.com/bywale-com/travis/pull/147).** Type `generateTravisText` is `createDeepAgent().invoke`. Do not remint dest-with-context grain or unclip Here.

**029 The room stays live is planted on [#144](https://github.com/bywale-com/travis/pull/144).** In-room `GET /api/session/:id/events` resumes from last `seq` (or `Last-Event-ID`), emits turn / backlog / ticket / stream, then `LISTEN travis_room`. Do not remint the 029 index. Do not plant a websocket.

**027 Voice stay is on [#140](https://github.com/bywale-com/travis/pull/140).** Do not remint `heard_at`, `reference_turn_id`, `travis.stream`, hang SQL, or the cutoff UPDATE.

**026 Serve is on [#134](https://github.com/bywale-com/travis/pull/134).** Follow-on dest inherits the last open dest ticket.

**078 / 077 open desk** — on `main`. Production psi is open desk unless `TRAVIS_OPEN_DESK=0`.

**076 dest closer is on [#130](https://github.com/bywale-com/travis/pull/130).** Dest **done** and reap land one speakable `agent_post`.

Human leftover on 075: dest **by who** (`technical-pm`) on the phone still stands as leftover, not a remint. Do not mail catalog `pm`.

Do not remint 012 / 023–030 or the 074 SQL. Do not remint **079**. Do not remint **080**. Do not send **That’s fine.**

| What | Where |
|------|--------|
| Implementation trail | Root [`README.md`](../../README.md) — newest first |
| Hotfix index | [`HOTFIXES.md`](./HOTFIXES.md) — **080** on [#151](https://github.com/bywale-com/travis/pull/151). Next number **081**. |
| One PR law | [`initiatives/README.md`](./initiatives/README.md) |
| Production | `https://travis-psi.vercel.app` |
| Store | Shared Postgres schema `travis`. Cloud Agent `DATABASE_URL` is the live DB. |
| Face | Phone-first Voice / Log / Backlog. Smoke there. |
| Last plant | **080 Deep Agents must answer** · [#151](https://github.com/bywale-com/travis/pull/151). Prior: **079 Talk HTML as JSON** · [#149](https://github.com/bywale-com/travis/pull/149). **030 Deep Agents** · [#147](https://github.com/bywale-com/travis/pull/147) (on `main`). **029 Lists show now** · [#144](https://github.com/bywale-com/travis/pull/144). **027 Voice stay** · [#140](https://github.com/bywale-com/travis/pull/140). **026 Serve** · [#134](https://github.com/bywale-com/travis/pull/134). **076 dest closer** · [#130](https://github.com/bywale-com/travis/pull/130). **075** live hang · same PR. **074** SQL file · same PR. **025** · [#127](https://github.com/bywale-com/travis/pull/127). **024** · [#126](https://github.com/bywale-com/travis/pull/126). **023** · [#123](https://github.com/bywale-com/travis/pull/123). Open: **022** · [#120](https://github.com/bywale-com/travis/pull/120). |
| Prior plants | 065 · [#108](https://github.com/bywale-com/travis/pull/108) · 015 · [#107](https://github.com/bywale-com/travis/pull/107) · 064 · [#102](https://github.com/bywale-com/travis/pull/102) · **Hotfix 062** · [#98](https://github.com/bywale-com/travis/pull/98) |
| Motion | SCP-013 · [PR #97](https://github.com/bywale-com/travis/pull/97) |
| House | SCP-012 · `os_node` · [PR #93](https://github.com/bywale-com/travis/pull/93) — refile via `docs/register/house-now/file-house.ts` |
| Busy room (lived) | `0e8875f8-283b-4dae-bf54-76c82a05b6ef` (title “Travis”) |

**Do not redo** 012, 013, 014, 015, 016, 020 first slice, 021, 023, 024, 025, 026, 027, **029**, **030**, 062, 064, 065, 068, 069, 070, 071, 072, 073, 074 SQL, the 075 live hang, the 076 dest closer, the 027 cutoff write, the 029 index, **077 / 078** open desk, **079**, or **080**. Do not plant **022** except from the signed packet on #120. Do not remint dest-with-context grain. Do not send **That’s fine.** from Engineer.

---

## Planted on `main` (do not restart)

Newest first. Full sentences live on the README Implementation trail.

| Ref | PR | One line |
|-----|----|----------|
| 030 | [#147](https://github.com/bywale-com/travis/pull/147) | Deep Agents on Type + dest-with-context unclipped print |
| 029 | [#144](https://github.com/bywale-com/travis/pull/144) | Room SSE + seq resume + `NOTIFY travis_room` — not yet on `main` until that PR merges |
| 027 | [#140](https://github.com/bywale-com/travis/pull/140) | New after cutoff, reply thread, dest timeout ≠ stream fail, `travis-stay`, Technical PM glass — not yet on `main` until that PR merges |
| 025 | [#127](https://github.com/bywale-com/travis/pull/127) | Stream card hangs on this episode’s answering post |
| 024 | [#126](https://github.com/bywale-com/travis/pull/126) | Stream store + door + card |
| 073 | [#126](https://github.com/bywale-com/travis/pull/126) | Technical PM: inspect `src/`, spec face + cut; Engineer implements |
| 072 | [#125](https://github.com/bywale-com/travis/pull/125) | Dead running step reclaimed; backlog footer after the rows |
| 023 | [#123](https://github.com/bywale-com/travis/pull/123) | Thread truth, motion card, dest gate + `dest_job`; catalog fallback dead |
| 021 | [#119](https://github.com/bywale-com/travis/pull/119) | Prove loop, house≠box, unfold to GitHub; five back |
| 071 | [#116](https://github.com/bywale-com/travis/pull/116) | Named ticket gets the addition; failed send is a receipt; catalog fallback |
| 070 | [#115](https://github.com/bywale-com/travis/pull/115) | Glance marks no seat post; miss ≠ cousin; check-narration drops |
| 069 | [#114](https://github.com/bywale-com/travis/pull/114) | Receipt is the send; ticket-scoped read; Here names no-run |
| 016 | [#112](https://github.com/bywale-com/travis/pull/112) | Here block + Live refresh; tools are depth |
| 068 | [#111](https://github.com/bywale-com/travis/pull/111) | Open backlog titles in the room window; a search miss is not empty |
| 067 | [#110](https://github.com/bywale-com/travis/pull/110) | House labor script excluded from `next build` |
| 066 | [#109](https://github.com/bywale-com/travis/pull/109) | One-PR trail everywhere; leftover PM log/packets on `main`; cousins close |
| 065 | [#108](https://github.com/bywale-com/travis/pull/108) | One PR per initiative; initiative folders |
| 015 | [#107](https://github.com/bywale-com/travis/pull/107) | Sit hangs protocol; role dest idle/spin, never enqueue |
| 014 | [#104](https://github.com/bywale-com/travis/pull/104) | Split dest-seat beats + Voice `create_agent` |
| 064 | [#102](https://github.com/bywale-com/travis/pull/102) | Dest-seat hang; rich type; thought on the roster circle |
| 062 | [#98](https://github.com/bywale-com/travis/pull/98) | Hung `image` / `file` on the Log post |
| 013 | [#97](https://github.com/bywale-com/travis/pull/97) | `motion` + runner; Backlog All / In motion / Initiatives |
| 012 | [#93](https://github.com/bywale-com/travis/pull/93) | House `os_node` — `/protocols`, `/templates` |

Create-agent prompt is still the one-line stub. Do not paste a seat block at create.

---

## Founder locks (keep)

- Rooms list = last conversation first (061).
- Backlog tickets are `open` \| `done` only. Next / Lit are derived.
- Create / in-the-room / seated stay **three moments**. Sit is planted (015). Reuse idle; busy → next, not enqueue. `who` may still queue.
- Travis is system-wide Om Coda / OS. House-now = `os_node`. POSIX later. No computer use.
- In motion **lives in Backlog**. Voice “N in motion” counts **only** Travis processes. **No product caps.**
- Seat posts do **not** Google-read. New wakes Travis, names the seat, never the body (051).
- Artifact kinds are `image` \| `file` only. Links and founder upload are **SA silence**. If it is visible in the Cursor chat, hang it on the Log post.
- **One PR per initiative.** Envelope / packet / pocket are roles of that PR. Hotfixes stay their own cuts and get merged.
- Do not append PM or SA logs.
- Live work is not a Log line. Stream is the episode. 023 MotionCard is a receipt, not the stream.
- Stream does **not** open itself. The card hangs above **this** episode’s completed line.
- Dest done: one finished message on the Log. Everything else in the card. Same card as Travis (076).
- Work on a ticket is **on** that ticket. Travis offers a landing with seat + title (or “that other thing”). Hear is a gist. Skip leaves the post (026).
- Lists he is looking at update without hard refresh. A failed GET keeps the last good rows (029).
- Dest-with-context: dest body **is** the print plus the ask. Here stays clipped (030).

---

## Open / leftover (do not treat as the next plant)

Leftover cousin drafts of planted pockets. Close them. Do not re-plant.

| PR | What it was |
|----|-------------|
| #96 #92 #81 #78 #76 #75 #72 #71 #68 #42 #30 #29 #28 #27 #26 #20 #15 #8 #7 #4 | Cousins of work already on `main`, or trail this cut brought onto `main` |

---

## Specified but not clear (name; do not invent)

| Gap | Why it is blocked |
|-----|-------------------|
| Live / Realtime Deep Agents hang | 030 named silence. Voice parked. `/live/token` + `/live/tool` stay. Dest grain still rewrites if Live dests. |
| LangGraph checkpoint table | 030 silence. Per-invoke StateBackend only. |
| Deep Agents `task` as dest | Dest is Cursor. Kit is not that wire. |
| Other harness forks | First fork is dest-with-context. Do not invent a catalog. |
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

---

## Next Engineer job

1. Accept the seat from the paste below. Fetch `main`. Read **this file**, then [`ENGINEER.md`](../seats/ENGINEER.md), then `AGENTS.md`.
2. Do not restart 012 / 013 / 014 / 015 / 023 / 024 / 025 / 026 / 027 / **029** / **030** / 062 / 064 / 065 / 077 / 078 / **079** / **080**. Do not remint the 074 SQL file. Do not remint the 075 hang. Do not remint the 076 dest closer. Do not remint the 027 cutoff. Do not remint the 029 index. Do not remint dest-with-context grain or the Deep Agents `/node` hang. Do not mint a store. Do not append PM or SA logs.
3. **022** ports on [#120](https://github.com/bywale-com/travis/pull/120) is the pickup after 080 merges. Do not remint `travis.port`. Dest by who `technical-pm` is human leftover on 075 — do not mail catalog `pm`. Do not send **That’s fine.**
4. When **you** stop: rewrite the **Current** lines at the top of this file (where we stopped, last plant, next hotfix number) so the next bind does not start from a transcript. Then you may write **This bind is done**.

---

## Paste — new Engineer

```text
You are Travis’s Engineer (full-stack implementer). Read docs/README.md “Engineer — identity” and accept it. Read repo-root AGENTS.md (always-on). You are not the Product Manager. You are not the Systems Analyst. Product face = voice/chat pipe (phone-first). Do not overwrite PHASE-ONE-LOG founder wording. Do not mint tables. Do not hard-code data into the SPA. Do not ship API keys to the client. Specified-and-clear: build it. Specified-but-blocked on PM or SA: name why; do not invent. Detailed: docs/seats/ENGINEER.md.

You are a NEW bind. The last Engineer was bc-3fa710bb-cdbe-4df6-b216-5fb9db9cf887. They handed off. Read docs/register/ENGINEER-HANDOFF.md first.

Then, in order:
1. docs/register/ENGINEER-HANDOFF.md — where we stopped, planted, leftover, locks.
2. Root README.md Implementation trail (newest first).
3. docs/seats/ENGINEER.md · AGENTS.md.
4. docs/register/initiatives/README.md — one PR per initiative.
5. Smoke on https://travis-psi.vercel.app — Voice / Log / Backlog.

Trail is git + PRs. One PR per initiative. Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG. Ask me what pocket we are in.
```
