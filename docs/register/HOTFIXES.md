# Engineer hotfixes — index

**Seat:** Engineer.  
**Law:** Ad-hoc work that starts from **lived smoke / code / backend grain** — not a PM face packet and not an SA systems change packet — is a **hotfix**. Numbered for traceability. Trail remains **git + PRs**; do not append PM or SA logs for the cut itself.

## Numbering

| Rule | Detail |
|------|--------|
| Format | `HOTFIX-NNN-SLUG.md` (three-digit, zero-padded) |
| Next | Always `max(existing NNN) + 1`. **Never reuse** a number. |
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
