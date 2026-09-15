# How we build — start to finish

**This is the house protocol.** Find it from the repo [`README.md`](../README.md) and from [`docs/README.md`](./README.md). Seat law, packet files, and the automation chain sit under the links at the bottom. They do not replace this page.

Product face is the phone Travis app: Voice, Log, Backlog. Live app: `https://travis-psi.vercel.app`. You talk there (or here). Code lands through three Cursor seats on **one pull request**. Draft stays draft until plant is on that PR. Merge is the end of the pocket.

Flag (founder wording, 14:00 UTC 2026-08-25) — do not overwrite:

> I simply don’t wanna have to look at my phone. When it’s time to work on building, I open this app — not the Cursor app — and I can have a dialogue: talk, voice-send, hear the reply read back. Everything readable in the chat is read to me; images and such appear in the chat. It’s an interface between me and Cursor as it exists today.

v1 is a dumb pipe. Speech → Cursor agent run → stream → readback + chat (text and images in order). Triage is later, inside the same pipe. Pipe hygiene (do not read thinking or tool spam aloud) is not triage.

---

## The three seats

They do not swap jobs.

| Seat | Owns | Writes | Does not write |
|------|------|--------|----------------|
| **Technical Architect** | Founder wording, Type A vs Type B, face + technical cut + file architecture, plates, packet test sheet, look | Phase One log, specification Markdown, packet/hotfix test-sheet Markdown, plates, PM-LOOK, PM-HANDOFF | `src/`, executable tests, dependencies, workflows, migrations, adapters, configuration, tables, SA log |
| **Systems Analyst** | Machine: Story → Requirements → stores, runtime, ports | SA log, SYSTEMS-CHANGE-PACKET, signed SQL when the packet cuts it | Phase One log, `src/` |
| **Engineer** | Plant what Architect and SA already specced | `src/`, git + PRs, ENGINEER-HANDOFF, initiative folder, hotfixes | Architect log, SA log, stores nobody ascribed |

A new chat pastes the short block in [`docs/README.md`](./README.md), accepts that identity, then reads **Current** on its trail.

**Type A** is relationship / authorship (what sits where, who owns the loop). **Type B** is a lived face leaf (“I should be able to…”). Mixing methods is failure.

**Two buckets, only two.** Specified and clear → do it. Specified but not clear (missing face, missing cut, or missing store) → name why and stop. There is no third bucket called later / cousin / parked.

---

## Compose, don’t invent (law)

The product is known. The hole is implementation: we have been designing and writing process that should already exist.

**Novel code requires a reason. Commodity process requires justification for rebuilding.**

Before a substantial primitive: what existing mature thing already provides it (open source, vendor, paid — all fine)? What is missing? Only the missing part is designed. The rest is setup and integration so it works for Travis. Cost is a thought, not the start.

SA’s first question is not “here is our architecture.” It is “what already exists, and what is the smallest Travis-specific hang?”

First incremental place: **the send harness** — when a line is sent, what process runs, in what order, given what case, around the model. That is not “the whole product.” It is the loop that fires on a send.

Packet: [`PM-PACKET-016-COMPOSE.md`](./register/PM-PACKET-016-COMPOSE.md).

---

## Path A — a full pocket (from scratch)

This is how a new piece of product is built.

### 1. The work is born

You speak a lock, a lived miss, or an “I should be able to.” That talk lands in the Phase One log unless you mark a separate entry. Founder wording is captured as-is. Agent alignment is labeled as alignment, never as the flag.

Technical Architect inspects planted `src/` — quotes files, not memory. If the glass needs a picture, screenshot the live desk first, lock the chrome that already exists, paint only the new hole. Drift is trash. The written packet is the product; the plate keeps the look.

If a store or field is missing, that is SA. Architect names the hole. Architect does not mint a table.

### 2. Technical Architect cuts a packet

On **one** new branch and **one** open PR for this pocket (usually the Engineer opens it; Architect may open it when the packet is the first commit):

- `docs/register/PM-PACKET-NNN-….md` — next PM number, never reuse. Face + technical cut. Quote planted code.
- `docs/register/PM-PACKET-NNN-…-TEST.md` — always. Setup, exact sentences, ordered expects, **I saw** blanks. Scoped to this packet.
- Index row on `docs/register/PM-PACKETS.md`.
- Stamp Phase One log. Move **Current**. Update `PM-HANDOFF.md`.

The Architect’s “test” is this Markdown contract. Executable unit, runtime, and browser test code is part of the plant and belongs to Engineer. After the specification push wakes the next seat, Architect stops and does not pre-plant implementation on the branch.

If this open PR later takes a second hotfix, the PR description timeline is **this PR’s cuts only** — not the house’s whole hotfix index. Canon: [`register/PR-AUTOMATION-RULES.md`](./register/PR-AUTOMATION-RULES.md) § 4.

Waiting is one whole line on the packet, nothing else:

```text
**Wake:** hold
```

