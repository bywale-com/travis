# Initiative — Verified sight (confirm what Engineer did)

**Status:** Initiative / problem statement. **Not a packet.** **Not a plant.**  
**Does not mint a store.** SA ascribes ports. Engineer does not hand Travis a working tree.  
**Does not unwind 042.** Travis still must not review a repo it cannot see.  
**Log:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md)

---

## Problem (founder)

Travis cannot access the repo, diffs, branches, tests, or CI. That makes it hard to **confirm what the Engineer actually did**.

## What is already true

| Fact | Where |
|------|--------|
| The boundary is **stated** | Hotfix 042: no repo, diff, branch, test run, CI. *Reading about work in the room log is not the same as being able to do it.* |
| The overreach was real | Room `3c8be329`: Travis offered a diff review and a CI check. It has no tool that sees code. |
| Half was legitimate | 038 room window can contain what Engineer **said**. That is a claim, not a proof. |
| Seats can see the repo | Cursor Engineer (and SA/PM chats) live on the codebase. Travis is the harness, not a clone of that workspace. |
| Founder can confirm in Cursor / GitHub | Manual. The hole is **confirming through Travis** without opening Cursor. |

**042 stays.** The initiative is not “let Travis guess better.” It is **give Travis something that is already true**, or stay silent.

---

## Job

When the founder asks “did Engineer actually do it?”, Travis can answer from **verified facts** (a receipt, a PR/CI status, a bounded excerpt) — or say it cannot see it and send the seat. Never a confident review of empty air.

This is **confirm**, not triage. Not “was the change good.” Was the change **there**.

---

## Path (recommended order)

Do not start with a Travis checkout. That is the slow, expensive, hallucinatory path. Start with facts someone else already minted.

### Wave A — Verified receipt in the room (near)

Engineer (or a dumb tool on the Engineer run) **posts a receipt** when work lands: PR number/URL, head SHA, branch name, what command was run, pass/fail if **that run** produced it.

- Travis **relays** the receipt. 042 still holds: no receipt → “I cannot see the repo. I can ask Engineer.”  
- Same object in the log (005 nest). Voice: one beat, then hear-queue gist of the **receipt**, not of a 40k opinion.  
- Manual parity: the link is tappable (005). You can confirm without Travis.  
- Nothing Travis-only: you can ask Engineer the same thing.

**SA:** is this a turn kind, a structured blob on `agent_post`, or Cursor artifact metadata we already get and do not persist? Do not mint until that is named.  
**Engineer:** do not invent a receipt table. If the SDK already emits PR/artifact events, quote them. If the seat must write the receipt in prose, that is a **convention**, not a store — say so.

### Wave B — Read-only status feed (next)

A **read** port Travis may call: GitHub (or Cursor) **status** for the room’s repo — open PRs this room cited, check conclusion, merge state. No blob of the tree. No write.

- Permissions: **read-only**, **this room’s repo**, server-side token. Phone never sees it.  
- Travis tools: `what_landed` / `pr_status` — return the feed row, not a review essay.  
- 040: this is a lookup class (like `work_in_flight`). Fail closed. Narrate or stay silent per 041.  
- If the feed is down: `not available`, not `$0`-style fake green.

**SA:** name the external contract (GitHub Checks? Cursor issue/PR API?). Stood-up vs silence.  
**Engineer:** no `git` in the Travis VM as the product path.

### Wave C — Bounded excerpt (later)

Only if Wave B can fetch a **diff or log the API already returns** (PR files, a CI summary). Cap it (same family as `READ_CAP`). Log: scrollable block (output-types Wave 3). Voice: do not read a diff; “There’s a patch. View log.”

Still **not** a working tree. Still **not** “I reviewed the rollout.”

### Out (this initiative)

| Path | Why out |
|------|---------|
| Travis clones the repo | Writes a second workspace. Cost, secrets, 042 theater. |
| Travis “reviews” from the room log | 042: log ≠ sight. |
| Visibility = full engineer permissions | Seats execute. Travis confirms. Different jobs. |
| MCP / self-building | Vision (harness Phase 4). Not this initiative’s first cut. |
| Badge on the orb | No capability chrome. |

---

## How it shows (glass, when a wave locks)

| Home | What |
|------|------|
| **Voice** | Notify if a receipt lands (`Eng ready` / hear-queue). Rundown gist of the **receipt**: “PR 57, checks green.” Not a code review. |
| **Log** | Receipt nested on the Engineer turn: links clickable, SHA muted, CI mark only if the feed confirmed it. |
| **Ask Travis** | “Did Engineer land it?” → read Wave A/B facts or refuse per 042. |
| **Ask Engineer** | Unchanged. Still the person who can see the tree. |

Estimate vs confirmed (same honesty as Cost): **confirmed** = feed/receipt field; **claimed** = Engineer prose in the log. Travis must mark the difference. “Engineer said the tests passed” ≠ “CI is green.”

---

## Coordination

| Seat | Owns |
|------|------|
| **PM** | This initiative. Glass: receipt nest, claimed vs confirmed, no review essay. Packet only after SA names a port and founder locks a wave. |
| **SA** | Story + ports: Cursor artifact/PR events; GitHub (or not); whether a receipt is a column or a silence. Quote stood-up truth. **Do not** take job-law from this file — founder tags SA. |
| **Engineer** | Do not mint. Do not add `git` to Travis “to help.” When a packet exists: wire the named read; keep 042 in `TRAVIS_SYSTEM` until a tool actually sees a fact. |

Paste when the founder tags **SA**:

```text
Read docs/register/VERIFY-SIGHT-INITIATIVE.md. Founder: Travis cannot see repo/diff/CI and cannot confirm what Engineer did. 042 stays (no fake review). Inventory: what Cursor already emits (PR, artifacts, run status); what a read-only GitHub/Cursor status port would be; whether a verify receipt is a store or a named silence. Quote live contracts. Do not mint a table from this initiative. Stamp SYSTEMS-ANALYST-LOG. Change packet only when Engineer has no analysis left.
```

Paste when the founder tags **Engineer** (after SA, or for a hotfix-sized Wave A if SA says “convention only”):

```text
Read docs/register/VERIFY-SIGHT-INITIATIVE.md and HOTFIX-042. You do not plant a Travis checkout. If SA named a receipt or an existing SDK event, cut only that. 042 copy stays until a tool returns a real fact. Do not append PM/SA logs. Do not mint tables.
```

---

## Success (lived)

- Ask “did Engineer land it?” and hear a **receipt or a refusal** — never a invented review.  
- Open the same PR from the log without Cursor.  
- Claimed vs confirmed is audible/visible.  
- 042 tests still pass: no tool pretends to `cat` the repo.

## Risks

| Risk | Guard |
|------|--------|
| Unwind 042 and hallucinate again | No sight → refuse. New tool must return feed bytes. |
| Second IDE inside Travis | Excerpt cap. No checkout. |
| Receipt is just more Engineer prose | Mark **claimed**. Confirmed only from a port. |
| Token/secret on the phone | Server-side read. |
| Minting `verify_event` from vibes | SA first. |

---

## Open

1. Tag SA to inventory Wave A vs B?  
2. Wave A as Engineer convention (hotfix) if SA says no new store?  
3. Hold glass until a wave is locked — yes (no plate this stamp).
