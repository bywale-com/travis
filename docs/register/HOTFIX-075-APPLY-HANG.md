# Hotfix 075 — Apply the hang; prompts recut

**Number:** `075` — next engineer hotfix is `076`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (plant) · Technical PM (prompt recut, already on this PR).  
**When:** 2026-09-06  
**PR title shape:** `Hotfix 074 — skip SA, hang this bind` (this PR). Do not retitle.

---

## Why

074 planted [`src/server/db/hang-technical-pm.sql`](../../src/server/db/hang-technical-pm.sql). The live row did not apply — that Engineer had no `DATABASE_URL`. Look no-op’d — live C still gated on a PM packet.

Founder: update the prompts first, then try the hang again.

## Cut — house (this PR, already written)

1. **C** [`house-now/automations/pm-look.prompt.md`](./house-now/automations/pm-look.prompt.md) — a `HOTFIX-NNN` on the PR is enough. No packet. Do not stop “no packets.” SQL/hang look has no glass.
2. **B** [`house-now/automations/sa-complete-engineer.prompt.md`](./house-now/automations/sa-complete-engineer.prompt.md) — planted = the live effect. File ≠ hang. `DATABASE_URL` unset → stop and name it. Set → run the existing SQL. Do not remint.
3. Action: look also wakes when this push rewrites `ENGINEER-HANDOFF.md` on a hotfix PR. Emerge on `PM-LOOK-HOTFIX-NNN` Pass attaches `HOTFIX-NNN-*-TEST.md`.

**Human:** re-paste C and B at [cursor.com/automations](https://cursor.com/automations). This seat cannot Save + Activate. Live paste is what boots.

## Cut — Engineer plant

Do **not** remint `hang-technical-pm.sql`.

1. `test -n "$DATABASE_URL"` — do not echo the value.
2. Unset: stop. One line on `ENGINEER-HANDOFF.md`: this environment still has no `DATABASE_URL` runtime secret. Not planted.
3. Set: `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f src/server/db/hang-technical-pm.sql`
4. Verify query in that file: one row, `cursor_agent_id` = `bc-25c5c6bf-006f-4252-9f25-49ab183835b2`, `protocol_path` `/protocols/pm.md`, open member of `0e8875f8-283b-4dae-bf54-76c82a05b6ef`. Catalog `pm` still `bc-1ac0762e-…`. Dest **by who** (`technical-pm`). Do not mail catalog `pm`.

## Must-not

- Do not overwrite catalog `pm`. Do not put a `bc-` in `migrate.ts` or the client.
- Do not remint the SQL. Do not mint a table. Do not plant a hang tool.
- Do not write a PM packet. Do not wake SA. Do not open a cousin PR.
- Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.

## Verify

Same as 074 verify: the row, the path, the open membership, catalog `pm` untouched.

## Out of scope

- Travis hang tool (later, his).
- Seat health.
- Remint 009 / 025. Packet 010 is not cut.
