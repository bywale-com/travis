# Project brief — Travis

Filled from the Om Coda `PROJECT-BRIEF` template. Hand this to the agent with `docs/build-foundation/README.md` and `00-rudiments.md`.

---

## Product

- **Name:** Travis
- **One-line what it is:** A voice interface between you and Cursor — speak, hear replies, see images when needed.
- **Primary user (role):** Founder / builder who works from a smartphone and needs the Cursor loop to stay live without staring at Cursor (including while in motion).

## Molecular outcome (one paragraph)

> When it is time to build, the user opens Travis (not Cursor), speaks an instruction, voice-sends it into a Cursor agent run, and hears every readable reply read back while images and other un-speakable artifacts appear in the same chat in order — so the build loop continues without phone-staring or app-switching into Cursor.

## Where we start

- **First UI surface:** Phone-first Voice / Log / Backlog — already planted. Production `https://travis-psi.vercel.app`.
- **In-scope for a new Engineer:** Read [`docs/register/ENGINEER-HANDOFF.md`](../register/ENGINEER-HANDOFF.md) first. Build only the pocket the founder names. **One PR per initiative.** Do not restart 012 / 013 / 014 / 015 / 062 / 064 / 065.
- **Out of scope until named:** Triage/judgment; POSIX unfold; Fieldtop; desktop Cursor automation. Seated sit + disposable role dest is planted (015).

## Constraints

- Stack: Next.js (`src/`), Vercel (`travis-psi`), Postgres schema `travis`, `@cursor/sdk` / Cloud Agents API. API keys server-side only. Phone-first.
- Existing design references: Om Coda method + build-foundation (this repo). Product is not Tower.
- Must stay on rudiments: tokens · icons · surface boundaries · How/flows when relevant.
- Same seat law as Tower, refined: Technical PM (vision + inspect `src/` + spec face and cut) / SA (machine) / Engineer (implement only); two buckets for Engineer; no third bucket.

## Agent instruction

Follow `docs/build-foundation/00-rudiments.md`. Take over from [`docs/register/ENGINEER-HANDOFF.md`](../register/ENGINEER-HANDOFF.md). Build only the pocket the founder names. Register every new region. Do not invent process language before How leaves. Do not expand into out-of-scope modules. Do not mint tables. Do not append PM/SA logs. When you stop, rewrite the handoff file.
