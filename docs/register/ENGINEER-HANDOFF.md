# Engineer seat handoff — 2026-09-05

**This bind is living.** `bc-925e2ab1-3e97-43bc-b45e-2527302de811` is the Engineer until the founder pastes the successor block into a new chat. Do not write **This bind is done** until that handoff.

**Trail:** git + PRs. **One PR per initiative.** Do **not** append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.

**Pickup file:** this page. Update it when you stop so the next Engineer does not start from a transcript.

---

## Where we stopped

**025 is planted on [#127](https://github.com/bywale-com/travis/pull/127)** — Travis Stream close hangs `close_turn_id` on this trigger’s answering speakable `agent_post` (after the trigger and after this episode’s process), not session-latest. Tool finish stays a no-op until that post exists. Dest close on `post.id` was already correct — left alone. Named walk row `643e3e50-…` backfilled to seq 747. Do not remint 023 or 024 tables. Do not auto-open Stream.

Next specified pocket: **022** ports from the signed packet on [#120](https://github.com/bywale-com/travis/pull/120). Do not remint `travis.port`. Do not remint 023, 024, or 025. Do not send **That’s fine.**

| What | Where |
|------|--------|
| Implementation trail | Root [`README.md`](../../README.md) — newest first |
| Hotfix index | [`HOTFIXES.md`](./HOTFIXES.md) — **074** on this PR (hang this PM bind; skip SA). Next number **075**. |
| One PR law | [`initiatives/README.md`](./initiatives/README.md) |
| Production | `https://travis-psi.vercel.app` |
| Store | Shared Postgres schema `travis`. Cloud Agent `DATABASE_URL` is the live DB. |
| Face | Phone-first Voice / Log / Backlog. Smoke there. |
| Last plant | **025 Stream close** · [#127](https://github.com/bywale-com/travis/pull/127). Prior: **024** · [#126](https://github.com/bywale-com/travis/pull/126). **023** · [#123](https://github.com/bywale-com/travis/pull/123). Open: **022** · [#120](https://github.com/bywale-com/travis/pull/120). |
| Prior plants | 065 · [#108](https://github.com/bywale-com/travis/pull/108) · 015 · [#107](https://github.com/bywale-com/travis/pull/107) · 064 · [#102](https://github.com/bywale-com/travis/pull/102) · **Hotfix 062** · [#98](https://github.com/bywale-com/travis/pull/98) |
| Motion | SCP-013 · [PR #97](https://github.com/bywale-com/travis/pull/97) |
| House | SCP-012 · `os_node` · [PR #93](https://github.com/bywale-com/travis/pull/93) — refile via `docs/register/house-now/file-house.ts` |
| Busy room (lived) | `0e8875f8-283b-4dae-bf54-76c82a05b6ef` (title “Travis”) |

**Do not redo** 012, 013, 014, 015, 016, 020 first slice, 021, 023, 024, 025, 062, 064, 065, 068, 069, 070, 071, 072, or 073. Do not plant **022** except from the signed packet on #120. Do not send **That’s fine.** from Engineer.

---

## Planted on `main` (do not restart)

Newest first. Full sentences live on the README Implementation trail.

| Ref | PR | One line |
|-----|----|----------|
| 025 | [#127](https://github.com/bywale-com/travis/pull/127) | Stream card hangs on this episode’s answering post — not yet on `main` until this PR merges |
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
| Live visuals (Gemini patterns) | Write-back [`ENGINEER-LIVE-VISUALS.md`](./ENGINEER-LIVE-VISUALS.md). Job table + `parent_id` + push bus not planted. Canvas store not ascribed. |
| Ports host + connectors plate | 022 signed on [#120](https://github.com/bywale-com/travis/pull/120). Do not remint `travis.port`. |
| `TRAVIS_GITHUB_TOKEN` | Unfold receipts `not wired` until founder sets it, or 022 hangs it on port `github`. Not `GITHUB_TOKEN`. |
| `link` / structured artifact kind · founder upload | SA named silence. |
| Heard-survives-refresh · 007 R2 Hear / Next / Skip · urgency tiers | SA. |
| Chunked box stdout · Find rename · initiative stamp · process-primitive table | 024 named silence. Do not invent. |
| Idle door / catch-it-live compartment | 008 remainder. Already specified. Not 025. |
| 015 lived smoke | Phone face: create Pat (must not be picked as PM), sit, idle send, busy→spin, `who` still queues. Do not auto-sit existing `pm`/`sa`/`engineer`/`travis` rows. |

---

## Next Engineer job

1. Accept the seat from the paste below. Fetch `main`. Read **this file**, then [`ENGINEER.md`](../seats/ENGINEER.md), then `AGENTS.md`.
2. Do not restart 012 / 013 / 014 / 015 / 023 / 024 / 025 / 062 / 064 / 065. Do not mint a store. Do not append PM or SA logs.
3. **074** is the pickup: [`HOTFIX-074-HOTFIX-PATH.md`](./HOTFIX-074-HOTFIX-PATH.md). Hang this Technical PM bind. No SA. Do not overwrite catalog `pm`. Do not put a `bc-` in migrate. After that: **022** ports on #120. Do not remint `travis.port`. Do not send **That’s fine.**
4. When **you** stop: rewrite the **Current** lines at the top of this file (where we stopped, last plant, next hotfix number) so the next bind does not start from a transcript. Then you may write **This bind is done**.

---

## Paste — new Engineer

```text
You are Travis’s Engineer (full-stack implementer). Read docs/README.md “Engineer — identity” and accept it. Read repo-root AGENTS.md (always-on). You are not the Product Manager. You are not the Systems Analyst. Product face = voice/chat pipe (phone-first). Do not overwrite PHASE-ONE-LOG founder wording. Do not mint tables. Do not hard-code data into the SPA. Do not ship API keys to the client. Specified-and-clear: build it. Specified-but-blocked on PM or SA: name why; do not invent. Detailed: docs/seats/ENGINEER.md.

You are a NEW bind. The last Engineer was bc-925e2ab1-3e97-43bc-b45e-2527302de811. They handed off. Read docs/register/ENGINEER-HANDOFF.md first.

Then, in order:
1. docs/register/ENGINEER-HANDOFF.md — where we stopped, planted, leftover, locks.
2. Root README.md Implementation trail (newest first).
3. docs/seats/ENGINEER.md · AGENTS.md.
4. docs/register/initiatives/README.md — one PR per initiative.
5. Smoke on https://travis-psi.vercel.app — Voice / Log / Backlog.

Trail is git + PRs. One PR per initiative. Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG. Ask me what pocket we are in.
```
