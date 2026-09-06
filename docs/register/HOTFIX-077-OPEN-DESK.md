# Hotfix 077 — Open desk for plates (login door stays)

**Number:** `077` — next engineer hotfix is `078`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer. Founder: turn off login without breaking everything, or a no-login source that **mirrors the live app** so agents can screenshot.  
**When:** 2026-09-06  
**PR title shape:** `Hotfix 077 — open desk for plates`  
**Test:** [`HOTFIX-077-OPEN-DESK-TEST.md`](./HOTFIX-077-OPEN-DESK-TEST.md)

---

## Why this is a hotfix

053 login (allowlisted email + `/enter/:token`) is the wall. Plate chrome rule needs a **photo of the live desk**. A cousin HTML studio drifts. A long-lived “no login” git branch drifts. The live app is psi. Skip SA. No new store. No new face.

## Cut

1. `TRAVIS_OPEN_DESK=1` (or `true` / `yes`) → no cookie still **is** the preferred seeded operator. `/` shows `TravisApp`. `/api/rooms` and the rest of `requireOperator` succeed as that operator. Same rooms. Same `src/`.
2. Flag **off** (unset / `0`) → 053 unchanged. No cookie → login door. `/api/rooms` → 401.
3. `/enter/:token` and the login door **stay**. A real cookie still wins over the flag.
4. Do not mint a second app. Do not mint a plate-only host in git. Production psi **is** the mirror when the flag is on.

## Must-not

- Do not delete `travis.operator` or the enter link.
- Do not key rooms to IP (014 retired).
- Do not ship `CURSOR_API_KEY` or the login token to the client.
- Do not remint hang SQL, stream, or 010 plates.
- Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG for the plant.

## Verify

1. Flag off: no cookie → login door. Unknown email still quiet.
2. Flag on: no cookie → Mode door / room index / Room Travis. Voice and Log are the planted chrome.
3. Founder’s `/enter/…` still works.
