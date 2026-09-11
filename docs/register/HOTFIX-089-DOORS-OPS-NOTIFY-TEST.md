# Hotfix 089 — Test sheet

**Hotfix:** [`HOTFIX-089-DOORS-OPS-NOTIFY.md`](./HOTFIX-089-DOORS-OPS-NOTIFY.md)  
**When:** 2026-09-11  
**PR title shape:** `Hotfix 089 — Notify the house on ops-red doors`

1. Walks red only on Cursor hard limit / unwired: no new `fail-look`. A GitHub issue opens (or the existing one is commented). Assignee is the house. Mail subject names the miss, not emerge.
2. Same miss again while that issue is open: comment the issue. No second mail. No `fail-look`.
3. Walks red on `Cannot use import` / Travis run error: `fail-look` still lands. No ops issue.
4. I saw: ________
