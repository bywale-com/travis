# Automation — packet → SA → Engineer (same PR)

**Seat:** Technical PM. Founder lock 2026-09-05: when a packet lands, spin SA for the full process protocol; when SA completes, Engineer builds; **all on the same PR the packet was placed in.**

**Parked-since:** PHASE-ONE-LOG **19:44 UTC 2026-08-25** (PM-only speak; auto SA / Engineer chain). This is that seam.

**I cannot Save + Activate from a cloud agent.** Cursor has no Automations create API. A human (or a **local** `/automate` session) registers the two automations below at [cursor.com/automations/new](https://cursor.com/automations/new). Prompts are ready to paste.

**Repo:** `bywale-com/travis`

---

## The chain

Cursor Automations cannot trigger “when an agent finishes.” Closest documented seam: **SA commits the change packet on the packet PR → that push wakes Engineer.**

```text
PM locks PM-PACKET-NNN on a PR
        ↓  label wake-sa
SA automation — full SA protocol
        ↓  label wake-engineer
Engineer automation — full Engineer protocol
        ↓  label wake-pm-look  (src/ plant on a PR that already has packet + SCP)
Technical PM look + what it can test
        ↓  Fail → label fail-look (same PR)
        ↓  Pass → emerge. Human walks the same sheet.
```

**Same PR** is law. Do not open a cousin. Turn **off** “Pull request creation” on both automations if the UI lets you; the prompts also forbid it.

A prompt gate **cannot** skip the bill. Official Cursor docs: automations **are** cloud agents; they use the model’s **maximum** context window; **there is no context-window toggle**; they are billed as cloud-agent usage. Every matching GitHub event boots a Max-mode agent, then the prompt speaks. Spin-up is already a model call with the fat system + automation prompt. Stopping in 30 seconds still paid that call. Today’s 27 boots were that, twice per stamp.

Cursor source-control triggers have **no path filter** (asked for; not shipped). “PR pushed” will always boot.

**Redesign — cheap gate in GitHub, Cursor only when the label lands:**

```text
push touches a real PM-PACKET-NNN (not *-TEST.md)
        ↓  GitHub Action (no LLM)
label  wake-sa
        ↓
SA → SYSTEMS-CHANGE-PACKET → label  wake-engineer
        ↓
Engineer plants src/ → label  wake-pm-look
        ↓
Technical PM look+test
        Pass → emerge (human test)
        Fail → label  fail-look  (loop)
```

Action: [`.github/workflows/wake-packet-seats.yml`](../../.github/workflows/wake-packet-seats.yml). It diffs **this push** (`before…after`), not the whole PR. No Cursor token until the label is added.

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
**Triggers (any):** Source control — **Label added** **`wake-engineer`** (SA completed) **and** **Label added** **`fail-look`** (PM look failed). Both lowercase. Not PR pushed.  
**Repository:** `bywale-com/travis`  
**Tools:** Memories **off**. Pull request creation **off**.  
**Prompt:** paste [`house-now/automations/sa-complete-engineer.prompt.md`](./house-now/automations/sa-complete-engineer.prompt.md) in full.

---

## Automation C — Plant → Technical PM look+test

**Name:** `Travis — plant → PM look`  
**Triggers (any):** Source control — **Pull request label changed**, label **`wake-pm-look`** (added). Not PR pushed.  
**Repository:** `bywale-com/travis`  
**Tools:** Memories **off**. Pull request creation **off**. **Computer use on** — look is the preview.  
**Prompt:** paste [`house-now/automations/pm-look.prompt.md`](./house-now/automations/pm-look.prompt.md) in full.

This is the beat that can run on a **already planted** PR (009 / 025 on #127). SA and Engineer must not be re-woken for that.

---

## Save + Activate (human or local `/automate`)

1. **A** / **B** stay label `wake-sa` / `wake-engineer`. **B** also gets a second trigger: Label added / `fail-look`. Re-paste the Engineer prompt.
2. Create **C**. Trigger: Label added / `wake-pm-look`. Computer use on. Memories off. PR creation off. Paste the PM-look prompt. Save + Activate.
3. To run the first look on #127: add `wake-pm-look` once C is Active. Do not add `wake-sa` or `wake-engineer` — 025 is already planted.
4. Later plants: Action adds `wake-pm-look` when this push touched `src/` on a PR that already has a packet + change packet.

---

## Must-not

- Do not mint a cousin PR.
- Do not run SA because plates, FACE, or the Phase One log moved.
- Do not run Engineer because the PM stamped.
- Do not treat this as Travis product chrome. This is Cursor Automations waking seats.
- Do not remint 023. Next SA packet is **024** until SA writes a later number.
