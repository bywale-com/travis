# travis

## Implementation

Newest first. On completion of a packet or hotfix the Engineer **prepends** one line: date · ref · PR — the change, because. One sentence. Not an essay.

- **2026-09-01** · Hotfix 033 · [PR #48](https://github.com/bywale-com/travis/pull/48) — Saying Travis in Talk keeps what you already said, because the vocative-off-Live path always cleared the draft and treated a trailing name as switch-only.
- **2026-09-01** · Hotfix 032 · [PR #47](https://github.com/bywale-com/travis/pull/47) — When a seat finishes in Cursor after Travis’s stream dies, the log still gets the post and stops saying they are running, because the serverless SSE ended before any `post_delta` and the leftover live-run never harvested that run.
- **2026-09-01** · Hotfix 031 · [PR #46](https://github.com/bywale-com/travis/pull/46) — You hear a whoosh when a turn sends and two notes when it queues, because 030’s Web Audio ran after the SSE and the phone muted it.
- **2026-09-01** · Hotfix 030 · [PR #45](https://github.com/bywale-com/travis/pull/45) — A follow-up queued while a seat is working sends once Cursor is idle, live posts survive a dropped stream, and you hear a swoosh on send or a cue when it queues, because drain only ran at SSE-end and posts lived only in the phone until done.
- **2026-09-01** · Hotfix 029 · [PR #44](https://github.com/bywale-com/travis/pull/44) — Dest Travis talks on OpenAI Realtime and text, because the Gemini pin was a provider choice, not a room law.
- **2026-08-31** · Hotfix 028 · [PR #43](https://github.com/bywale-com/travis/pull/43) — A `STT: Network` hitch no longer wipes what you already said, because Chrome’s leftover fragment was replacing the whole draft.
- **2026-08-31** · Hotfix 026 · [PR #41](https://github.com/bywale-com/travis/pull/41) — A failed Open session now names its own cause instead of “Unexpected end of JSON input”, because the DB threw at import where no route could catch it and every reply came back empty.
- **2026-08-31** · Hotfix 025 · [PR #40](https://github.com/bywale-com/travis/pull/40) — You can send again while a seat is still working, and `engineer …` stops landing on PM, because 024’s busy guard swallowed every turn for the length of a run.
- **2026-08-31** · Hotfix 024 · [PR #39](https://github.com/bywale-com/travis/pull/39) — I’m done sends even when Web Speech never finalizes the phrase, and a long readback no longer abandons the ear, because the live gate held interim text that `onend` never re-checked.
- **2026-08-31** · Hotfix 023 · [PR #38](https://github.com/bywale-com/travis/pull/38) — Dest Engineer Talk and Voice keep one ear and capture comes back after a read, because abort-on-switch and TTS onend were leaving Chrome STT dead.
- **2026-08-31** · Hotfix 022 · [PR #37](https://github.com/bywale-com/travis/pull/37) — Voice hears you after a refresh and Talk/Type/Voice no longer steal the mic from each other, because dest-Travis Voice disabled Web Speech while Live never got the device.
- **2026-08-31** · Hotfix 021 · [PR #36](https://github.com/bywale-com/travis/pull/36) — A short pause no longer wipes what you said, and Voice↔Talk starts the ear again without a refresh, because empty Web Speech restarts cleared the draft and abort left capture armed-but-dead.
- **2026-08-30** · Hotfix 020 · [PR #35](https://github.com/bywale-com/travis/pull/35) — I’m done sends on Talk again and the ear comes back after a Voice/Talk switch, because dest Travis skipped the conductor and Chrome STT died on abort+start.
- **2026-08-30** · Hotfix 019 · [PR #34](https://github.com/bywale-com/travis/pull/34) — Speech text folds a restarted passage and Live no longer writes a turn per syllable, because 3.1 partials and Web Speech restarts were doubling and chopping the log.
- **2026-08-30** · Hotfix 018 · [PR #33](https://github.com/bywale-com/travis/pull/33) — Dest Travis talks on Gemini 3.6 Flash and Live 3.1, because 2.5-flash 404s for a new key.
- **2026-08-29** · SCP-006 · [PR #31](https://github.com/bywale-com/travis/pull/31) — You can call Travis like a seat and talk to him on Live audio, because the room only had Cursor dests and his mouth was `speechSynthesis` on someone else’s text.

---

Travis is a **voice interface between you and Cursor** — speak instructions, hear replies, see images and artifacts when they cannot be spoken. Phone is the primary device. Cursor stays the execution surface; you never have to stare at it to stay in the loop.

**Agent seats** (paste-prompts + identity): [`docs/README.md`](docs/README.md) — Product Manager, Systems Analyst, and Engineer. Always-on for the Engineer: [`AGENTS.md`](AGENTS.md). Trails: [`docs/register/PHASE-ONE-LOG.md`](docs/register/PHASE-ONE-LOG.md) (PM/founder) · [`docs/register/SYSTEMS-ANALYST-LOG.md`](docs/register/SYSTEMS-ANALYST-LOG.md) (SA) · git + PRs (Engineer — do not append those logs).

This repository starts as a **thin pipe** (v1): speech → Cursor agent run → stream → text-to-speech + chat pane. Triage / judgment is a later layer inside the same pipe, not a separate product.

---

## What it is (plain)

| Layer | Job |
|-------|-----|
| **You** | Speak. Listen. Glance at the pane only when something is inherently visual. |
| **Travis (this app)** | Speech-to-text, send, stream, readback, render text + images in order. |
| **Cursor** | Durable agent runs against a repo (`@cursor/sdk` / Cloud Agents API). Buried. Untouched as UI. |

v1 surfaces *everything* readable from the assistant stream (no judgment yet). Thinking/tool spam is filtered for hygiene — that is not triage; that is pipe hygiene.

---

## Seats (do not swap jobs)

| Seat | Owns | Trail |
|------|------|-------|
| **Product Manager** | Product interpretation, Type A/B, founder wording, face outcomes | [`docs/register/PHASE-ONE-LOG.md`](docs/register/PHASE-ONE-LOG.md) |
| **Systems Analyst** | Machine: Story, Requirements, tables, ports, change packets | [`docs/register/SYSTEMS-ANALYST-LOG.md`](docs/register/SYSTEMS-ANALYST-LOG.md) |
| **Engineer** | Wire the specified face + machine | git + PRs · [`AGENTS.md`](AGENTS.md) |

Detailed seat READMEs: [`docs/seats/`](docs/seats/).

---

## Method & build law (same as Om Coda Tower)

| Doc | Job |
|-----|-----|
| [`docs/method/`](docs/method/) | How we think — decision constitution, two-column synthesis |
| [`docs/build-foundation/`](docs/build-foundation/) | How we build — rudiments, surfaces, visual law |
| [`docs/build-foundation/PROJECT-BRIEF.md`](docs/build-foundation/PROJECT-BRIEF.md) | What to build next |

---

## Status

**SCP-001 planted** — phone-first voice session + done-phrase conductor + Cursor send port (stand-in until `CURSOR_API_KEY` is set). Stores live in Postgres schema `travis`.

### Local run

```bash
cp .env.example .env.local   # set DATABASE_URL; optional CURSOR_API_KEY + SEED_CURSOR_AGENT_ID_*
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open the app on a phone browser (or desktop Chrome). Say a done phrase (seeded: *I'm done with this message* / *I'm done with this* / *I'm done*) to finalize a turn.

---

## Layout

```
src/                     # Next.js app (voice face + API)
docs/
  README.md              # seats front door (paste prompts)
  seats/                 # detailed PM / SA / Engineer READMEs
  method/                # portable Om Coda method
  build-foundation/      # portable build pack + PROJECT-BRIEF
  register/              # product thesis + PM/SA logs + packets
AGENTS.md                # Engineer always-on
```
