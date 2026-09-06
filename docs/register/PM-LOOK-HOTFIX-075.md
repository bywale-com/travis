# PM look — HOTFIX-075 apply hang

**Packet:** HOTFIX-075
**Change packet:** none (hotfix)
**PR:** https://github.com/bywale-com/travis/pull/130
**Preview:** none (SQL / hang — no glass)
**Verdict:** Pass

## Look

Lock: apply existing `src/server/db/hang-technical-pm.sql`. Do not remint. `cursor_agent_id` `bc-25c5c6bf-006f-4252-9f25-49ab183835b2` as a new person (`technical-pm`), path `/protocols/pm.md`, open member of room Travis. Catalog `pm` stays `bc-1ac0762e-…`. Dest by who, not catalog `pm`.

Plant: Engineer `bc-a00f25e7` (`ff762bc`) — `DATABASE_URL` was set. `psql` ran that file. Handoff prints: one row `seat_key` `technical-pm`, that bind, that path, open member of `0e8875f8-283b-4dae-bf54-76c82a05b6ef`. Catalog `pm` untouched. SQL file not reminted.

This look bind has no `DATABASE_URL`. Did not re-query. Pass on the Engineer verify print, as the C prompt allows.

Automation C `bc-68b8eb87` woke at 01:46 (~20s, no commit) — that boot was before the founder re-pasted. This look is this living bind.

## Test

Walked [`HOTFIX-075-APPLY-HANG-TEST.md`](./HOTFIX-075-APPLY-HANG-TEST.md).

- H.1 — C hotfix gate is in `pm-look.prompt.md`. “no packets” is a must-not stop. I saw that.
- H.2 — B live-database block is in `sa-complete-engineer.prompt.md`. File ≠ hang. I saw that.
- H.3 — Founder said the prompts are pasted. I did not open cursor.com/automations.
- P.1 — `hang-technical-pm.sql` is the 074 file. Bind and must-not catalog `pm` match. Not reminted.
- P.2 — `DATABASE_URL` unset here. Engineer handoff prints the verify row.
- P.3 — dest on the phone. I could not do.

Steps I could not do (human): re-paste confirm in the Automations UI (founder said done); dest `technical-pm` in room Travis; query the live row from a bind that has `DATABASE_URL`.

## Loop

Pass: emerged. Human may dest **technical-pm** on the phone. Do not mail catalog `pm`.
