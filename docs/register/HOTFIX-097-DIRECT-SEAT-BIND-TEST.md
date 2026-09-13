# Hotfix 097 — Test sheet

**Hotfix:** [`HOTFIX-097-DIRECT-SEAT-BIND.md`](./HOTFIX-097-DIRECT-SEAT-BIND.md)  
**When:** 2026-09-13  
**PR title shape:** `Hotfix 097 — direct seat binding without mandatory protocol prompt`

## Smoke

1. `npm test` passes — asserts seat aliasing and direct binding without protocol prompt.
2. Direct bind call to `bind_agent` with `{ label: "Architect", cursor_agent_id: "bc-…", join: true }` succeeds immediately without calling `sit_agent` or dispatching prompts to Cursor.
3. Roster shows the bound agent as an active member in the room without `protocol_path` errors.
4. Spoken or typed requests to "Architect" route cleanly to the bound agent.
5. Voice or Type: `Engineer, put this on the notes: stream-arch cue.` — the line lands on notes; dest-on-transcript / stream-arch behavior still matches [`HOTFIX-091-STREAM-ARCH-WALK-TEST.md`](./HOTFIX-091-STREAM-ARCH-WALK-TEST.md) (leave starts before I’m done).
6. I saw: ________
