# Packet 021 — Look (file a lived miss from Log)

**Number:** `021` — sibling **022** (Smarter loop) is on `main` park. Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Technical Architect. **SA** recuts **037** (same Look ascribe; who-wakes fork). Do not steal **038** (022).  
**When:** Named 2026-09-15. Who-wakes recut the same day.  
**Status:** Specified. Recut: File wakes Engineer B, not the outside agent.  
**Wake:** sa
**Test spec:** [`PM-PACKET-021-LOOK-TEST.md`](./PM-PACKET-021-LOOK-TEST.md)  
**FACE:** [`PLATES-LOOK.md`](./PLATES-LOOK.md) LK1–LK2. Lock photos `travis-lk0-psi-*`. Do not mint from old L/C/D Log plates.  
**Outside work order (022 only — not this door):** [`WORK-ORDER-OUTSIDE.md`](./WORK-ORDER-OUTSIDE.md)  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **14:00 UTC 2026-08-25**.  
**Law:** [`docs/BUILD-PROTOCOL.md`](../BUILD-PROTOCOL.md) — Compose, don’t invent.  
**Meaning:** Founder-discovered pipe miss that doors never saw; file it from Log (context + note) into the **regular Engineer**.  
**Held (not this PR):** N consecutive `runtime-doors` reds → **outside** agent. Packet **022**.  
**Builds on:** 020 doors, `previewing` mutex (092), gated preview (093). First plant of Look chrome already on this PR. This recut is who File wakes. Do not remint 020 walks, dest mail, or stream-intent. Do not plant 022’s count.  
**Next SA:** recut **037**.

**Where:** this PR. SA and Engineer commit here. Do not open a cousin. Do not remint 011–020 / 027–036 / 086–099.

---

## Founder lock

> Now, the second thing is, if we can automate what we just did with this last… those last errors in the app without me needing to explain. Because this is kind of different from the other failures. The other failures are happening in a state that the agents can… discover. What happens here is like a broad failure. So I have to discover it and then create the ticket. So there’s a way to create a ticket inside of the app. Maybe something like a button? And I might be able to select… what’s most relevant in context to this failure? Maybe add some other… information in the app itself. And I was able to trigger a loop, maybe a smarter agent loop, so it wouldn’t go to an engineer, it might go to this newer automation.

> I don't think these kinds of issues spin up our external… outside look agent… I think it just spins up the regular engineer… The workflow that triggers the external agent… is after… that's what is in PR 22. After a number of cycles, if… the same PR is still being essentially worked inside out…

> Yes go

LK1 is the click path (header **Look**). LK2 is the drawer.

Dest-to-Engineer as a **canary** stays. Change the **line**, not the dest. Do not recut plant-finished (`ENGINEER-HANDOFF.md`). Do not remove Live from sensors.

---

## What this packet is

Type A (who wakes) + Type B leaf (one door on Log).

Founder files a lived miss from the desk. Quiet **Look** → select turns + note → **File** → GitHub seed → label **`wake-engineer`** on a PR. **Regular Engineer B.** **Not** the outside agent. **Not** hold → Initiative. **Not** the N-red count (022).

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

Look chrome is already planted on this PR (`LookMissDoor`, `POST /api/session/:id/look`). First plant labeled **`outside-look`**. That wake is the miss this recut cuts.

---

## Face (Type B)

**Job:** file a lived miss so Engineer B can plant without the founder typing a ticket in Cursor.

**Not the job:** dest a seat, write a backlog initiative, list requests, count `runtime-doors` reds, boot the outside agent.

Parametric: second job on Log → **behind a door**. Quiet until invited. One loud action in the sheet: **File**.

**Chrome (locked from psi 2026-09-15).** [`plates/travis-lk0-psi-log-chrome.png`](./plates/travis-lk0-psi-log-chrome.png) · overlay family [`plates/travis-lk0-psi-requests-overlay.png`](./plates/travis-lk0-psi-requests-overlay.png). Unchanged.

Cut (plates **LK1** · **LK2**):

- Quiet **Look** on **Log** only, header cluster, same weight as Requests — not accent. Click path is LK1. Not on Voice-only chrome. Not on every turn.
- Portal sheet (Requests family: portal + fixed). Note field. Recent turns with quiet selected wash — not accent rings. Default: last user turn plus following assistant turns in that beat, or empty with the note still required.
- One loud action: **File**. Close is quiet.
- After File: sheet closes. No toast stack. No tape row. GitHub taking **`wake-engineer`** is the wake.

### Five buckets (LK1 + LK2)

