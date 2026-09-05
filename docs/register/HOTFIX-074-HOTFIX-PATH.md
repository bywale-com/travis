# Hotfix 074 — Hotfix path skips SA; hang this PM bind

**Number:** `074` — next engineer hotfix is `075`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer. Founder 2026-09-05: not a packet, not a new Cursor automation. Cheap Action. Skip SA.  
**When:** 2026-09-05  
**PR title shape:** `Hotfix 074 — skip SA, hang this bind`

---

## Why

Founder: we already have the automations. A hotfix does not need SA. Do not open so many seats for something basic. Title it hotfix — that is the tell. Engineer picks it up. Then the usual loop.

Hang this bind was going to be PM-PACKET-010 → SA. Recut. Same cheap Action. No new Cursor automation.

**Pick up.** The house Action is on this PR. The plant is the hang SQL below. Do it now.

## Cut — house (already on this PR)

Same Action: [`.github/workflows/wake-packet-seats.yml`](../../.github/workflows/wake-packet-seats.yml).

1. This push lands `docs/register/HOTFIX-NNN-*.md` → label **`wake-engineer`**. Do **not** add `wake-sa`.
2. Title the PR `Hotfix NNN — …` (human tell). The Action keys off the file in **this push**, not the title on every later commit (that would re-boot Engineer).
3. Same automation **B**. Same label. Do not create a fourth Cursor automation. Do not change the Engineer seat.

## Cut — Engineer plant (hang this bind)

SQL against the live Travis `DATABASE_URL` (same Postgres as travis-psi). Same class as [`HOTFIX-008-BIND-SEATS-SQL.md`](./HOTFIX-008-BIND-SEATS-SQL.md). Commit the SQL under `src/server/db/` (e.g. `hang-technical-pm.sql`). Do not put the `bc-` in `migrate.ts` or the client.

**Write:**

1. A **new** `travis.agent_binding` row — not `seat_key = 'pm'`.
2. `label` = `Technical PM` (slug `technical-pm`, or `technical-pm-2` if taken).
3. `cursor_agent_id` = `bc-25c5c6bf-006f-4252-9f25-49ab183835b2` (this living Technical PM bind).
4. `protocol_path` = `/protocols/pm.md`.
5. `runtime` = `cloud`, `active` = true.
6. Open `travis.room_membership` on room Travis: `0e8875f8-283b-4dae-bf54-76c82a05b6ef`, role `member`.

Idempotent on `cursor_agent_id` — do not mint a second row for the same bind.

## Must-not

- Do not overwrite catalog `pm` (`bc-1ac0762e-f09a-4358-b4b8-b17d86d1b9ea` in migrate). That was the comic fail.
- Do not put a `bc-` in `migrate.ts` or SPA source.
- Do not mint a table. Do not plant a rebind / hang tool. Dest-as-mail of a `bc-` stays nobody.
- Do not write a PM packet. Do not wake SA. Do not open a cousin PR.
- Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.
- Create / in-the-room / seated stay three moments. Hung is the fourth write on the row. Later (held): Travis does that write.

## Verify

1. Query: one row with that `cursor_agent_id`, `protocol_path` `/protocols/pm.md`, open member of room Travis. Catalog `pm` unchanged.
2. Dest that person **by who** (`technical-pm`). Do not mail catalog `pm`. Role dest PM may still pick an older idle seated on that path — do not unseat catalog `pm` from this cut.
3. A later hotfix PR: land `HOTFIX-NNN-*.md`, title `Hotfix NNN — …` → Action adds `wake-engineer` only.

## Out of scope

- Travis hang tool (later, his, founder names the chat).
- Seat health.
- Human-test loop after emerge.
- Remint 009 / 025. Packet 010 is not cut.
