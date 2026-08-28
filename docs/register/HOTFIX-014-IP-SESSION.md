# Hotfix 014 — Resume the live room by IP

**Number:** `014` — next engineer hotfix is `015`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer (founder: session persistency, for now sync to IP).  
**When:** 2026-08-28  
**PR title shape:** with 013.

---

## Why (smoke)

Refresh or leave Travis dropped the SPA session. The thread was still in Postgres. No login. Founder: key it to **IP** for now.

## Cut

1. `voice_session.client_ip` (existing table; not a user store).
2. `GET /api/session` (no id) returns this IP’s live (not ended) session, or null. Landing auto-resumes it and reloads turns.
3. `POST /api/session` resumes that live row if present; else creates one stamped with the IP.
4. **End session** still ends. Next visit is a new room.

Stand-in identity. Shared NAT = shared room. Not auth.

## Must-not

- Do not mint a user / account table.
- Do not ship `bc-…` or the IP to the SPA payload.
- Do not append PM/SA logs.

## Verify

1. Open session, send a line, refresh → same room, same log.
2. End session, refresh → landing; Open is a new room.
