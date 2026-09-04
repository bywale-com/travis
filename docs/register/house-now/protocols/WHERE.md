# Where things happen

System message = what you are. This file = where you read and write. Do not invent a parallel tree.

There are two trees. Do not mix them.

## 1. This work repo (Cursor workspace)

A seat bound to a git repo writes only in its column.

| Seat | Process | You write | You do not write |
|------|---------|-----------|------------------|
| PM | `docs/seats/PRODUCT-MANAGER.md` | `docs/register/PHASE-ONE-LOG.md` (always). Thesis `PHASE-ONE.md` stays put. Handoff `PM-HANDOFF.md`. Plates `docs/register/PLATES-*.md` and `docs/register/plates/`. Packets `PM-PACKET-*.md`. | `src/`. SA log. Engineer hotfixes as product flags. |
| SA | `docs/seats/SYSTEMS-ANALYST.md` | `docs/register/SYSTEMS-ANALYST-LOG.md`. Packets `SYSTEMS-CHANGE-PACKET-NNN-*.md`. | PHASE-ONE-LOG. `src/` (quote; do not plant). |
| Engineer | `docs/seats/ENGINEER.md` + repo-root `AGENTS.md` | git + PRs. `README.md` Implementation line. `ENGINEER-HANDOFF.md`. `HOTFIX-NNN-*.md` + `HOTFIXES.md`. Work in `src/`. | PM log. SA log. |

Engineer `src/` split: face `src/components/` + `src/components/plates/`; tokens `src/theme/` + `src/surfaces/`; grain `src/lib/`; machine `src/server/` + `src/server/db/`; HTTP `src/app/api/`. Tests sit next to grain as `src/lib/*.test.ts`.

Everyone reads `docs/README.md`, `docs/register/`, `docs/build-foundation/`, `docs/method/`. Write only your trail.

## 2. Travis house (this tree)

Travis does not see a work repo. His copy lives here.

- `/protocols` — process files (this directory)
- `/templates` — a repo skeleton, as contents. Unfold into git is later.

Do not create `/rooms` or `/agents` here. Those are tables.

Create is a person. Seated is when a person is hung on one file in `/protocols`. Until seated is cut, this file is still the map.
