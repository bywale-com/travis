# Engineer hotfixes — index

**Seat:** Engineer.  
**Law:** Ad-hoc work that starts from **lived smoke / code / backend grain** — not a PM face packet and not an SA systems change packet — is a **hotfix**. Numbered for traceability. Trail is **git + PRs + a README Implementation line**; do not append PM or SA logs for the cut itself.

## Numbering

| Rule | Detail |
|------|--------|
| Format | `HOTFIX-NNN-SLUG.md` (three-digit, zero-padded) |
| Next | Always `max(existing NNN) + 1`. **Never reuse** a number. Count open hotfix PRs, not only files on `main`. |
| PR title | Prefer `Hotfix NNN — …` so the remote trail reads engineer-originated |
| README | On completion, prepend one Implementation line (date · Hotfix NNN · PR — change because) |

## Hotfixes

| # | File | Cut |
|---|------|-----|
| 001 | [`HOTFIX-001-ASSISTANT-STREAM.md`](./HOTFIX-001-ASSISTANT-STREAM.md) | Stream assistant text + running status (PM pipe parity) |
| 002 | [`HOTFIX-002-ROOM-SMOKE.md`](./HOTFIX-002-ROOM-SMOKE.md) | Stream/STT dedupe, spoken call-by-name, plate look |
| 003 | [`HOTFIX-003-SEAT-BINDINGS.md`](./HOTFIX-003-SEAT-BINDINGS.md) | Bind PM / SA / Engineer cloud agent ids |
| 004 | [`HOTFIX-004-TURN-TAKING.md`](./HOTFIX-004-TURN-TAKING.md) | Addressing hint, quieter dead-man, STT resume after send |
| 005 | [`HOTFIX-005-STICKY-STRIP-STT.md`](./HOTFIX-005-STICKY-STRIP-STT.md) | Sticky thought strip, one STT restart after TTS, live-box growing-concat fold |
| 006 | [`HOTFIX-006-AGENT-BUSY.md`](./HOTFIX-006-AGENT-BUSY.md) | Retry `agent_busy` on the send port; do not post the SDK error as Eng |
| 007 | [`HOTFIX-007-LISTEN-OVERLAP.md`](./HOTFIX-007-LISTEN-OVERLAP.md) | Listen during an in-flight run; hold the next done-phrase |
| 008 | [`HOTFIX-008-BIND-SEATS-SQL.md`](./HOTFIX-008-BIND-SEATS-SQL.md) | SQL to bind current PM / SA / Engineer on `agent_binding` |
| 009 | [`HOTFIX-009-STT-ROUTE-QUOTE.md`](./HOTFIX-009-STT-ROUTE-QUOTE.md) | STT carry across pause; stale busy ≠ queue; quote rail; rebind PM |
| 010 | [`HOTFIX-010-VOCATIVE-ROUTE.md`](./HOTFIX-010-VOCATIVE-ROUTE.md) | `hey engineer` / trailing seat name switches addressee |
| 011 | [`HOTFIX-011-COMPOSER-SEND.md`](./HOTFIX-011-COMPOSER-SEND.md) | Type send clears immediately; log paints now; composer stays free |
| 012 | [`HOTFIX-012-TALK-PAUSE-CLEAR.md`](./HOTFIX-012-TALK-PAUSE-CLEAR.md) | Talk pause/resume; clear accumulated draft in Talk and voice |
| 013 | [`HOTFIX-013-SENTENCE-TTS.md`](./HOTFIX-013-SENTENCE-TTS.md) | Voice reads assistant sentences as they land, not one dump at done |
| 014 | [`HOTFIX-014-IP-SESSION.md`](./HOTFIX-014-IP-SESSION.md) | Resume the live room by client IP; End still ends |
| 015 | open — [PR #26](https://github.com/bywale-com/travis/pull/26) (`HOTFIX-015-STT-DUP.md` on that branch) | Fold long STT restarts; skip re-read leftovers |
| 016 | [`HOTFIX-016-README-TRAIL.md`](./HOTFIX-016-README-TRAIL.md) | README Implementation trail + Engineer seat prompt |
