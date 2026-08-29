# travis

## Implementation

Newest first. On completion of a packet or hotfix the Engineer **prepends** one line: date · ref · PR — the change, because. One sentence. Not an essay.

- **2026-08-29** · SCP-006 · [PR #30](https://github.com/bywale-com/travis/pull/30) — You can call Travis like a seat and talk to him on Live audio, because the room only had Cursor dests and his mouth was `speechSynthesis` on someone else’s text.

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
