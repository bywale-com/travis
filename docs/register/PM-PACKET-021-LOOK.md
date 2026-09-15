# Packet 021 — Look (file a lived miss from Log)

**Number:** `021` — next packet is `022` (Smarter loop — **held**, sibling PR). Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Technical Architect. **SA** ascribes as **037**.  
**When:** Named 2026-09-15. Split from the two-facet draft the same day.  
**Status:** Specified.  
**Wake:** sa
**Test spec:** [`PM-PACKET-021-LOOK-TEST.md`](./PM-PACKET-021-LOOK-TEST.md)  
**FACE:** [`PLATES-LOOK.md`](./PLATES-LOOK.md) LK1–LK2. Lock photos `travis-lk0-psi-*`. Do not mint from old L/C/D Log plates.  
**Work order (the agent File wakes):** [`WORK-ORDER-OUTSIDE.md`](./WORK-ORDER-OUTSIDE.md)  
**Prompt (founder Save+Activates):** [`house-now/automations/outside-look.prompt.md`](./house-now/automations/outside-look.prompt.md)  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **14:00 UTC 2026-08-25**.  
**Law:** [`docs/BUILD-PROTOCOL.md`](../BUILD-PROTOCOL.md) — Compose, don’t invent.  
**Meaning:** PHASE-ONE-LOG **10:26 UTC 2026-09-15** — founder-discovered pipe miss that doors never saw; file it from Log (context + note) into an agent **outside** Engineer B.  
**Held (not this PR):** N consecutive `runtime-doors` reds → same agent. Packet **022**.  
**Builds on:** 020 doors, `previewing` mutex (092), gated preview (093). Do not remint 020 walks, dest mail, or stream-intent. Do not plant 022’s count.  
**Next SA:** **037**.

**Where:** this PR. SA and Engineer commit here. Do not open a cousin. Do not remint 011–020 / 027–036 / 086–099.

---

## Founder lock

> Now, the second thing is, if we can automate what we just did with this last… those last errors in the app without me needing to explain. Because this is kind of different from the other failures. The other failures are happening in a state that the agents can… discover. What happens here is like a broad failure. So I have to discover it and then create the ticket. So there’s a way to create a ticket inside of the app. Maybe something like a button? And I might be able to select… what’s most relevant in context to this failure? Maybe add some other… information in the app itself. And I was able to trigger a loop, maybe a smarter agent loop, so it wouldn’t go to an engineer, it might go to this newer automation.

> Let's separate the two initiatives into 2 prs. hold on the second initiative - Smarter loop. let's pursue only this. Once separated. Trigger SA

LK1 is the click path (header **Look**). LK2 is the drawer.

Dest-to-Engineer as a **canary** stays. Change the **line**, not the dest. Do not recut plant-finished (`ENGINEER-HANDOFF.md`). Do not remove Live from sensors.

---

## What this packet is

Type A (who wakes) + Type B leaf (one door on Log).

Founder files a lived miss from the desk. Quiet **Look** → select turns + note → **File** → `outside-look` on a PR. **Not** Engineer B. **Not** hold → Initiative. **Not** the N-red count (022).

It is **not** a Travis orchestrator. It is **not** a telemetry table. It is **not** a fifth hold-sheet verb.

---

## What is already true (inspect)

Product-face “ticket” today is dest/backlog:

```1018:1028:src/components/Room.tsx
  const promoteInitiative = useCallback(
    async (turn: Turn) => {
      ...
        const res = await fetch(`/api/session/${sid}/initiatives`, {
          method: "POST",
          ...
          body: JSON.stringify({ foundingTurnId: turn.id }),
```

Hold sheet: Copy · Reply · Open in log · **Initiative** (“Writes a ticket. Hands it to Travis.”). Request log lists user turns; it does not file a miss (`src/components/plates/RequestLogDoor.tsx`).

Header cluster today: Backlog · Requests · Leave. LK1 inserts quiet **Look** next to Requests.

---

## Face (Type B)

**Job:** file a lived miss so the outside agent can diagnose without the founder typing a ticket in Cursor.

**Not the job:** dest a seat, write a backlog initiative, list requests, count `runtime-doors` reds.

Parametric: second job on Log → **behind a door**. Quiet until invited. One loud action in the sheet: **File**.

**Chrome (locked from psi 2026-09-15).** [`plates/travis-lk0-psi-log-chrome.png`](./plates/travis-lk0-psi-log-chrome.png) · overlay family [`plates/travis-lk0-psi-requests-overlay.png`](./plates/travis-lk0-psi-requests-overlay.png).

Cut (plates **LK1** · **LK2**):

- Quiet **Look** on **Log** only, header cluster, same weight as Requests — not accent. Click path is LK1. Not on Voice-only chrome. Not on every turn.
- Portal sheet (Requests family: portal + fixed). Note field. Recent turns with quiet selected wash — not accent rings. Default: last user turn plus following assistant turns in that beat, or empty with the note still required.
- One loud action: **File**. Close is quiet.
- After File: sheet closes. No toast stack. Tape receipt only if SA ascribes a turn. GitHub taking `outside-look` is the wake.

### Five buckets (LK1 + LK2)

