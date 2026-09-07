# Hotfix 079 — Talk banner ate HTML as JSON

**Number:** `079` — next engineer hotfix is `080`. Never reuse. Index: [`HOTFIXES.md`](./HOTFIXES.md).  
**Seat:** Engineer. Lived smoke after [#147](https://github.com/bywale-com/travis/pull/147) merged (014 Deep Agents on `main`).  
**When:** 2026-09-07  
**PR title shape:** `Hotfix 079 — Talk HTML as JSON`  
**Test:** [`HOTFIX-079-TALK-HTML-JSON-TEST.md`](./HOTFIX-079-TALK-HTML-JSON-TEST.md)

---

## Why

Founder screenshot, Log · Talk, Carbon: Listening · Clear · Pause. Orange banner:

`Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

That is the phone parsing an **HTML page** as JSON. Not Stream. Not dest jargon.

Talk finalize (and Type send) still call raw `res.json()` when the answer is not an event-stream. `readJson` already exists so this banner never says that.

014 is on psi now. Talk to Travis still runs `pipeTravisText` → `generateTravisText` → `createDeepAgent`. An uncaught throw **before** SSE headers (module load, or POST throw) is a Next/Vercel HTML 500 — same banner.

## Cut

1. **Banner.** Non-SSE responses on Talk finalize, Type `/send`, and VoiceSession finalize use `readJson` (`src/lib/http.ts`). Catch still sets the banner. The line must name status / that it was not JSON — never `Unexpected token '<'`.
2. **SSE parse.** `consumeAgentStream` / VoiceSession `JSON.parse(raw)` must not dump that parser string onto the banner if a chunk is not JSON.
3. **The HTML.** Find why POST `/api/session/:id/finalize` or `/send` returned HTML after 014. Vercel runtime log for that 500 / function load. If Deep Agents import or invoke dies before SSE starts, catch and return JSON or SSE error — do not let Next render `<!DOCTYPE`. Keep dest-with-context grain. Do not remint 030. Do not unclip Here. If the hang needs `maxDuration` on finalize/send (Hobby cap is 60), set **60**, same as the room wire.

## Must-not

- Do not remint 014 / 030 / dest-with-context grain.
- Do not put Hear it / Skip buttons back.
- Do not append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.
- Do not treat emerge as this cut.

## Verify

Sheet: [`HOTFIX-079-TALK-HTML-JSON-TEST.md`](./HOTFIX-079-TALK-HTML-JSON-TEST.md). Psi Log · Talk. Banner never shows `Unexpected token '<'`. A real 500 names the failure. A good Talk line still sends.