or no Wake line. Chat prose (“then SA”) is not the hold. The filename is not the hold. Draft is not the hold — we keep the PR draft through plant.

### 3. Get-go

When you say go, Architect flips that line to exactly:

```text
**Wake:** sa
```

and pushes. That is the only get-go.

### 4. Cheap gate (no model)

GitHub Action [`.github/workflows/wake-packet-seats.yml`](../.github/workflows/wake-packet-seats.yml) diffs **this push**, not the whole PR.

- This push touched a real `PM-PACKET-NNN-*.md` (not the TEST) **and** that file has `**Wake:** sa` → label **`wake-sa`**.
- The label add must be your GitHub user (`WAKE_GITHUB_TOKEN`), not `github-actions[bot]`. Cursor’s label trigger does not treat the Actions bot as you.
- A brand-new branch (`before` all zeros) diffs the tip commit. Comparing a clean checkout to itself sees no files and labels nothing.
- If the PR is not open yet (push before create), the Action waits a few seconds.

No Cursor seat boots until that label lands.

### 5. Systems Analyst

Automation **A** (`wake-sa` added) sits SA on **this same PR**. Pull-request creation is off. A cousin PR is a miss.

SA first gates on this commit: a PM packet with `**Wake:** sa`. Then accepts the seat. Then the machine track, in order:

```text
Story (must / must-not / chain / silence)
  → Requirements (extraction, not a second invention)
  → Materialized stores + dumb runtime + ports
```

Three layers, never mixed: **materialized** (stood up) · **map-only** · **named silence**.

Change packet `docs/register/SYSTEMS-CHANGE-PACKET-NNN-….md` — next SA number, never reuse. Shape:

- Intent
- Must / must-not
- Stores / fields / contracts (add · change · refuse)
- Runtime (who writes, who reads, triggers)
- Ports (real vs stand-in)
- Verify
- Out of scope

No leftover analysis. Engineer must be able to cut. If Story cannot bear a mint, name the silence. Do not remint a planted packet.

SA stamps the SA log, points **Current** at the new packet, commits, pushes **this branch**. That push is completion. SA does not plant `src/`.

### 6. Engineer

The same Action sees the change-packet file in this push and labels **`wake-engineer`**.

Automation **B** sits Engineer on **this same PR**.

Engineer gates on this commit: a new SYSTEMS-CHANGE-PACKET (or a hotfix file, or a Fail look). Then plants only what is specified and clear.

`src/` split: face `components/` + `plates/` · tokens `theme/` + `surfaces/` · grain `lib/` · machine `server/` + `server/db/` · HTTP `app/api/`. Keys stay server-side. Supported Cursor path only (`@cursor/sdk` / Cloud Agents API). No desktop puppeting. No hard-coded demo rows. Tokens, surface registry, parametric elimination, overlay escape.

If the cut needs live Travis Postgres: `DATABASE_URL` is a Cloud Agent runtime secret. Unset → stop and name it in the handoff; the file on the PR is not the hang. Set → run the existing SQL; do not remint it.

**Runtime verification (definition of done).** Syntax is not done. `npm test` is not done. Engineer **adds or extends** a sequential walk in `src/runtime/walks/` (named after the human use, not the packet). **Before every push:** `npm run test:preflight` when that script exists — local units, Chromium, and phone-face doors on a loopback fixture. That is the first sensor. Vercel’s Deployment Check runs **every walk** on this deploy’s URL and paints green or red. That check is the deploy gate, not the first loop. A walk is send, wait, next beat, same room. Cursor does not sit in Vercel MCP and call the walk “done.” Unwired previews must assert unwired — not pretend Live is up. Do not write on the founder’s living tape. PostHog only if SA hung that port. Red check → plant again on this PR. The founder is not the first sensor.

Engineer names the proof on `ENGINEER-HANDOFF.md` (preview URL, deploy id, **check name + green/red**). Then prepends one Implementation line on the repo `README.md`, rewrites the rest of the handoff, may add `docs/register/initiatives/<nnn>-<slug>/`. Commits, pushes **this branch**. Does not append Architect or SA logs. Does not wake look until the check is green or a blocker is named.

### 7. Technical Architect look

The Action sees `src/` (or a hotfix hang) on a PR that already has the packet + change packet, **and** Engineer named the runtime proof, and labels **`wake-pm-look`**.

Automation **C** sits Technical Architect on **this same PR**. Computer use may be on. Architect does not plant. Architect is **not** the runtime sensor.

Two angles:

1. **Look** — quote the lock against the plant. Open **this PR’s preview**, not production, unless the PR is already merged. Phone-first. This deploy’s Deployment Check must already be green (or the named blocker).
2. **Like** — walk the packet test sheet as experience. Fill **I saw**. Name **Steps I could not do** (Talk on a phone, SSO you cannot pass). Do not pretend.

Locked verdicts:

