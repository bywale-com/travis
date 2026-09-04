# Engineer hotfixes — index

**Seat:** Engineer.  
**Law:** Ad-hoc work that starts from **lived smoke / code / backend grain** — not a PM face packet and not an SA systems change packet — is a **hotfix**. Numbered for traceability. Trail remains **git + PRs**; do not append PM or SA logs for the cut itself.

## Numbering

| Rule | Detail |
|------|--------|
| Format | `HOTFIX-NNN-SLUG.md` (three-digit, zero-padded) |
| Next | Always `max(existing NNN) + 1`. **Never reuse** a number. Next: **071**. |
| PR title | Prefer `Hotfix NNN — …` so the remote trail reads engineer-originated |

## Hotfixes

| # | File | Cut |
|---|------|-----|
| 070 | [`HOTFIX-070-GLANCE-TRUTH.md`](./HOTFIX-070-GLANCE-TRUTH.md) | Check-narration drops from the window; glance marks no seat post; a miss is not a cousin |
| 069 | [`HOTFIX-069-HAND-TRUTH.md`](./HOTFIX-069-HAND-TRUTH.md) | Receipt is the send; ticket-scoped SA read; Here names when no seat is running |
| 068 | [`HOTFIX-068-BACKLOG-WINDOW.md`](./HOTFIX-068-BACKLOG-WINDOW.md) | Open backlog titles ride in the room window; a search miss is not an empty pile |
| 067 | [`HOTFIX-067-HOUSE-BUILD.md`](./HOTFIX-067-HOUSE-BUILD.md) | House refile script is not part of `next build` |
| 066 | [`HOTFIX-066-PR-CLEANUP.md`](./HOTFIX-066-PR-CLEANUP.md) | One-PR trail in house + leftover docs; 003–007 on `main`; cousins close |
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
| 025 | [`HOTFIX-025-SEND-DURING-RUN.md`](./HOTFIX-025-SEND-DURING-RUN.md) | Revert 024's busy guard — a turn must reach the server while a seat works |
| 026 | [`HOTFIX-026-JSON-ERRORS.md`](./HOTFIX-026-JSON-ERRORS.md) | Lazy DB connect + JSON error bodies so a failure names its own cause |
| 028 | [`HOTFIX-028-STT-NETWORK-HOLD.md`](./HOTFIX-028-STT-NETWORK-HOLD.md) | Network STT hitch must not wipe the draft already heard |
| 029 | [`HOTFIX-029-OPENAI-TRAVIS.md`](./HOTFIX-029-OPENAI-TRAVIS.md) | Dest Travis brain/mouth is OpenAI Realtime + text, not Gemini |
| 030 | [`HOTFIX-030-QUEUE-SEND-SOUNDS.md`](./HOTFIX-030-QUEUE-SEND-SOUNDS.md) | Drain a stuck queue when Cursor is idle; hold live posts; swoosh on send, cue on queued |
| 031 | [`HOTFIX-031-AUDIBLE-SEND-SOUNDS.md`](./HOTFIX-031-AUDIBLE-SEND-SOUNDS.md) | Send swoosh and queue cue actually play on the phone |
| 032 | [`HOTFIX-032-HARVEST-DEAD-STREAM.md`](./HOTFIX-032-HARVEST-DEAD-STREAM.md) | When the Cursor SSE dies, pull the finished run into the log and drop “is still running” |
| 033 | [`HOTFIX-033-TRAVIS-DRAFT-WIPE.md`](./HOTFIX-033-TRAVIS-DRAFT-WIPE.md) | Saying Travis in Talk must not wipe the draft |
| 034 | [`HOTFIX-034-MALE-VOICE.md`](./HOTFIX-034-MALE-VOICE.md) | Male mouth when the engine has one — cedar on Live, named male on readback |
| 035 | [`HOTFIX-035-THREAD-SCROLL-PIN.md`](./HOTFIX-035-THREAD-SCROLL-PIN.md) | The log holds still when you scroll up to read |
| 036 | [`HOTFIX-036-VOCATIVE-LIVE-ARM.md`](./HOTFIX-036-VOCATIVE-LIVE-ARM.md) | Saying Travis in Voice actually hands the ear to Live |
| 037 | [`HOTFIX-037-TRUTHFUL-TOOL-RECEIPTS.md`](./HOTFIX-037-TRUTHFUL-TOOL-RECEIPTS.md) | Tools tell Travis it blocked, how long, and what is in flight |
| 038 | [`HOTFIX-038-TRAVIS-LOOKS-AT-ROOM.md`](./HOTFIX-038-TRAVIS-LOOKS-AT-ROOM.md) | Travis is handed a bounded room window and can read a seat's reply |
| 039 | [`HOTFIX-039-DISPATCH-AND-LEAVE.md`](./HOTFIX-039-DISPATCH-AND-LEAVE.md) | dispatch_to_seat returns when the run starts, so fan-out and the queue are real |
| 040 | [`HOTFIX-040-TOOL-POLICY.md`](./HOTFIX-040-TOOL-POLICY.md) | A written definition of safe: tool classes, fail-closed, asserted coverage |
| 041 | [`HOTFIX-041-TOOL-NARRATION.md`](./HOTFIX-041-TOOL-NARRATION.md) | Travis says what it is about to do, in the log, never aloud |
| 042 | [`HOTFIX-042-CAPABILITY-BOUNDARY.md`](./HOTFIX-042-CAPABILITY-BOUNDARY.md) | Travis is told it cannot see the repo, a diff, tests or CI |
| 043 | [`HOTFIX-043-RETURN-TO-VOICE-LIVE.md`](./HOTFIX-043-RETURN-TO-VOICE-LIVE.md) | Coming back to Voice re-arms Live instead of keeping the recognizer |
| 044 | [`HOTFIX-044-VISUAL-LAW.md`](./HOTFIX-044-VISUAL-LAW.md) | Mission/Carbon tokens, Orbitron wordmark, unbounded seat marks, receipt and error kinds |
| 045 | [`HOTFIX-045-DB-POOL.md`](./HOTFIX-045-DB-POOL.md) | One DB client per isolate; return it when idle; membership DDL once |
| 046 | [`HOTFIX-046-VOICE-SEND-SOUNDS.md`](./HOTFIX-046-VOICE-SEND-SOUNDS.md) | Voice stays quiet on send/queue; Talk and Type still play the shots |
| 047 | [`HOTFIX-047-READBACK-VOICE.md`](./HOTFIX-047-READBACK-VOICE.md) | Rank network/natural Google readback; lift rate; no Cloud TTS port |
| 048 | [`HOTFIX-048-REQUEST-LOG.md`](./HOTFIX-048-REQUEST-LOG.md) | Same-room request log Travis can search; founder door; no new table |
| 049 | [`HOTFIX-049-SEARCH-GRAIN.md`](./HOTFIX-049-SEARCH-GRAIN.md) | search_room last-N / today / last 7 days; same door words |
| 051 | [`HOTFIX-051-NEW-WAKE.md`](./HOTFIX-051-NEW-WAKE.md) | Seat land is New; Travis wakes; no Google body read |
| 052 | [`HOTFIX-052-INITIATIVE-STORE.md`](./HOTFIX-052-INITIATIVE-STORE.md) | 008 columns land on first send; no manual db:push |
| 053 | [`HOTFIX-053-OPERATOR-AUTH.md`](./HOTFIX-053-OPERATOR-AUTH.md) | Allowlisted email + durable personal login link; rooms leave IP |
| 054 | [`HOTFIX-054-MAGIC-LINK-MAIL.md`](./HOTFIX-054-MAGIC-LINK-MAIL.md) | Magic link logs + honest 503 when Resend fails; quiet ok for unknown email |
| 055 | [`HOTFIX-055-ROOM-OWNER.md`](./HOTFIX-055-ROOM-OWNER.md) | Existing rooms hang on truthist00@gmail.com, not the oldest operator |
| 056 | [`HOTFIX-056-SHARED-OPERATOR-ROOMS.md`](./HOTFIX-056-SHARED-OPERATOR-ROOMS.md) | Seeded inboxes share one room pile |
| 057 | [`HOTFIX-057-BACKLOG-PLATES.md`](./HOTFIX-057-BACKLOG-PLATES.md) | Backlog index, ticket Messages/Artifacts, hold sheet, mark as a door |
| 058 | [`HOTFIX-058-RENAME-ROOM.md`](./HOTFIX-058-RENAME-ROOM.md) | Founder and Travis can rename a room; same title field |
| 059 | [`HOTFIX-059-TRAVIS-LIVE-GLUE.md`](./HOTFIX-059-TRAVIS-LIVE-GLUE.md) | Live Travis posts one utterance; window keeps the last line |
| 060 | [`HOTFIX-060-ROOMS-FEEL-FAST.md`](./HOTFIX-060-ROOMS-FEEL-FAST.md) | One query for the room index; loading copy; no per-delta turn refetch |
| 061 | [`HOTFIX-061-ROOMS-BY-LAST.md`](./HOTFIX-061-ROOMS-BY-LAST.md) | Index ordered by last turn, not created |
| 062 | [`HOTFIX-062-THREAD-ARTIFACTS.md`](./HOTFIX-062-THREAD-ARTIFACTS.md) | Hung images and files appear on the Log post, not only the ticket door |
| 063 | [`HOTFIX-063-HANDOFF-SEAT.md`](./HOTFIX-063-HANDOFF-SEAT.md) | Engineer Current so a new bind picks up (`ENGINEER-HANDOFF.md`) |
| 064 | [`HOTFIX-064-DEST-ARTIFACTS.md`](./HOTFIX-064-DEST-ARTIFACTS.md) | Dest-seat hang; rich type; thought on the roster circle |
| 065 | [`HOTFIX-065-ONE-PR.md`](./HOTFIX-065-ONE-PR.md) | One PR per initiative; seats share it; initiative folders |