| Bucket | What |
|--------|------|
| **1. Copy** | Look in the Log header cluster. Sheet: note, select turns, File. Wakes the outside agent. Not Initiative. Not Requests. |
| **2. Do not build** | Specimen phrases on the PNG. Stray punctuation. “this room” as required copy. Listening/Pause peeking under a short sheet. Lock-photo empty tape. Bezel / wordmark / End session from old Log plates. |
| **3. Implied** | Look opens the sheet. Close dismisses. File needs a note or a selection. Selected wash toggles. Overlay is portaled. Talk\|Type still the Log. |
| **4. Completes** | Empty note + empty selection is a miss (400). Voice has no Look. After File the sheet is gone. Production-psi targeting (SA 037). |
| **5. Out** | Packet **022** N-count. Hold → Initiative. Requests search + All/Today/Week. Dest Engineer. Mint `travis.look`. 098 Live. |

---

## Technical cut (hole for SA)

The door must end with `outside-look` on a **PR**, because Cursor automations in this house wake on PR labels.

| Case | Where the label goes |
|------|----------------------|
| This session’s deploy is an **open PR** preview | That PR. |
| Production psi / no open PR for this SHA | SA ascribes. Architect names the hole: Issue body can hold session id + turn ids + note; something cheap must still produce a PR with `outside-look` (existing hotfix path, or Issue→label Action). **Do not mint a table** unless GitHub Issue + label cannot hold the seed. |

Server-side only. Reuse a GitHub token already in the house if SA says it can (`WAKE_GITHUB_TOKEN` is the label actor today; `TRAVIS_GITHUB_TOKEN` is unfold — do not confuse them). Phone never sees a PAT.

Proposed hang (SA may rename): `POST /api/session/:id/look` with `{ turnIds: string[], note: string }`. Operator must own the room. Empty note + empty selection is a miss (400). Do not call `promoteInitiative`.

`outside-look` is a **hold** like `fail-look`: while it is on, doors must not add `fail-look`. Include it in hold lists in `wake-packet-seats.yml` (`strip_seats` / `add_seat` / `previewing` block). Plant-finished strips it too. Create the GitHub label. **Do not** change the N-red `fail-look` counter — that is 022.

---

## File plan (Engineer, after SA 037)

| File | What goes in (not code) | Why a file |
|------|-------------------------|------------|
| [`WORK-ORDER-OUTSIDE.md`](./WORK-ORDER-OUTSIDE.md) | Agent law when File wakes them. Engineer does not rewrite. | Architect. Landed. |
| [`house-now/automations/outside-look.prompt.md`](./house-now/automations/outside-look.prompt.md) | Paste. Founder Save+Activates. | Architect. Landed. |
| `.github/workflows/wake-packet-seats.yml` | Create `outside-look`. Treat as a seat/hold. Plant-finished strips it. | Cheap gate. |
| `src/components/Room.tsx` + small sheet | Quiet **Look** on Log header; portal sheet; File. SurfaceBoundary id `look-miss`, order next to Requests. | Face. LK1 / LK2. |
| `src/app/api/session/[id]/look/route.ts` (or path SA names) | POST. Auth as other session doors. Body → GitHub per SA 037. | Different source and side-effect. |
| `src/lib/look-miss.ts` (only if grain is not one-screen) | Pure validate: note/selection required. | Different from `promoteInitiative`. |
| Runtime walk | Open Log, Look, File with a note on the **test** room. Expect 2xx. Do not dest Engineer. | 020 cumulative suite. |
| Engineer B prompt | If `outside-look` is on: stop. | Avoid two agents. |

Do not merge Look into `RequestLogDoor`. Do not hang File on `/initiatives`. Do not edit `runtime-doors.yml` to count reds (022).

---

## Silence (named — do not invent)

| Silence | Why |
|---------|-----|
| **N-red escalate / `runtime-doors` counter** | Packet **022**. Held. |
| **`travis.look` / telemetry table** | Seed fits in a GitHub Issue/PR body. Mint only if SA proves that cannot hold. |
| **Hold-sheet File** | Initiative is dest/backlog. |
| **Travis orchestrator** | GitHub labels already wake seats. |
| **Save+Activate from an agent** | Founder only. |

---

## SA 037 must ascribe (do not invent in `src/`)

1. Persist: GitHub Issue body vs PR comment vs (only if those fail) a store.
2. Production-psi path: how `outside-look` lands on a PR when there is no preview PR.
3. Which token files the label (`WAKE_GITHUB_TOKEN` vs `TRAVIS_GITHUB_TOKEN` vs a new runtime secret). Not `GITHUB_TOKEN` as the Cursor trigger actor.
4. Exact POST path and 4xx/5xx receipts on the tape (or silence: no tape row).
5. Whether the runtime walk may assert the GitHub label or only the HTTP door.

---

## Founder still does by hand

Save + Activate a Cursor Automation: label trigger `outside-look`, paste [`outside-look.prompt.md`](./house-now/automations/outside-look.prompt.md), same environment as Engineer B. Re-paste Engineer B (stops when `outside-look` is on).

---

## I do not plant

No `src/`. No workflow edit from this seat. No table. No automation click.
