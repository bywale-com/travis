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
        ↓  (PR opened / draft opened / PR pushed)
SA automation — full SA protocol
        ↓  (SA pushes SYSTEMS-CHANGE-PACKET-NNN on the same PR)
Engineer automation — full Engineer protocol
        ↓
plant stays on that same PR
```

**Same PR** is law. Do not open a cousin. Turn **off** “Pull request creation” on both automations if the UI lets you; the prompts also forbid it.

There is no file-path trigger in Cursor. The gate lives in the prompt — and it must be **this commit**, not the whole PR.

**Why:** Cursor boots a full `cursor-grok-4.6-high-fast` agent on every matching event, then the prompt decides. A gate that looks at `origin/main...HEAD` wakes SA on every later stamp (“the PR already has a packet”). Engineer’s “PR pushed” trigger fires on those same stamps. Inspect 2026-09-05: **27 automation boots**, almost all paired SA+Engineer, almost all gate-fail after reading the seat. One useful SA sign (025). One Engineer sat ~85 minutes re-gating follow-up events on #126.

**This-commit gate (prompts):**

- SA: `git diff --name-only HEAD~1` must include `docs/register/PM-PACKET-[0-9]*-*.md` and must **not** be only `*-TEST.md`. Do not accept the seat until that passes.
- Engineer: the same command must include `docs/register/SYSTEMS-CHANGE-PACKET-*.md`. Do not accept the seat until that passes.

Re-paste both prompts at [cursor.com/automations](https://cursor.com/automations) after this file changes. Cloud agents cannot Save + Activate. Until the live prompts match, every push still burns a pair.

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
**Triggers (any):** Source control — **Draft opened**, **Pull request opened**, **Pull request pushed**  
**Repository:** `bywale-com/travis` (single repo; inferred from the PR)  
**Tools:** Memories **off**. Pull request creation **off**. Comment on PR optional (silence is better — do nothing when the gate fails).  
**Prompt:** paste [`house-now/automations/packet-sa.prompt.md`](./house-now/automations/packet-sa.prompt.md) in full.

---

## Automation B — SA complete → Engineer

**Name:** `Travis — SA complete → Engineer`  
**Triggers (any):** Source control — **Pull request pushed**  
**Repository:** `bywale-com/travis`  
**Tools:** Memories **off**. Pull request creation **off**.  
**Prompt:** paste [`house-now/automations/sa-complete-engineer.prompt.md`](./house-now/automations/sa-complete-engineer.prompt.md) in full.

---

## Save + Activate (human or local `/automate`)

1. **Pause both** at [cursor.com/automations](https://cursor.com/automations) before pushing paper, or every stamp still boots a pair on the **old** prompts.
2. Open each automation. Replace the prompt with the file in this repo (full paste). Save + Activate.
3. First create (if they are not already on): [cursor.com/automations/new](https://cursor.com/automations/new) — **A** three triggers, **B** PR pushed, this repo, PR creation **off**.
4. After the this-commit prompts are live, a push wakes SA only when that commit added a real `PM-PACKET-NNN` (not a test). Engineer wakes only when that commit added a `SYSTEMS-CHANGE-PACKET`.

---

## Must-not

- Do not mint a cousin PR.
- Do not run SA because plates, FACE, or the Phase One log moved.
- Do not run Engineer because the PM stamped.
- Do not treat this as Travis product chrome. This is Cursor Automations waking seats.
- Do not remint 023. Next SA packet is **024** until SA writes a later number.
