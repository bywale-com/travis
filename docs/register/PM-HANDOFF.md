# Architect seat handoff — 2026-09-10 19:50 UTC

**This bind is living.** `bc-b64bcdbb-a2dd-43ad-9904-6a69af55be8a` is the Technical Architect until the founder pastes the successor block into a new chat. Do not write **This bind is done** until that handoff.

**Prior bind done:** `bc-25c5c6bf-006f-4252-9f25-49ab183835b2`.

**Flag:** PHASE-ONE-LOG **14:00 UTC 2026-08-25** — do not overwrite.

**Seat:** Technical Architect (was Technical PM — same seat, architecture added). Inspect `src/`. Spec face + technical cut + file-level architecture. Keep the log. Do not plant. Catalog `pm` is not this seat. Protocol `/protocols/pm.md`. Do not mint `/protocols/technical-pm.md` or `/protocols/technical-architect.md`.

**How we build:** [`docs/BUILD-PROTOCOL.md`](../BUILD-PROTOCOL.md). `npm test` is lib only. `test:runtime` is the E2E walk. GitHub Actions runs both after Vercel is ready. No emerge until all green.

---

## Where we stopped

| What | Where |
|------|--------|
| Trail | [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) — Current is **19:50 UTC 2026-09-10**. Flag **14:00 2026-08-25**. |
| 020 first plant | `src/lib/live-connect.ts` on [#165](https://github.com/bywale-com/travis/pull/165). In-flight waits. Unwired named. |
| 020 runtime verify | [`PM-PACKET-020-RUNTIME-VERIFY.md`](./PM-PACKET-020-RUNTIME-VERIFY.md). **`npm test` = lib. `test:runtime` = walks on the preview.** Action runs both. **Wake:** sa. SA **036**. |
| 019 stream architecture | [`PM-PACKET-019-STREAM-ARCH.md`](./PM-PACKET-019-STREAM-ARCH.md). SA **035**. [#163](https://github.com/bywale-com/travis/pull/163). |

---

## Next Architect job

1. SA 036 ascribes secrets, Playwright for glass + packet recording, Checks. Engineer hangs on this PR. Do not plant `src/` from this seat.
2. 019 first plant still stands on [#163](https://github.com/bywale-com/travis/pull/163). Do not remint.
3. Do not emerge on a red check. Do not attach a recording of every walk.
4. Do not remint 011–019 / 027–035.

---

## Must-not

- Do not overwrite the 14:00 flag.
- Do not plant `src/` except a deploy blocker already cut.
- Do not remint 011–019 / 027–035.
- Do not tell Engineer to invent a Travis orchestrator or a Travis telemetry table.
- Do not install Pipecat as Travis.
- Do not put Hear it / Skip buttons back.
- Do not farm a phone or inject a real microphone in 020.
- Do not turn Vercel Authentication off for the world so a test can get in.
- Do not let runtime tests resume the founder’s living room.
- Do not run four door POSTs in parallel on one session.
- Do not plant Gemini’s inverted glass.
- Do not label emerge while the Deployment Check is red.
