# Hotfix 008 — Bind current PM / SA / Engineer in `agent_binding`

**Number:** `008` — next engineer hotfix is `009`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer. Founder: write SQL and seed the table; do not wait on Vercel env.  
**When:** 2026-08-27  
**PR title shape:** `Hotfix 008 — bind-seats SQL`

SQL: [`../../src/server/db/bind-seats.sql`](../../src/server/db/bind-seats.sql)

Run against the Travis `DATABASE_URL` (same Postgres as travis-psi). Then **End session → Open session**.
