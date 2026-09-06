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

1. No cookie still **is** the preferred seeded operator when the desk is open. `/` shows `TravisApp`. `/api/rooms` and `requireOperator` succeed as that operator. Same rooms. Same `src/`.
2. Open when `TRAVIS_OPEN_DESK` is `1` / `true` / `yes`, **or** when the flag is unset on **Vercel production** (psi). That is the live screenshot source — not a drifting branch.
3. Closed when `TRAVIS_OPEN_DESK` is `0` / `false` / `off` / `no`. Preview and local stay 053 unless the flag is on.
4. `/enter/:token` and the login door **stay**. A real cookie still wins.
5. Do not mint a second app. Do not mint a plate-only host in git.

## Must-not

- Do not delete `travis.operator` or the enter link.
- Do not key rooms to IP (014 retired).
- Do not ship `CURSOR_API_KEY` or the login token to the client.
- Do not remint hang SQL, stream, or 010 plates.
- Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG for the plant.

## Verify

1. Local / preview, flag unset: no cookie → login door.
2. psi (production), flag unset: no cookie → Mode door / rooms / Room Travis. Voice and Log are the planted chrome.
3. `TRAVIS_OPEN_DESK=0` on production restores 053.
4. Founder’s `/enter/…` still works.
