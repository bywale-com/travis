# Hotfix 089 — Notify the house on ops-red doors

**Number:** `089` — next engineer hotfix is `090`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer.  
**When:** 2026-09-11  
**PR title shape:** `Hotfix 089 — Notify the house on ops-red doors`  
**Test:** [`HOTFIX-089-DOORS-OPS-NOTIFY-TEST.md`](./HOTFIX-089-DOORS-OPS-NOTIFY-TEST.md)

## Why

088 left `runtime-doors` red on Cursor hard limit / unwired and skipped `fail-look`. That stopped the B loop. It did not tell the team. A silent red check is not the house.

Cause is still founder ops. Engineer cannot recut `$2` or a missing `OPENAI_API_KEY`. Gap is notification, not another Engineer spin.

## Cut

1. `runtime-doors.yml` — on that ops miss: open (or comment) a GitHub issue with the cause and the house move, assign `bywale-com`, comment the open PR once when the issue is new, mail `EMERGE_EMAIL` with an honest subject. Do not `fail-look`. Do not use the emerge subject (`ops emerged — walk this sheet`).
2. `.github/scripts/send-runtime-doors-letter.py` — same Resend secrets as emerge; subject is the miss.
3. Same open issue is the living thread. Later red walks comment it. They do not mail again.

`repository_dispatch` runs the workflow on `main`. Live after merge.
