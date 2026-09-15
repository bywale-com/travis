# Packet 021 — Outside look (break the recut; file the lived miss)

**Number:** `021` — next packet is `022`. Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Technical Architect. **SA** ascribes as **037**.  
**When:** Named 2026-09-15.  
**Status:** Specified. Architect defaults below; founder can override N / label names in chat.  
**Wake:** hold
**Test spec:** [`PM-PACKET-021-OUTSIDE-LOOP-TEST.md`](./PM-PACKET-021-OUTSIDE-LOOP-TEST.md)  
**Work order:** [`WORK-ORDER-OUTSIDE.md`](./WORK-ORDER-OUTSIDE.md)  
**Prompt (founder Save+Activates):** [`house-now/automations/outside-look.prompt.md`](./house-now/automations/outside-look.prompt.md)  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **14:00 UTC 2026-08-25**.  
**Law:** [`docs/BUILD-PROTOCOL.md`](../BUILD-PROTOCOL.md) — Compose, don’t invent.  
**Meaning:** PHASE-ONE-LOG **10:26 UTC 2026-09-15** — after N production `runtime-doors` reds, an agent **outside** Engineer B diagnoses / specifies / maybe fixes without tripping wires, on the **failing PR**; a lived desk miss files from Log into that same agent.  
**Builds on:** 020 runtime doors, `previewing` mutex (092), gated preview (093), stale-SHA guard (#193), Engineer recut-once (`fail-look`). Do not remint 020 walks, dest mail, or stream-intent.  
**Next SA:** **037**.

**Where:** this PR. SA and Engineer commit here. Do not open a cousin. Do not remint 011–020 / 027–036 / 086–099.

---

## Founder lock

> Building a smarter agent loop. After a certain amount of failures… After a certain amount of failures (especially now that we have preflight) a certain number of production failures triggers a smarter agent to diagnose / specify / and fix (without tripping wires) — we need a detailed spec of working without tripping wires, so agents aren’t rediscovering this every time. Really a spec of the work order.
>
> So this is pretty simple, it’s really just architecture and me setting up the right automation, and also… deciding on what tools we give this external agent that breaks the loop. So maybe around like 3 or 4 runtime failures. This will spin up and… diagnose, like, do exactly what you did. And maybe fix it. So go all the way to merging and then merging into the existing PR that’s failing so that… attaching a label like fail-look or something to trigger the engineer…
>
> Now, the second thing is, if we can automate what we just did with this last… those last errors in the app without me needing to explain. Because this is kind of different from the other failures. The other failures are happening in a state that the agents can… discover. What happens here is like a broad failure. So I have to discover it and then create the ticket. So there’s a way to create a ticket inside of the app. Maybe something like a button? And I might be able to select… what’s most relevant in context to this failure? Maybe add some other… information in the app itself. And I was able to trigger a loop, maybe a smarter agent loop, so it wouldn’t go to an engineer, it might go to this newer automation.

Dest-to-Engineer as a **canary** stays. The **message** must not mutate the PR (handoff notes already did). Do not isolate dest to a disposable agent. Do not remove Live from preflight or runtime-doors. Do not recut the plant-finished exception that treats `ENGINEER-HANDOFF.md` as a plant.

---

## What this packet is

Two facets, **one** outside agent, **one** PR.

| Facet | Kind | Job |
|-------|------|-----|
| **1. Escalate the build loop** | Type A — who owns the recut after N reds | Count this PR’s current-head `runtime-doors` reds. At **N = 4**, add `outside-look` **instead of** `fail-look`. That agent diagnoses, specifies, maybe plants **without tripping wires**, on the failing branch. If Engineer work remains, **then** `fail-look`. |
| **2. File a lived miss from the desk** | Type A (who wakes) + Type B leaf (one door on Log) | Founder-discovered pipe miss that doors never saw. Quiet door → select turns + note → same `outside-look`. **Not** Engineer B. **Not** hold → Initiative. |

It is **not** a Travis orchestrator. It is **not** a telemetry table. It is **not** a fifth hold-sheet verb. It is **not** a cousin PR.

---

## Architect defaults (locked unless founder overrides)

| Fork | Default | Why |
|------|---------|-----|
| **N** | **4** | Founder said 3 or 4. Preflight already catches many local misses. Engineer B still gets three recut sittings. The 4th current-head red escalates. |
| **Wake label** | **`outside-look`** (new) | `fail-look` is wired to Engineer B. Reusing it would boot B, not the outside agent. |
| **After outside sitting** | **`fail-look`** if plant incomplete; **nothing extra** if Bucket A plant is complete | Founder: “attaching a label like fail-look … to trigger the engineer.” Complete plant already green-lights via plant-finished. Adding `fail-look` after a complete plant wastes a sitting. |
| **Facet 2 chrome** | **New quiet Log door**, not the hold sheet | Hold → Initiative writes a Travis backlog ticket (`promoteInitiative` → `POST /initiatives`). That is dest work. This is a house-build wake. Second job goes behind a door. |
| **Vehicle** | **This packet (021)**, not a hotfix | New automation, new label, Log face, Action count. SA ascribes the desk→GitHub hang. |

---

## What Engineer B does today (inspect)

There is **no** consecutive-red counter. Each idle current-head red fresh-adds `fail-look`. Engineer recuts **once** and stops. The loop does not escalate.

```109:166:.github/workflows/runtime-doors.yml
      - name: Fresh-add fail-look on the open PR
        if: failure() || cancelled()
        ...
          for hold in wake-sa wake-engineer wake-pm-look fail-look blocker previewing; do
            if echo "$pr_labels" | grep -qx "$hold"; then
              echo "PR #$pr has $hold (handoff/hold). No fail-look."
              exit 0
            fi
          done
          ...
          gh pr edit "$pr" --add-label fail-look
```

Stale SHA already skips (keep `previewing`):

```100:103:.github/workflows/runtime-doors.yml
          head_sha=$(gh pr view "$pr" --json headRefOid --jq .headRefOid)
          if [[ "$sha" != "$head_sha" ]]; then
            echo "Deploy $sha is stale; PR #$pr is now $head_sha. Keep previewing."
```

`previewing` blocks new seats:

```132:136:.github/workflows/wake-packet-seats.yml
            if gh pr view "$pr" --json labels --jq '.labels[].name' | grep -qx previewing; then
              echo "previewing on #$pr. No new seat ($lab)."
              return 0
            fi
```

Plant-finished includes the handoff file (**leave this exception**):

```233:237:.github/workflows/wake-packet-seats.yml
          # Plant finished. src/ or (hotfix + Engineer handoff).
          ...
          if echo "$files" | grep -qE '^(src/|docs/register/ENGINEER-HANDOFF\.md$)'; then
```

Product-face “ticket” today is **not** a house wake:

```1018:1028:src/components/Room.tsx
  const promoteInitiative = useCallback(
    async (turn: Turn) => {
      ...
        const res = await fetch(`/api/session/${sid}/initiatives`, {
          method: "POST",
          ...
          body: JSON.stringify({ foundingTurnId: turn.id }),
```

Hold sheet loud action is **Initiative** (“Writes a ticket. Hands it to Travis.”). Request log lists user turns; it does not file a miss (`src/components/plates/RequestLogDoor.tsx`).

On `main`, the stream-arch canary still mutates if dest works:

```7:7:src/runtime/walks/voice-stream-arch.spec.ts
const DEST_LINE = "Engineer, put this on the notes: stream-arch cue.";
```

098 on [#190](https://github.com/bywale-com/travis/pull/190) already recut that line to acknowledge-only. This packet does not remint 098. If 098 is not merged when Engineer plants 021, the work order still forbids a mutating dest line — do not wait for 098 to learn the wire.

---

## Facet 1 — count, then escalate

### Must

- Keep today’s `fail-look` path for reds **1–3** (idle, current-head, not stale).
- On the **4th** such red since reset: add `outside-look`, **do not** add `fail-look`.
- Reset the count on: `emerge` labeled, or `outside-look` labeled (that sitting owns the miss now).
- Count source: GitHub issue/PR timeline `labeled` events for `fail-look` after the reset. Cheap. No Travis table.
- `outside-look` is a **hold** like `fail-look`: while it is on, doors must not add another `fail-look` or another `outside-look`. Include it in the hold lists in `runtime-doors.yml` and in `strip_seats` / `add_seat` in `wake-packet-seats.yml`.
- Cursor automation **Outside look**: trigger = label `outside-look` added. Prompt = `house-now/automations/outside-look.prompt.md`. Founder Save+Activates. This seat cannot.
- After the outside sitting: labels per [`WORK-ORDER-OUTSIDE.md`](./WORK-ORDER-OUTSIDE.md).

### Must-not

- Count stale-SHA runs.
- Wake Engineer B at N (that is the loop we are breaking).
- Open a cousin PR for the diagnosis.
- Remove Live from preflight or runtime-doors to escape the count.

---

## Facet 2 — file from Log

### Face (Type B leaf)

**Job:** file a lived miss so the outside agent can diagnose without the founder typing a ticket in Cursor.

**Not the job:** dest a seat, write a backlog initiative, list requests.

Parametric: one job per surface — this is a **second** job on Log, so it lives **behind a door**. Quiet until invited (text/icon, not a new section bar). One loud action in the sheet: **File**. No extra borders on every thread row. Do not add a fifth hold-sheet row next to Initiative.

**Chrome (lock live Log first — screenshot `travis-psi` before any plate).** Session header already has Backlog · Requests · Leave (`session-header`). Thread is `thread`. Hold sheet is Copy · Reply · Open in log · Initiative.

Cut:

- Quiet control visible on **Log** only (header cluster, same weight as Requests — not accent). Label **Look** (or SA’s glass string if they pick a quieter word). Not on Voice-only chrome. Not on every turn.
- Opens a portal sheet (same overlay family as hold / Request log: portal + fixed; do not absolute-position under `overflow: hidden`).
- Sheet body: short note field; a list of this room’s recent turns with quiet selected state (hairline / wash / weight — not accent rings on every row). Default selection: the last user turn plus the following assistant turns in that beat, or empty with the note still required. Founder can toggle.
- One loud action: **File**. Dismiss / cancel is quiet.
- After File: sheet closes. No success toast stack. A single muted receipt on the tape is enough if SA ascribes a turn; **do not** invent a turn kind. GitHub taking the label is the wake.

Do not generate a plate from this prose. Screenshot first. Paint only this hole.

### Technical cut (hole for SA)

The door must end with `outside-look` on a **PR**, because Cursor automations in this house wake on PR labels.

| Case | Where the label goes |
|------|----------------------|
| This session’s deploy is an **open PR** preview | That PR. |
| Production psi / no open PR for this SHA | SA ascribes. Architect names the hole: Issue body can hold session id + turn ids + note; something cheap must still produce a PR with `outside-look` (existing hotfix path, or Issue→label Action). **Do not mint a table** unless GitHub Issue + label cannot hold the seed. |

Server-side only. Reuse a GitHub token already in the house if SA says it can (`WAKE_GITHUB_TOKEN` is the label actor today; `TRAVIS_GITHUB_TOKEN` is unfold — do not confuse them). Phone never sees a PAT.

Proposed hang (SA may rename): `POST /api/session/:id/look` with `{ turnIds: string[], note: string }`. Operator must own the room. Empty note + empty selection is a miss (400). Do not call `promoteInitiative`.

### Must-not (facet 2)

- Hold-sheet **Initiative** / `POST /initiatives`.
- Dest Engineer from the File button.
- Always-on checkbox grid on the thread.
- New `travis.look` table from this packet — SA may still refuse a mint after inspect.
- Opening Vercel login to the world so the outside agent can “just open the preview.”

---

## File plan (Engineer, after SA 037)

A new file only when source, speed, or side-effect differs.

| File | What goes in (not code) | Why a file |
|------|-------------------------|------------|
| [`WORK-ORDER-OUTSIDE.md`](./WORK-ORDER-OUTSIDE.md) | Already the work order. Engineer does not rewrite law. | Architect. Landed this push. |
| [`house-now/automations/outside-look.prompt.md`](./house-now/automations/outside-look.prompt.md) | Already the paste. Founder re-pastes at cursor.com/automations. | Architect. Landed this push. |
| `.github/workflows/runtime-doors.yml` | Hold list includes `outside-look`. After idle current-head red: count `fail-look` labeled events since reset; if `count+1 >= 4` add `outside-look` (create label, fresh-add), else `fail-look` as today. Stale SHA unchanged. | Same job, new side-effect. |
| `.github/workflows/wake-packet-seats.yml` | Create `outside-look`. Treat as a seat/hold: `strip_seats`, `add_seat` keep-list, `previewing` block, blocker strip. Plant-finished strips it too (so a complete outside plant can green-light). | Same cheap gate. |
| `src/components/Room.tsx` + small sheet component | Quiet **Look** on Log header; portal sheet; File. SurfaceBoundary: new id `look-miss` (label **Look**), sibling order next to Requests. | Face. |
| `src/app/api/session/[id]/look/route.ts` (or the path SA names) | POST. Auth as other session doors. Body → GitHub per SA 037. | Different source (desk) and side-effect (label). |
| `src/lib/look-miss.ts` (only if grain is not one-screen) | Pure validate: note/selection required. | Different from `promoteInitiative`. |
| Runtime walk | One sequential beat: open Log, open Look, File with a note on the **test** room, expect 2xx and that the Action/label path SA named did not 500. Do not dest Engineer. | 020 cumulative suite. |
| [`PR-AUTOMATION-RULES.md`](./PR-AUTOMATION-RULES.md) | Human table: Nth red → `outside-look`; File from Log → same. | Docs. Architect may land the prose this push; Engineer keeps it in sync if labels shift. |
| Engineer B prompt | If `outside-look` is on: stop (even if they also see a leftover `fail-look`). | Avoid two agents on the same red. |

Do not merge Look into `RequestLogDoor`. Do not hang File on `/initiatives`.

---

## Silence (named — do not invent)

| Silence | Why |
|---------|-----|
| **Travis orchestrator / Temporal / Inngest** | GitHub labels already wake seats. Count is PR timeline. |
| **`travis.look` / telemetry table** | Seed fits in a GitHub Issue/PR body: session id, turn ids, note, deploy URL. Mint only if SA proves that cannot hold. |
| **Disposable dest agent for the canary** | Founder: dest-to-Engineer stays; change the **line**, not the dest. |
| **Recut plant-finished so handoff-only is not a plant** | Founder: leave the exception. Stop writing notes into the handoff. |
| **Remove Live from preflight / runtime-doors** | Founder: keep both sensors. |
| **Hold-sheet File** | Initiative is dest/backlog. This is a house wake. |
| **Cousin PR for outside plant** | Same law as every seat. |
| **Emerge dedupe** | Out of scope. Emerge is per-deployment mail, not this loop. |
| **Save+Activate from an agent** | Founder only. |

---

## SA 037 must ascribe (do not invent in `src/`)

1. Facet 2 persist: GitHub Issue body vs PR comment vs (only if those fail) a store.
2. Production-psi path: how `outside-look` lands on a PR when there is no preview PR.
3. Which token files the label (`WAKE_GITHUB_TOKEN` vs `TRAVIS_GITHUB_TOKEN` vs a new runtime secret). Not `GITHUB_TOKEN` as the Cursor trigger actor — that lesson is already paid.
4. Exact POST path and 4xx/5xx receipts on the tape (or silence: no tape row).
5. Whether the runtime walk may assert the GitHub label or only the HTTP door.

---

## Founder still does by hand

A cloud agent cannot Save + Activate a Cursor Automation. After merge (or on go): new automation, label trigger `outside-look`, paste [`outside-look.prompt.md`](./house-now/automations/outside-look.prompt.md), same environment as Engineer B (so `DATABASE_URL` exists). Re-paste Engineer B if the prompt gains the `outside-look` stop.

---

## I do not plant

No `src/`. No workflow edit from this seat. No table. No automation click.
