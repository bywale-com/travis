# Engineer hotfixes — index

**Seat:** Engineer.  
**Law:** Ad-hoc work that starts from **lived smoke / code / backend grain** — not a PM face packet and not an SA systems change packet — is a **hotfix**. Numbered for traceability. Trail remains **git + PRs**; do not append PM or SA logs for the cut itself.

## Numbering

| Rule | Detail |
|------|--------|
| Format | `HOTFIX-NNN-SLUG.md` (three-digit, zero-padded) |
| Next | Always `max(existing NNN) + 1`. **Never reuse** a number. Next: **025**. |
| PR title | Prefer `Hotfix NNN — …` so the remote trail reads engineer-originated |

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
| 018 | [`HOTFIX-018-GEMINI-MODELS.md`](./HOTFIX-018-GEMINI-MODELS.md) | Pin Gemini 3.6 text + 3.1 Live; 2.5 404 for new keys |
| 019 | [`HOTFIX-019-SPEECH-TEXT.md`](./HOTFIX-019-SPEECH-TEXT.md) | Fold STT restarts; absorb Live speech into one turn |
| 020 | [`HOTFIX-020-STT-EAR.md`](./HOTFIX-020-STT-EAR.md) | Ear restarts after mode switch; I’m done on Talk dest Travis |
| 021 | [`HOTFIX-021-STT-HOLD.md`](./HOTFIX-021-STT-HOLD.md) | Empty STT restart does not wipe the draft; Talk re-arms after Voice |
| 022 | [`HOTFIX-022-MIC-MODES.md`](./HOTFIX-022-MIC-MODES.md) | Voice has an ear after refresh; Talk/Type/Voice release the mic |
| 023 | [`HOTFIX-023-EAR-TTS.md`](./HOTFIX-023-EAR-TTS.md) | Dest Engineer Talk↔Voice keep one ear; TTS no longer leaves STT dead |
| 024 | [`HOTFIX-024-DONE-PHRASE.md`](./HOTFIX-024-DONE-PHRASE.md) | I'm done sends when the phrase never finalizes; readback stops abandoning the ear |
