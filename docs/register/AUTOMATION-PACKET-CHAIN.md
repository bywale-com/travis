# Automation — packet → SA → Engineer (same PR)

**Start here for the whole build:** [`docs/BUILD-PROTOCOL.md`](../BUILD-PROTOCOL.md). This file is the cheap gate and the three automations.

**Seat:** Technical PM. Founder lock 2026-09-05: when a packet lands, spin SA for the full process protocol; when SA completes, Engineer builds; **all on the same PR the packet was placed in.**

**Parked-since:** PHASE-ONE-LOG **19:44 UTC 2026-08-25** (PM-only speak; auto SA / Engineer chain). This is that seam.

**I cannot Save + Activate from a cloud agent.** Cursor has no Automations create API. A human (or a **local** `/automate` session) registers the two automations below at [cursor.com/automations/new](https://cursor.com/automations/new). Prompts are ready to paste.

**Repo:** `bywale-com/travis`

---

## The chain

Cursor Automations cannot trigger “when an agent finishes.” Closest documented seam: **SA commits the change packet on the packet PR → that push wakes Engineer.**

```text
PM writes PM-PACKET-NNN on a PR with **Wake:** hold  (or no Wake line)
        ↓  plates, stamps, talk — Action does not label
Founder go → PM flips that line to **Wake:** sa and pushes
        ↓  label wake-sa
SA automation — full SA protocol
        ↓  label wake-engineer
Engineer automation — full Engineer protocol
        ↓  label wake-pm-look  (src/ plant on a PR that already has packet + SCP)
Technical PM look + what it can test
        ↓  Fail → label fail-look (same PR)
        ↓  Pass → emerge. Action emails the *-TEST.md. Human walks that sheet.
```

**Waiting is a line the Action greps.** Draft is not the hold — we keep PRs draft through plant. Chat prose (“then SA”, “don’t wake Engineer”) is not the hold. The filename `PM-PACKET-NNN` is not the hold. Exact line on the packet, whole line:

```text
**Wake:** hold
**Wake:** sa
```

Missing = hold. Flip `hold` → `sa` and push: that is the get-go. One commit. No founder GitHub click. No fourth automation.

**Same PR** is law. Do not open a cousin. Turn **off** “Pull request creation” on both automations if the UI lets you; the prompts also forbid it.

A prompt gate **cannot** skip the bill. Official Cursor docs: automations **are** cloud agents; they use the model’s **maximum** context window; **there is no context-window toggle**; they are billed as cloud-agent usage. Every matching GitHub event boots a Max-mode agent, then the prompt speaks. Spin-up is already a model call with the fat system + automation prompt. Stopping in 30 seconds still paid that call. Today’s 27 boots were that, twice per stamp.

Cursor source-control triggers have **no path filter** (asked for; not shipped). “PR pushed” will always boot.

**Redesign — cheap gate in GitHub, Cursor only when the label lands:**

```text
this push touches a real PM-PACKET-NNN (not *-TEST.md)
  AND that file has **Wake:** sa
        ↓  GitHub Action (no LLM)
label  wake-sa
        ↓
SA → SYSTEMS-CHANGE-PACKET → label  wake-engineer
        ↓
Engineer plants src/ → label  wake-pm-look
        ↓
Technical PM look+test
        Pass → label emerge + letter (human test)
        Fail → label  fail-look  (loop)
```

Action: [`.github/workflows/wake-packet-seats.yml`](../../.github/workflows/wake-packet-seats.yml). It diffs **this push** (`before…after`), not the whole PR. A new branch (`before` all zeros) diffs the tip commit — `git diff $after` on a clean checkout is empty and will not label. It greps `**Wake:** sa` on the packet at `after`. No Cursor token until the label is added. A packet on hold can sit on the PR; plates may edit it; no boot. If the PR is not open yet (push before create), it waits a few seconds.

**Who tags.** `GITHUB_TOKEN` is `github-actions[bot]`. Cursor’s label trigger has not woken A or B from that actor. Repo secret **`WAKE_GITHUB_TOKEN`** = a PAT for the GitHub user connected to the automations (you). Fine-grained: this repo, Issues read/write. The Action uses that for `gh pr edit` labels. Unset → bot (old path). Not `TRAVIS_GITHUB_TOKEN` (unfold). Do not paste the token in chat.

**Hotfix path (skip SA).** Founder 2026-09-05: a hotfix is not a new Cursor automation. Same Action. Title the PR `Hotfix NNN — …`. This push lands `docs/register/HOTFIX-NNN-*.md` (not `*-TEST.md`) → label **`wake-engineer`** only. No `wake-sa`. Same **B**.

```text
this push lands HOTFIX-NNN-*.md
  AND the PR title starts with Hotfix
        ↓  GitHub Action (no LLM)
label  wake-engineer     (no wake-sa)
        ↓
Engineer plants the hotfix
        ↓  src/  or  ENGINEER-HANDOFF.md  (SQL-only hang may only touch the handoff)
label  wake-pm-look
        ↓
Technical PM look+test (hotfix is enough — no PM-packet, no SCP)
        Fail → fail-look
        Pass → emerge + HOTFIX-NNN-*-TEST.md
```

**C must take a hotfix.** Live look that stops on “no packets” is the old paste. Re-paste [`house-now/automations/pm-look.prompt.md`](./house-now/automations/pm-look.prompt.md). A `HOTFIX-NNN` on the PR is the cut. Do not require a packet.

**B must apply, not only plant a file.** A SQL file on the PR is not a hang. `DATABASE_URL` is a Cloud Agent **runtime secret** on the environment B uses. Unset → stop and name it. Set → run the existing file. Re-paste [`house-now/automations/sa-complete-engineer.prompt.md`](./house-now/automations/sa-complete-engineer.prompt.md).

**Human must change the two automations** (I cannot Save + Activate):

1. Pause both, or every later stamp still boots on the old “PR pushed” triggers.
2. **A** — drop Draft opened / PR opened / PR pushed. Trigger: **Pull request label changed**, label **`wake-sa`** (added).
3. **B** — drop PR pushed. Trigger: **Pull request label changed**, label **`wake-engineer`** (added).
4. Re-paste the prompts. Memories **off**. PR creation **off**.
5. Create the two labels once if the Action has not already.

Prompt gate stays as a belt: do not accept the seat unless this commit has the matching file. Do not run on label **removed**.

**Webhook** is the same idea if you do not want labels: Action POSTs only on those paths. Still no Cursor boot on a vision stamp.

---

## What “SA completes” means (backend)

Not a vibe. Not a comment. Not a human “done.”

1. A new `docs/register/SYSTEMS-CHANGE-PACKET-NNN-*.md` is on **this PR**.
2. `docs/register/SYSTEMS-ANALYST-LOG.md` **Current** points at it.
3. The packet has the seat shape: Intent · Must / must-not · Stores / fields / contracts (add · change · refuse) · Runtime · Ports · Verify · Out of scope. No leftover analysis.
4. Next SA number is named. Nothing reminted.

That push is the Engineer trigger.

---

## Automation A — Packet → SA

**Name:** `Travis — packet → SA`  
**Triggers (any):** Source control — **Pull request label changed**, label **`wake-sa`** (added). Not PR pushed.  
**Repository:** `bywale-com/travis` (single repo; inferred from the PR)  
**Tools:** Memories **off**. Pull request creation **off**. Comment on PR optional (silence is better — do nothing when the gate fails).  
**Prompt:** paste [`house-now/automations/packet-sa.prompt.md`](./house-now/automations/packet-sa.prompt.md) in full.

---

## Automation B — SA complete → Engineer

**Name:** `Travis — SA complete → Engineer`  
**Triggers (any):** Source control — **Label added** **`wake-engineer`** **and** **Label added** **`fail-look`**. Both lowercase. Not PR pushed. Not a third automation. Hotfix uses the same `wake-engineer` tag.  
**Repository:** `bywale-com/travis`  
**Tools:** Memories **off**. Pull request creation **off**.  
**Prompt:** paste [`house-now/automations/sa-complete-engineer.prompt.md`](./house-now/automations/sa-complete-engineer.prompt.md) in full. Re-paste after 075 — planted = live effect; `DATABASE_URL` named.

---

## Automation C — Plant → Technical PM look+test

**Name:** `Travis — plant → PM look`  
**Triggers (any):** Source control — **Pull request label changed**, label **`wake-pm-look`** (added). Not PR pushed.  
**Repository:** `bywale-com/travis`  
**Tools:** Memories **off**. Pull request creation **off**. **Computer use on** — look is the preview.  
**Prompt:** paste [`house-now/automations/pm-look.prompt.md`](./house-now/automations/pm-look.prompt.md) in full. Re-paste after 075 — hotfix is enough; do not stop “no packets.”

This is the beat that can run on a **already planted** PR (009 / 025 on #127). SA and Engineer must not be re-woken for that.

---

## Save + Activate (human or local `/automate`)

1. **A** / **B** stay label `wake-sa` / `wake-engineer`. **B** also gets a second trigger: Label added / `fail-look`. Hotfix does not get a new paste.
2. Create **C**. Trigger: Label added / `wake-pm-look`. Computer use on. Memories off. PR creation off. Paste the PM-look prompt. Save + Activate.
3. To run the first look on #127: add `wake-pm-look` once C is Active. Do not add `wake-sa` or `wake-engineer` — 025 is already planted.
4. Later plants: Action adds `wake-pm-look` when this push touched `src/` on a PR that already has a packet + change packet, **or** `src/` / `ENGINEER-HANDOFF.md` on a PR that already has a `HOTFIX-NNN`.
5. **Emerge letter (human).** When this push writes `PM-LOOK-NNN.md` or `PM-LOOK-HOTFIX-NNN.md` with **Verdict: Pass**, the same Action (no LLM) labels `emerge` and sends the letter (packet `*-TEST.md` or `HOTFIX-NNN-*-TEST.md`). Not Travis. Not a Cursor agent.

---

## Emerge letter — human test time

Founder lock 2026-09-05: emerge is silent unless something lands in the inbox. While we build Travis, the channel is **email**, not the product face.

**When:** this push has `docs/register/PM-LOOK-NNN.md` or `docs/register/PM-LOOK-HOTFIX-NNN.md` with `**Verdict:** Pass`. Not on plant. Not on Fail.

**What you get:**

- Subject: `NNN emerged — walk this sheet` (packet) or `Hotfix NNN emerged — walk this sheet`
- First lines: finished / human test / PR / preview
- The document: that packet’s `PM-PACKET-NNN-*-TEST.md` or that hotfix’s `HOTFIX-NNN-*-TEST.md` **verbatim**. Not a summary. Not the look sheet.

**How (cheap, same Action):**

1. **Floor (no new secret):** open one GitHub issue, assigned to you, body = the letter. GitHub already emails assignments. One issue per NNN.
2. **Real mailbox letter:** same Action POSTs Resend when these **GitHub** secrets exist — `EMERGE_EMAIL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`. Vercel’s key does not count until it is copied to the repo Actions secrets. Attachment is the `*-TEST.md`. To = the inbox already used as `TEST_EMAIL_TO`. After the three secrets are on the repo, **Actions → Wake packet seats → Run workflow → `009`** sends this one.

Do not send this through Travis operator mail. Same vendor is fine. Same product path is not.

---

## Blocker letter — founder paste time (considering)

**Not planted.** Founder named the hole 2026-09-07: emerge exists; blockers do not. Hold until go.

**When (Engineer, usually):** this push lands `docs/register/BLOCKER-NNN-*.md`. The plant or live effect needs something from the founder — a secret, a paste, or a specified-but-not-clear hole. Not Fail-look. Not human test (emerge). SA may write the same file if ascribe is blocked on a key.

**What you get (same cheap Action, no LLM):**

- Label `blocker` on the PR
- Subject: `NNN blocked — needs you`
- Floor: one GitHub issue, assigned to you
- Mailbox: same `EMERGE_EMAIL` · `RESEND_API_KEY` · `RESEND_FROM_EMAIL`
- Body names the secret / the hole. Never the value.

**Must-not**

- Do not boot a Cursor seat on `blocker`.
- Do not invent a store to dodge the letter.
- Do not treat emerge as the blocker path.

---

## First measured sample — 009 (dirty)

Window: packet file lands → `PM-LOOK` Pass. Count boots and wall, not dollars. Stamp: PHASE-ONE-LOG **18:29 UTC 2026-09-05**.

**009 on #127:** 18 automation boots (9 A + 8 B + 1 C). Useful: SA `bc-90689f06` 176s · Engineer `bc-925e2ab1` 342s · C `bc-53c2a349` 438s (+ computerUse child 194s). Leak: 15 PR-pushed no-ops, last pair 17:13. Loops: 0. Verdict: Pass.

After the label gate, A/B did not boot on later stamps. C fired once (trigger name was swapped; one boot, not a pile).

A clean future packet = **3 boots** if no loop; **3 + 2×N** if it loops N times. Next new packet is that sample. Do not treat 009 as the clean number.

---

## Must-not

- Do not mint a cousin PR.
- Do not run SA because plates, FACE, the Phase One log, or a **hotfix** file moved.
- Do not run SA because a `PM-PACKET-NNN` file exists. Run only when that file has `**Wake:** sa`.
- Do not run Engineer because the PM stamped. A hotfix file **does** run Engineer.
- Do not treat this as Travis product chrome. This is Cursor Automations waking seats.
- Do not remint 023 / 024 / 025 / 026. Next SA packet is **027**. Next PM packet is **011**.
