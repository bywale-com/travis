# Packet 022 — Smarter loop (N reds escalate out)

**Number:** `022` — next packet is `023`. Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Technical Architect. **SA** ascribes as **038**.  
**When:** Named 2026-09-15. Split from 021.  
**Status:** Specified. **Held.**  
**Wake:** hold
**Test spec:** [`PM-PACKET-022-SMARTER-LOOP-TEST.md`](./PM-PACKET-022-SMARTER-LOOP-TEST.md)  
**Sibling (go):** Look is [`PM-PACKET-021-LOOK.md`](./PM-PACKET-021-LOOK.md) on [#194](https://github.com/bywale-com/travis/pull/194). Work order and `outside-look` prompt land there.  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **14:00 UTC 2026-08-25**.  
**Law:** [`docs/BUILD-PROTOCOL.md`](../BUILD-PROTOCOL.md).  
**Meaning:** After **4** current-head `runtime-doors` reds, wake the **outside** agent on the **failing PR** instead of Engineer B. Same agent Look already files.  
**Do not remint:** 020 walks, 021 Look door, dest mail, stream-intent.

**Where:** this PR. Do not open a cousin of 021. Do not plant until **Wake:** sa.

---

## Founder lock

> Building a smarter agent loop. After a certain amount of failures… After a certain amount of failures (especially now that we have preflight) a certain number of production failures triggers a smarter agent to diagnose / specify / and fix (without tripping wires) — we need a detailed spec of working without tripping wires, so agents aren’t rediscovering this every time. Really a spec of the work order.
>
> So this is pretty simple, it’s really just architecture and me setting up the right automation, and also… deciding on what tools we give this external agent that breaks the loop. So maybe around like 3 or 4 runtime failures. This will spin up and… diagnose, like, do exactly what you did. And maybe fix it. So go all the way to merging and then merging into the existing PR that’s failing so that… attaching a label like fail-look or something to trigger the engineer…

> Let's separate the two initiatives into 2 prs. hold on the second initiative - Smarter loop.

Work order without tripping wires: [`WORK-ORDER-OUTSIDE.md`](./WORK-ORDER-OUTSIDE.md) (021). Dest-to-Engineer stays; change the canary **line**. Leave handoff-as-plant. Keep Live in both sensors.

---

## What this packet is

Type A — who owns the recut after N reds.

Count this PR’s current-head `runtime-doors` reds. At **N = 4**, add `outside-look` **instead of** `fail-look`. That agent already exists for 021 Look. Diagnose, specify, maybe plant **without tripping wires**, on the failing branch. If Engineer work remains, **then** `fail-look`.

It is **not** the Look door. It is **not** a cousin PR. It is **not** a telemetry table.

---

## Architect defaults

| Fork | Default |
|------|---------|
| **N** | **4** |
| **Wake** | **`outside-look`** (already 021’s label — do not reuse `fail-look` to boot B) |
| **After outside** | **`fail-look`** if plant incomplete; nothing extra after a complete plant |

---

## What Engineer B does today (inspect)

There is **no** consecutive-red counter. Each idle current-head red fresh-adds `fail-look`. Engineer recuts **once** and stops.

```109:166:.github/workflows/runtime-doors.yml
      - name: Fresh-add fail-look on the open PR
        if: failure() || cancelled()
        ...
          for hold in wake-sa wake-engineer wake-pm-look fail-look blocker previewing; do
```

Stale SHA already skips. `outside-look` as a hold (do not `fail-look` while it is on) is 021’s cheap-gate plant. This packet adds the **count**.

---

## Must

- Keep `fail-look` for reds **1–3** (idle, current-head, not stale).
- On the **4th** such red since reset: add `outside-look`, **do not** add `fail-look`.
- Reset on: `emerge` labeled, or `outside-look` labeled.
- Count source: GitHub issue/PR timeline `labeled` events for `fail-look` after the reset. Cheap. No Travis table.
- After the outside sitting: labels per the work order.

### Count

On a current-head `runtime-doors` red, when the PR is idle (no `wake-sa` / `wake-engineer` / `wake-pm-look` / `fail-look` / `outside-look` / `blocker` / `previewing`):

1. Find the last reset: newer of last `emerge` label-add or last `outside-look` label-add on this PR (or PR open if neither).
2. Count `fail-look` **labeled** events after that reset.
3. If `count + 1 >= 4`: add `outside-look` (**do not** add `fail-look`).
4. Else: add `fail-look` as today (fresh-add).

Stale-SHA reds do not count. Green emerge resets. An outside sitting resets.

---

## File plan (Engineer, after SA 038, after go)

| File | What |
|------|------|
| `.github/workflows/runtime-doors.yml` | After idle current-head red: run the count. Nth → `outside-look`, else `fail-look`. Hold list already includes `outside-look` if 021 planted. |
| [`PR-AUTOMATION-RULES.md`](./PR-AUTOMATION-RULES.md) | Human table: 4th red → `outside-look`. |
| [`docs/BUILD-PROTOCOL.md`](../BUILD-PROTOCOL.md) | Fail path names the Nth-red escalate. |

Do not remint Look. Do not remove Live from sensors.

---

## SA 038 must ascribe

1. Exact `gh` timeline query for the count (issue events vs check-runs). Confirm stale-SHA reds never increment.
2. Whether `outside-look` already on (021) is enough hold, or doors need more.

---

## Silence

N is not a Travis table. Do not mint telemetry. Do not isolate dest to a disposable agent. 021 Look is a different PR.

---

## I do not plant

No `src/`. No Action edit until **Wake:** sa.
