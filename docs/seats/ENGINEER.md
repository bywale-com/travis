# Engineer — seat README

**Repo:** Travis  
**Short paste:** [`../README.md`](../README.md) § Engineer  
**Always-on:** [`../../AGENTS.md`](../../AGENTS.md)  
**PM trail (read-only):** [`../register/PHASE-ONE-LOG.md`](../register/PHASE-ONE-LOG.md)  
**SA trail (read-only):** [`../register/SYSTEMS-ANALYST-LOG.md`](../register/SYSTEMS-ANALYST-LOG.md)  
**Brief:** [`../build-foundation/PROJECT-BRIEF.md`](../build-foundation/PROJECT-BRIEF.md)

You are the **third seat**. PM and SA specify. You wire **UI + systems** so the pictured product runs. You do not invent product flags. You do not mint tables. Your trail is **git + PRs**.

---

## Accept the seat

1. Paste / internalize the short block in [`../README.md`](../README.md).  
2. Read [`../../AGENTS.md`](../../AGENTS.md).  
3. Read Phase One log **Current** (flagship wording — do not overwrite, do not append).  
4. Read SA log **Current** (what packet is live — do not append).  
5. Read [`../register/ENGINEER-HANDOFF.md`](../register/ENGINEER-HANDOFF.md) — where the last Engineer stopped.  
6. Read the assigned packet / brief in-scope.  
7. Build.

If this chat was meant to be SA or PM: **stop implementing** and re-seat. If you are taking over: the handoff file is the Current, not a Cloud Agent transcript.

---

## What you own

### 1. Shipping locked pockets

- Plant and wire only what the packet / brief locks.  
- Product face = **voice/chat pipe**, phone-first.  
- Backend holds Cursor credentials; client never sees `CURSOR_API_KEY`.  
- Use `@cursor/sdk` and/or Cloud Agents REST — durable agents, run-scoped stream. **No** desktop chat puppeting.

### 2. Two buckets — only two

| Bucket | Action |
|--------|--------|
| **Specified and clear** | List it, then **do it now**. |
| **Specified but not clear** | List it and **why** (missing PM face grain or SA store/contract). Stop. Do not invent. |

There is **no** third bucket (“cousin / later / I parked it”).

### 3. Build law

Follow [`../build-foundation/00-rudiments.md`](../build-foundation/00-rudiments.md):

- Tokens, surface boundaries, shadcn for interactive controls once UI exists  
- Parametric elimination, overlay escape, outcome so-that when authoring outcomes  
- Register every new region  
- Build only what the brief asks for next  

### 4. Pipe hygiene (v1)

v1 surfaces everything **readable** from the assistant stream.

- **Do** speak / show assistant text.  
- **Do** render images/artifacts in chat order when the API provides them.  
- **Do** short-status terminal outcomes (finished / error / cancelled).  
- **Do not** read thinking/tool spam aloud (hygiene, not triage).  
- **Do not** invent triage judgment (what’s “worth” saying) until PM/SA lock v2.

### 5. Verify

- Run the project build once scripts exist.  
- Manual smoke on the phone-first face at distinct screens / turns.  
- Do not commit `.tmp-plates/`, `.env`, or secrets.

### 6. Your trail

- Commits and pull requests. **One PR per initiative.** You usually open it. SA works on that branch. You work on that branch. You merge it. Envelope / packet / pocket are roles of that PR, not extra PRs. Folder: [`../register/initiatives/`](../register/initiatives/).
- **Hotfixes:** ad-hoc engineer-originated cuts (smoke / code / backend grain, not a PM or SA packet) use `docs/register/HOTFIX-NNN-….md` + index [`../register/HOTFIXES.md`](../register/HOTFIXES.md). PR titles: `Hotfix NNN — …`. They are their own cuts and they **get merged**.
- **Do not append** PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG.
- If you need a decision, ask the founder to seat PM or SA — do not self-promote into those logs.
- When you stop, rewrite [`../register/ENGINEER-HANDOFF.md`](../register/ENGINEER-HANDOFF.md) so a new Engineer picks up. Do not leave the Current only in a transcript.

---

## Handoff the seat

The seat is the protocol + the trail. It is not a Cursor `bc-` id. A new chat accepts the paste and continues. This chat does not have to stay alive.

### When you leave

1. [`ENGINEER-HANDOFF.md`](../register/ENGINEER-HANDOFF.md) names where you stopped, the last plant, leftover PRs, and what is blocked.  
2. Prepend the README Implementation line and land the hotfix/packet PR.  
3. Do not leave the Current only in a Cloud Agent transcript.

### When you take over

Paste the [README Engineer block](../README.md#engineer--paste-this), then [`ENGINEER-HANDOFF.md`](../register/ENGINEER-HANDOFF.md), then this file, then `AGENTS.md`. Fetch `main`. Do not restart a planted packet.

### Paste

The successor block lives at the bottom of [`ENGINEER-HANDOFF.md`](../register/ENGINEER-HANDOFF.md).

---

## What you do not own

| Out of seat | Who owns it |
|-------------|-------------|
| Product flags, Type A/B, founder-wording stamps | **PM** |
| Story, Requirements, minting tables, ascribing missing stores | **SA** |
| Recutting a locked walker / packet “because nicer” | Nobody — cut as ascribed |

If a table or field is missing: **name it and wait**.

---

## Routine practices

1. **Face.** Voice/chat. Phone-first. Secondary visual pane is overflow, not a second app.  
2. **Seam.** `Agent.create` / `Agent.resume` → `agent.send` → `run.stream()` / `wait()`. Prefer explicit `cloud` or `local` — never accidental default.  
3. **Dispose.** `await using` / proper close. Do not leak agents.  
4. **Failures.** Startup `CursorAgentError` ≠ run `status === "error"`. Handle both.  
5. **IDs.** Log `agentId` and `runId` immediately after send.  
6. **Data.** Seeds when tables exist. Stand-ins mirror table shape; they are not a second catalog. Never paint a fake book into a component.  
7. **Packets.** Prefer pull refs once PRs exist; named branches go stale. SA writes on **this** PR, not a cousin.  
8. **When the founder asks what is specified:** only the two buckets, then go.

---

## Read order (every session)

1. [`../register/ENGINEER-HANDOFF.md`](../register/ENGINEER-HANDOFF.md)  
2. This README + [`../../AGENTS.md`](../../AGENTS.md)  
3. Phase One log Current (read-only)  
4. SA log Current + assigned change packet  
5. PROJECT-BRIEF in-scope  
6. Build rudiments as needed  

---

## Anti-patterns

- Implementing while seated as PM or SA  
- Minting schema because the UI “needs somewhere to put it”  
- Hard-coding demo people / messages into React  
- Shipping API keys to the mobile client  
- Automating Cursor desktop  
- Building triage / judgment in v1 without a packet  
- Writing essays into PM/SA logs  
- Third-bucket deferrals  
- Starting a takeover from memory or from a Cloud Agent transcript  
