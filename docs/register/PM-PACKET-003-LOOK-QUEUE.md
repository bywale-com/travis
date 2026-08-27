# PM packet 003 — Prototype-ant look + per-seat queue (barge)

**Number:** `003` — next PM packet is `004`. Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Product Manager. For the **Systems Analyst** first on the queue machine, then the **Engineer**. Look (tokens / chrome) is glass in this packet — Engineer may retoken without a new table. Queue store / barge contract = **SA ascribes**. One pocket. Do not lose this.  
**When:** Locked 2026-08-27 — founder: create the packet. Forks already locked (both modes · barge · two icons).  
**Plates:** [`PROTOTYPE-ANT-QUEUE-FACE.md`](./PROTOTYPE-ANT-QUEUE-FACE.md) · C1 [`plates/travis-c1-mode-a-voice-prototype-ant.png`](./plates/travis-c1-mode-a-voice-prototype-ant.png) · C2 [`plates/travis-c2-mode-b-log-prototype-ant.png`](./plates/travis-c2-mode-b-log-prototype-ant.png) · C3 [`plates/travis-c3-mode-b-queue-engineer.png`](./plates/travis-c3-mode-b-queue-engineer.png) · C4 [`plates/travis-c4-mode-a-queue-glance.png`](./plates/travis-c4-mode-a-queue-glance.png).  
**Builds on:** [`PM-PACKET-002-ROOM.md`](./PM-PACKET-002-ROOM.md) (living PR [#4](https://github.com/bywale-com/travis/pull/4)) · room plant on `main` · Hotfix 006 (`agent_busy` retry, do not post SDK as Eng) · Hotfix 007 (in-memory hold of next done-phrase — **no** force/delete chrome).  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **14:00 UTC** — do not overwrite. Read: [`PLATE-READ.md`](./PLATE-READ.md).  
**Does not:** mint tables from PNG; invent a third queue action; jump-the-line instead of barge; default Ant blue; keep planted forest-green as identity; Hub scenery; triage.

---

## Do not miss

**Smartphone web.** 002 room law still holds: Travis is the only voice · Mode A no log · Mode B you-right / agents-left · overlapping thought circles · End session top-right.

This packet adds two things 002 left soft:

### 1. Look — specify harder than 002

002 left color TBD. Planted tokens (`accent #2f5d50`, green pills) kept **placement** and missed the plated **temperature**. C1–C4 are the look. Match them.

**Identity (agent alignment from C-plates — not a generated flag):**

| Role | Temperature | Not |
|------|-------------|-----|
| Page | Cream / off-white (`#FDF8F3` class) | Cool grey, forest-green wash |
| Accent / orb / live Tag | Terracotta / warm orange (`#E07A3D` class) | `#2f5d50` green, Ant default blue `#1677ff` |
| Text | Dark brown (`#2C241C` class) | Pure black chrome, green body text |
| User bubble | Peach / warm sand | iMessage blue, planted green bubble |
| Agent bubble | Cream + warm hairline | Heavy card, green border |
| Wordmark | Serif **Travis** only | Serif on UI chrome |
| UI type | System / Ant sans | Homemade font farm |

**Chrome mapping (prototype-ant, om-co not on this environment):** product tokens on Ant primitives — `Tag` for room/live pills, `Avatar` for seats, text `Button` for End session / Back to voice / View log, icon-only text `Button` for force send + delete. Stroke control icons (Send, Delete) — same library as other controls. Not homemade green capsules. Not an equally spaced avatar **picker** as the thought strip: circles **overlap** (~30%), glow = that seat is thinking.

Recut against om-co method when that repo is visible; do not wait on om-co to plant this pocket.

### 2. Queue — when the addressee already has an active run

Today: Cursor one-active-run → send fails / Hotfix 007 holds one next utterance with no chrome.

**Founder law (locked 2026-08-27):**

- It should **queue**, not fail.
- **Parity:** the waiting line still belongs to **whoever was supposed to get it** (PM / SA / Engineer). One queue **per addressee**, not one anonymous FIFO.
- **Both homes:** Mode A **quiet chip** (C4: `1 waiting · Eng`) **and** Mode B **dashed user rows** under `Queued · {seat}` (C3). Same waiting line; mode switch keeps it.
- **Force send barges the live run** of that addressee. It does not wait for the batch to finish. After barge, that queued line **is** the live send.
- **Two icons only:** force send = send icon · delete = drop that queued line. No third. No kebab. No labels required on the icons.
- Waiting is **not** `[agent_busy]` in the thread.

Glass: queued object is still **your** utterance (right, Mode B). The `· Eng` / `· PM` mark is addressing parity.

**SA ascribes** durable queue + how barge/cancel hits the Cursor run. **Engineer does not mint a queue table.** Hotfix 007 in-memory hold is not the product; this packet is the glass the hold was missing.

---

## Paste — Systems Analyst

```text
You are Travis’s Systems Analyst. Identity: docs/README.md § Systems Analyst · docs/seats/SYSTEMS-ANALYST.md. Log: docs/register/SYSTEMS-ANALYST-LOG.md. Product flag PHASE-ONE-LOG 14:00 is read-only.

Face pocket: docs/register/PM-PACKET-003-LOOK-QUEUE.md + PROTOTYPE-ANT-QUEUE-FACE.md + plates C1 C2 C3 C4.

Do not mint tables from pictures. Do not rewrite the look hex as a second flag. Look tokens are glass; you ascribe stores/contracts.

Ascribe in systems language — deliverable = change packet so Engineer only cuts:

A. Per-addressee queue: waiting lines keyed to PM · SA · Engineer. A line for Eng must not send to PM. Fit vs Hotfix 007 single in-memory hold.

B. Queue item grain: utterance text, addressee, order, session. Materialize vs map-only vs silence. Do not invent from the dashed-border PNG.

C. Barge: force send interrupts that seat’s live Cursor run, then sends that queued item. Quote Cursor SDK/API cancel/interrupt (not memory). Named silence if the API cannot barge.

D. Delete: drop that queued item only. What happens to later items on the same seat.

E. Empty / Completes: no chip when empty; two seats can each have waiting lines; mode switch preserves queues.

F. Fit vs Hotfix 006 (retry agent_busy, never post SDK as Eng) and SCP-002 bindings. Waiting ≠ error row.

G. Look/token retoken is not your packet unless a store must hold theme — default silence.

Stamp SYSTEMS-ANALYST-LOG. Cut SYSTEMS-CHANGE-PACKET-003 (or next number) when Engineer has no analysis left on the queue/barge machine.
```

## Paste — engineer

```text
Read docs/register/PM-PACKET-003-LOOK-QUEUE.md ALL THE WAY THROUGH. Then PROTOTYPE-ANT-QUEUE-FACE.md and PLATE-READ.md. Plates: travis-c1-mode-a-voice-prototype-ant.png, travis-c2-mode-b-log-prototype-ant.png, travis-c3-mode-b-queue-engineer.png, travis-c4-mode-a-queue-glance.png.

You are Travis’s Engineer. Identity: docs/README.md § Engineer · AGENTS.md. You are not PM. You are not SA. Do not overwrite PHASE-ONE-LOG 14:00. Do not append PM/SA logs. Do not mint tables. Do not ship CURSOR_API_KEY. Do not puppet Cursor desktop.

Two buckets:

1. Specified and clear — LOOK. Retoken the room plant to C1–C4 temperature: cream page, terracotta accent/orb/live Tag, dark brown text, peach user bubbles, cream+hairline agent bubbles. Serif only on Travis wordmark. Room/live pills as themed Ant Tags (not green homemade capsules). Mode B thought strip = overlapping circles, glow = thinking — not a picker row. No hang-up button. No default Ant blue. No forest-green identity. Dark theme: keep warm temperature.

2. Specified but not clear until SA change packet — QUEUE MACHINE. Do not invent a queue table or a Cursor cancel call. When SA packet exists: Mode A quiet chip `n waiting · {seat}` with send + delete icons; Mode B `Queued · {seat}` dashed right-side user rows with the same two icons; per addressee; force send barges that seat’s live run then that line sends; delete drops that line; mode switch preserves; never show [agent_busy] as an Eng post.

Hotfix 006/007 stay until SA replaces them. Two buckets only.
```

---

## Five buckets (PLATE-READ)

1. **Copy:** Cream/terracotta room chrome matching C1–C4 (tokens named above) · Ant-themed Tags for `Room · via {seat}` and `{seat} · live` · serif Travis · End session text top-right · Mode A orb + status + tiny subtitle + **View log** · Mode B overlapping thought circles + **Back to voice** + you-right / agents-left log · **Queue both homes:** Mode A chip `n waiting · {seat}` · Mode B dashed right user rows under `Queued · {seat}` · two stroke icons only (force send, delete) · addressing on the queued object.

2. **Do not build:** Email-campaign / Hub scenery on C2 · double-checkmarks as a product receipt · hang-up control · kebab / third queue action · `[agent_busy]` or SDK error as an agent post · jump-the-line (wait for run to finish) as force send · forest-green identity · Ant default blue · equally spaced thought **picker** · full log on Mode A · labels required on the two icons · browser chrome as product.

3. **Implied:** Mode switch preserves the waiting line(s) · chip count matches that addressee’s queue · icons work (barge / delete) · after barge, that line is the live send and leaves the queue · thought glow still means that seat is running · empty queue removes chip and `Queued ·` block · delete does not barge.

4. **Completes:** Empty queue · two seats each with a waiting line · barge while another seat is the live addressee (barge the **queued line’s** seat, not whoever the pills show if they differ) · paused/listening orb still from 002 · dark theme warm recut of the same tokens.

5. **Out of scope this build:** om-co method recut as a gate · third queue action · binding picker UI · durable-queue worker beyond what SA ascribes · cancel-all / flush · triage · external agents · Fieldtop · desktop Cursor puppet · replacing 002 addressing (call-by-name, dead-man) — inherit, don’t rebuild.

---

## Founder comments (preserve)

- Re-imagine existing Travis look in **prototype-ant**. Plant is distant: color and some placement; general look still off. **Specify harder** in this packet.
- Send to an agent with an **active run** should **queue**, not fail.
- **Parity:** whoever was supposed to get the message still gets it.
- Queued options: force send (send icon) and delete. Icons live with the other control icons.
- Forks: **both** Mode A chip and Mode B rows · force send **barges the live run** · **stop with these two icons for now**.
- Backend was out of the plate pass; SA ascribes the machine.
- **Founder: of course create the packet** (2026-08-27).

---

## Do not

- Overwrite the 14:00 flag.
- Mint a queue table in this PM packet or in Engineer source.
- Treat Hotfix 007 pale draft as the locked glass.
- Ship force send as “wait until free.”
- Keep `#2f5d50` as the product accent.
- Freeze C2 teaching copy (campaign, checkmarks) as modules.
- Append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG from the Engineer cut.
