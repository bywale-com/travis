# Pull Requests & Automation Rules — Plain English Guide

This guide explains how Pull Requests (PRs), GitHub Action labels, and Vercel preview builds work in Travis. It is written in simple, plain English for humans, not for AI models.

---

## 1. The Three Types of PRs

In Travis, every piece of work belongs on **one pull request** (`One PR per initiative`). There are 3 kinds of PRs you will encounter:

| PR Type | What It Is | Who Wakes Up First? |
| :--- | :--- | :--- |
| **1. Packets (Feature Initiatives)** | Big architectural or product changes designed across seats (Architect → Systems Analyst → Engineer). | **Systems Analyst (SA)** (once founder gives the go) |
| **2. Hotfixes** | Ad-hoc code fixes, bugfixes, or technical tune-ups cut directly by an Engineer. Skips SA completely. | **Engineer** |
| **3. Non-Packet / Regular PRs** | Routine edits like documentation updates, notes, exploratory drafts, or plates. | **Nobody** (no automated seats wake up) |

---

## 2. What Triggers Automation Labels? (Fresh vs. Updates)

GitHub Actions watch commits pushed to PR branches. Instead of booting expensive AI agents on every keystroke or push, GitHub checks the files changed in **that exact push**.

### Type 1: Packets (`PM-PACKET-NNN-...`)
Packets are feature specs written by the Technical Architect.

* **On Fresh Creation:**
  * When a PM packet file is first pushed, it is usually on hold:
    ```text
    **Wake:** hold
    ```
    (or no Wake line at all).
  * **What happens:** GitHub Actions does **nothing**. No labels are added. No AI agents boot up.
* **On Update (The Get-Go):**
  * When the founder says "go", the PM updates that single line in the packet to:
    ```text
    **Wake:** sa
    ```
    and pushes.
  * **What happens:** GitHub Actions detects the exact line `**Wake:** sa` and adds the label **`wake-sa`**.
  * Cursor wakes up the Systems Analyst automation on that PR.
* **When SA Finishes:**
  * SA writes a `SYSTEMS-CHANGE-PACKET-*.md` file and pushes.
  * GitHub Actions sees that file, strips `wake-sa`, and adds **`wake-engineer`**.
  * Cursor wakes up the Engineer automation on that same PR.

---

### Type 2: Hotfixes (`HOTFIX-NNN-...`)
Hotfixes are fast code cuts that skip the SA stage.

* **On Fresh Creation:**
  * To wake an Engineer, two things must be true:
    1. The PR title **must** start with `Hotfix NNN — ...` (e.g., `Hotfix 093 — ...`).
    2. The push must **add a brand-new file** named `docs/register/HOTFIX-NNN-*.md` (not an edit of an existing one).
  * **What happens:** GitHub Actions adds the label **`wake-engineer`**.
  * Cursor wakes up the Engineer automation directly.
* **On Updates / Recuts:**
  * If an Engineer pushes code changes to `src/` or edits the text inside the hotfix document, GitHub Actions **does NOT** re-add `wake-engineer`.
  * This prevents infinite loops where editing a file would keep waking the agent over and over.

---

### Type 3: Regular / Non-Packet PRs
Any PR that does not add a hotfix file or a packet with `**Wake:** sa`.

* **What happens:** GitHub Actions adds **zero** seat labels.
* AI agents remain asleep.

---

## 3. How Vercel Previews and Runtime Tests Work

In Travis, Vercel preview deployments are **consequential**. Every preview deploy automatically runs the entire test suite and all live runtime door walks.

To keep tests stable and prevent chaotic feedback loops:

### The `previewing` Mutex (Lock)
Only **one** preview can run at a time on a PR.
* When a preview is initiated, GitHub Actions tags the PR with **`previewing`** and pushes an empty commit titled `Preview [vercel build]`.
* While `previewing` is active:
  * No new seat labels (`wake-engineer`, `wake-sa`) can be added.
  * No secondary preview commits can be pushed.
  * No fail-looks can fire.
* When the runtime tests paint (Pass or Fail), GitHub Actions removes the `previewing` label.

### The Gated Preview Rule (Hotfix 093)
Previously, pushing to an unlabeled PR would trigger a preview build by default. We discovered this gap: if you pushed a documentation change to an unlabeled PR, GitHub assumed "no seats are working, so work must be finished" and immediately kicked off a Vercel build and test run!

Now, previews are strictly **gated**:
1. **On Plant Finish:** When an Engineer finishes their code and pushes changes to `src/` or `docs/register/ENGINEER-HANDOFF.md` on a hotfix or packet PR, GitHub Actions strips the seat labels and sets `green_light=true`. Only then does `preview-when-clear` trigger the preview build.
2. **On Manual Request (`preview` label):** If you ever want to preview an arbitrary PR or test something without a code plant, simply add the label **`preview`** to the PR in GitHub. The action will consume the label and trigger the preview build safely.
3. **On Blocker Release:** If a PR was held by a `blocker` label, removing `blocker` allows the preview to proceed.
4. **Incidental Pushes Skip Previews:** Pushing docs, notes, test sheets, or scripts to an unlabeled PR will **never** trigger a phantom Vercel preview.

---

## 4. Summary Table: What Action Takes Place?

| Event / Push Content | Labels Added / Removed | Does Vercel Build? |
| :--- | :--- | :--- |
| Push new packet with `**Wake:** hold` | None | No |
| Push packet with `**Wake:** sa` | Adds `wake-sa` | No |
| Push `SYSTEMS-CHANGE-PACKET` | Removes `wake-sa`, adds `wake-engineer` | No |
| Push brand-new `HOTFIX-NNN-*.md` (PR title: `Hotfix NNN — ...`) | Adds `wake-engineer` | No |
| Push code plant (`src/` or `ENGINEER-HANDOFF.md`) | Strips seat labels, sets `green_light=true` | **Yes** (adds `previewing` lock and triggers preview) |
| Push edits to existing docs/notes | None | No |
| Manually add label `preview` to PR | Removes `preview`, checks locks | **Yes** (adds `previewing` lock and triggers preview) |
| Doors paint Fail and PR is idle | Removes `previewing`, adds `fail-look` | No |
| Push `BLOCKER-NNN-*.md` | Strips seats, adds `blocker` | No |