| Bucket | What |
|--------|------|
| **1. Copy** | Look in the Log header cluster. Sheet: note, select turns, File. Wakes Engineer B. Not Initiative. Not Requests. Not the outside agent. |
| **2. Do not build** | Specimen phrases on the PNG. Stray punctuation. “this room” as required copy. Listening/Pause peeking under a short sheet. Lock-photo empty tape. Bezel / wordmark / End session from old Log plates. |
| **3. Implied** | Look opens the sheet. Close dismisses. File needs a note or a selection. Selected wash toggles. Overlay is portaled. Talk\|Type still the Log. |
| **4. Completes** | Empty note + empty selection is a miss (400). Voice has no Look. After File the sheet is gone. Production-psi targeting (SA 037 recut). |
| **5. Out** | Packet **022** N-count and the outside agent. Hold → Initiative. Requests search + All/Today/Week. Dest Engineer. Mint `travis.look`. 098 Live. |

---

## Technical cut (hole for SA)

The door must end with **`wake-engineer`** on a **PR**, because Cursor automations in this house wake on PR labels. Same Engineer automation as a hotfix / SCP. Not a new automation. Not `outside-look`. Not `fail-look` (that path reads a red `runtime-doors` log).

| Case | Where the label goes |
|------|----------------------|
| This session’s deploy is an **open PR** preview | That PR. Fresh-add `wake-engineer`. |
| Production psi / no open PR for this SHA | Issue body holds the seed; cheap path still produces a PR (`look/{issue}` draft) and fresh-adds `wake-engineer`. **Do not mint a table.** |

Server-side only. Token is **`WAKE_GITHUB_TOKEN`** (label actor). Not `TRAVIS_GITHUB_TOKEN`. Not `GITHUB_TOKEN`. Phone never sees a PAT.

Hang stays `POST /api/session/:id/look` with `{ turnIds: string[], note: string }`. Operator owns the room. Empty note + empty selection is a miss (400). Do not call `promoteInitiative`. Walk cookie still dry-runs (no GitHub, no label).

If `previewing` or `blocker` is on: comment the seed, **do not** label. After that hold clears, arm **`wake-engineer`** from the `<!-- travis-look -->` comment — not `outside-look`.

Engineer B’s file gate would stop on a psi File (empty-commit PR, no SCP/hotfix). **Recut the prompt:** a PR body or comment containing `<!-- travis-look -->` skips the file gate. The seed is the job. Re-paste B.

`outside-look` is **022**. While it is on (later), Engineer B still stops. This door must not add that label. Do not plant 022’s N-count.

---

## File plan (Engineer, after SA recuts 037)

| File | What |
|------|------|
| `src/server/look-github.ts` | Fresh-add **`wake-engineer`**. Never `outside-look`. Keep Issue + `look/{n}` draft when there is no open PR. |
| `.github/workflows/runtime-doors.yml` | Delayed arm from Look seed → **`wake-engineer`**, not `outside-look`. |
| Tests that grep `outside-look` for Look File | Match the new label. Keep `outside-look` as a hold only if 022 still needs the name in the list. |
| [`house-now/automations/sa-complete-engineer.prompt.md`](./house-now/automations/sa-complete-engineer.prompt.md) | Architect recuts with this packet. Founder re-pastes B. Look seed skips the file gate. |

Do not remint Look chrome. Do not hang File on `/initiatives`. Do not edit `runtime-doors.yml` to count reds (022). Do not Save+Activate an `outside-look` automation for this door.

---

## Silence (named — do not invent)

| Silence | Why |
|---------|-----|
| **N-red escalate / outside agent** | Packet **022**. Held. |
| **`travis.look` / telemetry table** | Seed fits in a GitHub Issue/PR body. |
| **Hold-sheet File** | Initiative is dest/backlog. |
| **Travis orchestrator** | GitHub labels already wake Engineer B. |
| **Save+Activate `outside-look` for Look** | Wrong agent. 022 later. |
| **`fail-look` as the File wake** | That path reads a red doors log. Look is a lived miss doors never saw. |

---

## SA 037 recut must ascribe (do not invent in `src/`)

1. File adds **`wake-engineer`**, never `outside-look`. Confirm fresh-add so the label-added trigger fires if Engineer was already on.
2. Production-psi path still mints a PR (Cursor wakes on PR labels). Issue can persist; a PR must exist.
3. Token stays **`WAKE_GITHUB_TOKEN`**.
4. Delayed arm after `previewing` / `blocker` clears: **`wake-engineer`** from `<!-- travis-look -->`.
5. Engineer B: `<!-- travis-look -->` skips the packet/hotfix file gate. Job is the seed, not a doors log.
6. Walk Files still do not label. Runtime walk asserts the HTTP door, not the GitHub label.
7. First plant’s `outside-look` hold in doors may stay as a name for 022. Look File must not add it.

---

## Founder still does by hand

Re-paste Engineer B ([`sa-complete-engineer.prompt.md`](./house-now/automations/sa-complete-engineer.prompt.md)) so the Look-seed gate is live. Do **not** Save+Activate `outside-look` for this door. That automation is **022**.

---

## I do not plant

No `src/`. No workflow edit from this seat. No table. No automation click.
