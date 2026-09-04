# Engineer seat handoff — 2026-09-03

**This bind is done.** `bc-94804572-3a2f-4075-b290-a95c73730bd3` is **not** the living Engineer after the founder pastes the block below into a new chat.

**Trail:** git + PRs. Do **not** append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.

**Pickup file:** this page. Update it when you stop so the next Engineer does not start from a transcript.

---

## Where we stopped

The pipe is planted. Last plant on `main` before this handoff: **Hotfix 062** — hung images and files on the Log post ([PR #98](https://github.com/bywale-com/travis/pull/98)).

This bind then misread “update yourself to be able to handoff seat” as a dispatch-to-PM/SA ritual ([PR #101](https://github.com/bywale-com/travis/pull/101) first cut). Founder corrected: **revise so a new Engineer picks up where this one stopped.** That is this file.

| What | Where |
|------|--------|
| Implementation trail | Root [`README.md`](../../README.md) — newest first |
| Hotfix index | [`HOTFIXES.md`](./HOTFIXES.md) — next number **064** |
| Production | `https://travis-psi.vercel.app` |
| Store | Shared Postgres schema `travis`. Cloud Agent `DATABASE_URL` is the live DB. |
| Face | Phone-first Voice / Log / Backlog. Smoke there. |
| Last plant | 062 · [`HOTFIX-062-THREAD-ARTIFACTS.md`](./HOTFIX-062-THREAD-ARTIFACTS.md) · [PR #98](https://github.com/bywale-com/travis/pull/98) |
| Motion | SCP-013 · [`SYSTEMS-CHANGE-PACKET-013-MOTION.md`](./SYSTEMS-CHANGE-PACKET-013-MOTION.md) · [PR #97](https://github.com/bywale-com/travis/pull/97) |
| House | SCP-012 · `os_node` · [PR #93](https://github.com/bywale-com/travis/pull/93) |
| Busy room (lived) | `0e8875f8-283b-4dae-bf54-76c82a05b6ef` (title “Travis”) |

**Do not redo** 012, 013, or 062. They are on `main`.

---

## Planted on `main` (do not restart)

Newest first. Full sentences live on the README Implementation trail.

| Ref | PR | One line |
|-----|----|----------|
| 062 | [#98](https://github.com/bywale-com/travis/pull/98) | Hung `image` / `file` on the Log post |
| 013 | [#97](https://github.com/bywale-com/travis/pull/97) | `motion` + runner; Backlog All / In motion / Initiatives |
| 012 | [#93](https://github.com/bywale-com/travis/pull/93) | House `os_node` — `/protocols`, `/templates` |
| 061 | [#90](https://github.com/bywale-com/travis/pull/90) | Rooms list by last turn |
| 060–053 | [#89](https://github.com/bywale-com/travis/pull/89)–[#80](https://github.com/bywale-com/travis/pull/80) | Rooms feel, Live glue, rename, backlog plates, operator rooms/auth |
| 011 | [#82](https://github.com/bywale-com/travis/pull/82) | Cursor + GitHub integration status/options |
| 010–008 | [#79](https://github.com/bywale-com/travis/pull/79)–[#73](https://github.com/bywale-com/travis/pull/73) | Initiative store, title, `q`, hang files on the stamped post |
| 051 | [#70](https://github.com/bywale-com/travis/pull/70) | New wakes Travis; no Google body read |

Create-agent prompt is still the one-line stub. Do not paste a seat block at create (012 / envelope).

---

## Founder locks (keep)

- Rooms list = last conversation first (061).
- Backlog tickets are `open` \| `done` only. Next / Lit are derived.
- Create / in-the-room / seated stay **three moments**. Seated is still not orchestrated.
- Travis is system-wide Om Coda / OS. House-now = `os_node`. POSIX later. No computer use.
- Tool calling is ChatGPT / ElevenLabs-shaped JSON. The chat turn is not the work — 013 runner is.
- In motion **lives in Backlog**. Three views. Voice “N in motion” counts **only** Travis processes. **No product caps.**
- Seat posts do **not** Google-read. New wakes Travis, names the seat, never the body (051).
- Artifact kinds are `image` \| `file` only. Links and founder upload are **SA silence**. Out-of-ticket posts get nothing (009). 062 shows hung files on the Log.
- PM and SA have their own successor cuts: [PR #99](https://github.com/bywale-com/travis/pull/99) · [PR #100](https://github.com/bywale-com/travis/pull/100). Do not append their logs.

---

## Open / leftover (do not treat as the next plant)

Stale packet branches. Prefer `main` + pull refs. Do not re-plant what already landed.

| PR | What it is |
|----|------------|
| [#95](https://github.com/bywale-com/travis/pull/95) | Plates — In motion glance (PNGs) |
| [#96](https://github.com/bywale-com/travis/pull/96) · [#92](https://github.com/bywale-com/travis/pull/92) · [#76](https://github.com/bywale-com/travis/pull/76) | Leftover SA drafts of packets already on `main` |
| [#101](https://github.com/bywale-com/travis/pull/101) | This handoff |

---

## Specified but not clear (name; do not invent)

| Gap | Why it is blocked |
|-----|-------------------|
| Seated (agent → protocol) | Three moments stay separate. No `protocol_id`. Architecture not chosen. |
| POSIX / unfold into a work repo | House-now is `os_node`. 042 stands. |
| `link` / structured artifact kind · founder upload | SA named silence. |
| Heard-survives-refresh · 007 R2 Hear / Next / Skip · urgency tiers | SA. |
| Live image smoke for 062 | `turn_artifact` had **zero** rows when 062 landed. Needs one ticketed png in the Log before calling 062 lived. Ticket clip (title is wrong): `a5bca8b8-731f-40a0-9703-1b09b6306d90`. |

---

## Next Engineer job

1. Accept the seat from the paste below. Fetch `main`. Read **this file**, then [`ENGINEER.md`](../seats/ENGINEER.md), then `AGENTS.md`.
2. Do not restart 012 / 013 / 062. Do not mint a store. Do not append PM or SA logs.
3. Wait for the founder to name the next pocket. There is no parked “cousin” cut.
4. When **you** stop: rewrite the **Current** lines at the top of this file (where we stopped, last plant, next hotfix number) so the next bind does not start from a transcript.

---

## Paste — new Engineer

```text
You are Travis’s Engineer (full-stack implementer). Read docs/README.md “Engineer — identity” and accept it. Read repo-root AGENTS.md (always-on). You are not the Product Manager. You are not the Systems Analyst. Product face = voice/chat pipe (phone-first). Do not overwrite PHASE-ONE-LOG founder wording. Do not mint tables. Do not hard-code data into the SPA. Do not ship API keys to the client. Specified-and-clear: build it. Specified-but-blocked on PM or SA: name why; do not invent. Detailed: docs/seats/ENGINEER.md.

You are a NEW bind. The last Engineer was bc-94804572-3a2f-4075-b290-a95c73730bd3. They handed off. Read docs/register/ENGINEER-HANDOFF.md first.

Then, in order:
1. docs/register/ENGINEER-HANDOFF.md — where we stopped, planted, leftover, locks.
2. Root README.md Implementation trail (newest first).
3. docs/seats/ENGINEER.md · AGENTS.md.
4. docs/register/HOTFIX-062-THREAD-ARTIFACTS.md and SYSTEMS-CHANGE-PACKET-013-MOTION.md — last plants; do not redo.
5. Smoke on https://travis-psi.vercel.app — Voice / Log / Backlog.

Trail is git + PRs. Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG. Ask me what pocket we are in.
```
