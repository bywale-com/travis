# Hotfix 081 — Voice uses the Type hang

**Number:** `081` — next engineer hotfix is `082`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer. Founder lock: Voice is not parked. Apply what exists (Deep Agents on Type) onto Voice.  
**When:** 2026-09-07  
**PR title shape:** `Hotfix 081 — Voice uses the Type hang`  
**Test:** [`HOTFIX-081-VOICE-DEEP-AGENTS-TEST.md`](./HOTFIX-081-VOICE-DEEP-AGENTS-TEST.md)

---

## Why

031 hung Deep Agents on Log · Type. The founder has been smoking Voice (Live). That mouth was still the Realtime model: it searched the room because we told it to, and it never ran the Type hang. Voice is not parked.

## Cut

1. A spoken line to Travis on Live runs `pipeTravisText` → `generateTravisText` → `invokeDeepAgent`. Same hang as Type. Dest grain is not reminted.
2. Live Realtime keeps the ear and the mouth. It does not get Travis tools. It does not think the turn. After the user line lands, cancel the Realtime response. Speak the harness reply with the existing notify path.
3. A spoken dest to a Cursor seat stays on today’s live transcript leave. A vocative-only switch still stops Live.

## Must-not

- Do not remint 031 dest-with-context grain or dest-gate.
- Do not hang Deep Agents `task` / subagent dest.
- Do not put Hear it / Skip buttons back.
- Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.

## Verify

Sheet: [`HOTFIX-081-VOICE-DEEP-AGENTS-TEST.md`](./HOTFIX-081-VOICE-DEEP-AGENTS-TEST.md). Live Travis app. Voice. A real spoken line to Travis is a Deep Agents `agent_post`, not a Realtime search-then-talk.
