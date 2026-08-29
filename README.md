# travis

## Implementation

Newest first. On completion of a packet or hotfix the Engineer **prepends** one line: date · ref · PR — the change, because. One sentence. Not an essay.

- **2026-08-28** · Hotfix 015 · [PR #26](https://github.com/bywale-com/travis/pull/26) — A long spoken line that restarts after a hitch now lands once, because Web Speech was dumping the whole passage again and the old stutter fold only caught 2–5 word repeats.
- **2026-08-28** · Hotfix 013 · [PR #25](https://github.com/bywale-com/travis/pull/25) — Voice reads assistant sentences as they land, because TTS waited for stream `done` and dumped the whole post.
- **2026-08-28** · Hotfix 014 · [PR #25](https://github.com/bywale-com/travis/pull/25) — A refresh keeps the live room, because the SPA session died while the turns were still in Postgres; End still ends.
- **2026-08-28** · Hotfix 012 · [PR #24](https://github.com/bywale-com/travis/pull/24) — Talk gets Pause/Resume and Talk + voice get Clear, because Talk had no mute and neither mode could dump the live line without sending.
- **2026-08-28** · SCP-005 · [PR #23](https://github.com/bywale-com/travis/pull/23) — Agent posts render heading/list/`code`/paragraphs, the Type field grows then inner-scrolls, and Type `@` chips fan out to every tagged seat, because the thread was a flat dump and Type could only address one seat.
- **2026-08-27** · Hotfix 011 · [PR #22](https://github.com/bywale-com/travis/pull/22) — Type send clears now and does not lock the box, because send awaited the whole Cursor stream.
- **2026-08-27** · SCP-004 · [PR #21](https://github.com/bywale-com/travis/pull/21) — The log gets a Talk|Type composer with `@` by seat title, because Mode B had no typed send path.

---

Travis is a **voice interface between you and Cursor** — speak instructions, hear replies, see images and artifacts when they cannot be spoken. Phone is the primary device. Cursor stays the execution surface; you never have to stare at it to stay in the loop.

**Agent seats** (paste-prompts + identity): [`docs/README.md`](docs/README.md) — Product Manager, Systems Analyst, and Engineer. Always-on for the Engineer: [`AGENTS.md`](AGENTS.md). Trails: [`docs/register/PHASE-ONE-LOG.md`](docs/register/PHASE-ONE-LOG.md) (PM/founder) · [`docs/register/SYSTEMS-ANALYST-LOG.md`](docs/register/SYSTEMS-ANALYST-LOG.md) (SA) · git + PRs + this README Implementation (Engineer — do not append those logs).

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
| **Engineer** | Wire the specified face + machine | git + PRs + README Implementation · [`AGENTS.md`](AGENTS.md) |

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
