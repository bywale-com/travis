# Test spec — 075 Apply hang / prompt recut

**Hotfix:** [`HOTFIX-075-APPLY-HANG.md`](./HOTFIX-075-APPLY-HANG.md)  
**Generally:** a hotfix test is **scoped to that hotfix**.

Fill **I saw** on this step before the next.

---

## Before you start

**Where.** This is a SQL hang. There is no glass preview for the plant. Query the live Travis Postgres if `DATABASE_URL` is set. Dest check is on production psi (or the preview if this PR is what psi runs).

**URL I opened (dest, human):**

**Device:**

**Room:** Travis (`0e8875f8-283b-4dae-bf54-76c82a05b6ef`)

---

# House — prompts (cloud agent can do)

### H.1 C does not require a packet

**Do:** Open [`house-now/automations/pm-look.prompt.md`](./house-now/automations/pm-look.prompt.md). Find the hotfix gate.

**Expect:** A `HOTFIX-NNN` on the PR is enough. The words “no packets” / “no PM packet” are a must-not stop, not a gate.

**I saw:**

### H.2 B does not treat a file as planted

**Do:** Open [`house-now/automations/sa-complete-engineer.prompt.md`](./house-now/automations/sa-complete-engineer.prompt.md). Find live database.

**Expect:** Planted = live effect. `DATABASE_URL` unset → stop and name it. Set → run the existing SQL. Do not remint `hang-technical-pm.sql`.

**I saw:**

### H.3 Human re-paste (human)

**Do:** At [cursor.com/automations](https://cursor.com/automations), paste C (`ff94a777-…`) and B (`e89c2975-…`) from those files. Save + Activate. This seat cannot.

**Expect:** Live prompt matches the repo.

**I saw:**

**Steps I could not do (human):** re-paste C and B.

---

# Plant — hang

### P.1 SQL file is the 074 file

**Do:** `git log --oneline -- src/server/db/hang-technical-pm.sql` and read the file header.

**Expect:** Same file. Bind `bc-25c5c6bf-006f-4252-9f25-49ab183835b2`. Not reminted. Not catalog `pm`.

**I saw:**

### P.2 Live row

**Do:** If `DATABASE_URL` is set, run the verify `SELECT` at the bottom of that SQL. Do not echo the URL.

**Expect:** One row, that `cursor_agent_id`, path `/protocols/pm.md`, open member of room Travis. Catalog `pm` still `bc-1ac0762e-…`.

**If unset:** write “DATABASE_URL unset — could not query.” Do not Pass the hang.

**I saw:**

### P.3 Dest by who (human)

**Do:** In room Travis, dest **technical-pm** (or `technical-pm-2` if that is the slug). Do not dest catalog `pm`.

**Expect:** This living Technical PM bind is who answers.

**I saw:**

**Steps I could not do (human):** dest on the phone.