| Verdict | Meaning | What happens |
|---------|---------|--------------|
| **Pass** | Walked what you could; tape matches the lock; this deploy’s door check is already green | Emerge |
| **Fail** | Plant or walk missed the lock | Label `fail-look` → Engineer, same PR |
| **No walk** | Could not send (SSO wall, no Type). Not a Pass | No emerge. No fail-look |

“Pass for what this seat could do” after only reading `src/` or hitting a login wall is **not** Pass. Voice **like** stays human. Voice **doors** are the Deployment Check. Do not invent a tester product. Do not have Cursor triage Vercel instead of the check.

Architect writes `docs/register/PM-LOOK-NNN.md`, stamps the Phase One log, pushes.

### 8. Emerge, then you

If the look file has `**Verdict:** Pass` **and** this deploy’s Deployment Check is green (build, `npm test`, every E2E walk), the Action (no model) labels **`emerge`**, opens a GitHub issue assigned to you with the test sheet verbatim, and emails that sheet when `EMERGE_EMAIL` + Resend secrets exist. Attach the **Playwright recording of this packet’s walk only** — the use this cut was solving — not a replay of the whole cumulative suite. That is house mail, not Travis.

No emerge on a red or pending check. You walk the same sheet on the phone. SSO, Talk, a typed sentence are yours. The recording is so you see what already passed for this packet, not so you become the first sensor.

### 9. Merge

One PR. Merge it. That is the end of the pocket. Close leftover cousin drafts. Do not leave “maybe later” open.

A clean packet is **three** Cursor boots if nothing loops (SA, Engineer, look). Each Fail look adds Engineer + look again.

---

## Path B — a hotfix (skip SA)

Lived smoke / code / backend grain that is **not** a PM face packet and **not** an SA change packet.

1. Next hotfix number (`docs/register/HOTFIXES.md` — never reuse). Files: `HOTFIX-NNN-….md` + `HOTFIX-NNN-…-TEST.md`.
2. PR title **must** start with `Hotfix NNN —`.
3. This push lands the hotfix file → Action labels **`wake-engineer`** only. No `wake-sa`.
4. Same Engineer automation. Plant on this PR. File on the PR is not the live hang.
5. Action labels **`wake-pm-look`**. Look is the hotfix; no PM packet and no change packet is not a miss.
6. Pass → emerge mails the hotfix test sheet. Fail → `fail-look`. Merge.

---

## One PR

Envelope, packet, and pocket are **roles of the same PR**, not extra pull requests. SA sits because a second seat sat is not a reason to open a cousin. Automations have pull-request creation **off**.

Initiative folders (`docs/register/initiatives/<nnn>-<slug>/`) follow the SA / pocket number. PM packet numbers and SA packet numbers are two counters. Hotfixes are a third.

---

## What you still do by hand

A cloud agent cannot Save + Activate a Cursor Automation. Prompts live in [`docs/register/house-now/automations/`](./register/house-now/automations/). If the paste at cursor.com/automations is stale, the seat boots on old law (look that Passes an SSO wall; Engineer that stops on “file exists”). Re-paste when the prompt in the repo changes.

Blocker letter (mail when a plant needs a secret or a hole only you can fill) is specified and **not planted**. Wait for go.

---

## Trails

| Seat | Trail |
|------|--------|
| Architect | [`docs/register/PHASE-ONE-LOG.md`](./register/PHASE-ONE-LOG.md) — append-only; only **Current** moves |
| SA | [`docs/register/SYSTEMS-ANALYST-LOG.md`](./register/SYSTEMS-ANALYST-LOG.md) — same discipline |
| Engineer | git + PRs · [`docs/register/ENGINEER-HANDOFF.md`](./register/ENGINEER-HANDOFF.md) |

A seat is disposable. The log is not.

---

## Detail (do not start here)

| What | Where |
|------|--------|
| Seat paste + identity | [`docs/README.md`](./README.md) |
| Seat READMEs | [`docs/seats/`](./seats/) |
| House process files | [`docs/register/house-now/protocols/`](./register/house-now/protocols/) |
| Wake / automations / emerge | [`docs/register/AUTOMATION-PACKET-CHAIN.md`](./register/AUTOMATION-PACKET-CHAIN.md) |
| Outside look (Look door / lived miss) | [`docs/register/WORK-ORDER-OUTSIDE.md`](./register/WORK-ORDER-OUTSIDE.md) · packet [`021`](./register/PM-PACKET-021-LOOK.md) |
| PM packets | [`docs/register/PM-PACKETS.md`](./register/PM-PACKETS.md) |
| Hotfixes | [`docs/register/HOTFIXES.md`](./register/HOTFIXES.md) |
| Plates | [`docs/register/PLATE-CHROME-RULE.md`](./register/PLATE-CHROME-RULE.md) |
| UI rudiments | [`docs/build-foundation/00-rudiments.md`](./build-foundation/00-rudiments.md) |
| How we think | [`docs/method/00-INDEX.md`](./method/00-INDEX.md) |
