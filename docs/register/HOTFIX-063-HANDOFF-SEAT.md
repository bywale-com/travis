# Hotfix 063 — Engineer handoff

**Number:** `063` — next engineer hotfix is `064`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (founder: update so a new Engineer picks up where this one stopped).  
**When:** 2026-09-03  
**PR title shape:** `Hotfix 063 — Engineer handoff`

---

## Why

PM and SA have successor files. The Engineer trail was git + PRs only. Orientation still said “docs stand-up only.” A new bind would start from a stale brief and a Cloud Agent transcript.

First cut of this PR misread the ask as a dispatch-to-PM/SA ritual. Founder corrected.

## Cut

- [`ENGINEER-HANDOFF.md`](./ENGINEER-HANDOFF.md) — Current: where we stopped, planted, leftover, locks, successor paste.
- `ENGINEER.md` § Handoff the seat — leave / take over. Rewrite the handoff file when you stop.
- `AGENTS.md`, `docs/README.md` What’s live, `PROJECT-BRIEF.md` — point at that file. No more “docs stand-up only.”

## Must-not

- Do not append the PM or SA logs.
- Do not mint a handoff table.
- Do not grow the create-agent stub.
- Do not auto-seed `os_node`.
- Do not plant PM→SA→Engineer auto-wake.
- Do not change `TRAVIS_SYSTEM` for this cut.

## Verify

`npm test`. A new Engineer who reads only `ENGINEER-HANDOFF.md` + `AGENTS.md` knows the last plant is 062, the next hotfix is 064, and 012 / 013 / 062 are not to be restarted.
