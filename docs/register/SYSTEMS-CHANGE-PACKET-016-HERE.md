# SYSTEMS-CHANGE-PACKET-016 — Here is the environment

**Status:** **Signed.** Engineer already planted ([`86423a6`](https://github.com/on-the-day/travis/commit/86423a6) · PR **#112**). This packet **signs**, it does not remint.

**Ascribed by:** Systems Analyst  
**Date:** 2026-09-04  
**Envelope:** [`ENVELOPE-TRAVIS-HERE.md`](./ENVELOPE-TRAVIS-HERE.md) — “SA sits and signs. One PR. Don’t second-PR because SA sat.” The plant is already on `main`. This file is the **sign**, not a second plant.

---

## 1. Envelope (do not paraphrase)

> Travis did not know the room. Backlog sat five open tickets. He said it was empty. That is not a miss. That is a lie about the environment.
>
> **Here is the environment.** Tools are how he looks **deeper**. He does not have to ask to know Dest, who is idle, N in motion, the open titles, the last founder line, the last few things he already said.

Lived: room `0e8875f8`, seq 542–561.

---

## 2. Story (signed)

**Here is the environment.** It is **pushed** — one block, unasked, on the same path as 038 / 048 / 068. Tools are **depth**. A tool miss never contradicts Here. A miss is “no match,” never “the room is empty.”

He stays available. The turn is not the work. Live stays current (`session.update` after token / transcript / tool). He sees the last few things he already claimed, not only the last sentence.

---

## 3. Founder locks (H1–H4)

1. **One Here block, pushed.** Dest · roster idle/busy · N in motion · open backlog titles · last founder line · last few Travis lines. Unasked. Tools open one thing.
2. **Keep Live current.** `session.update` after token / transcript / tool.
3. **Let it see itself.** Last few claims, not only the last sentence.
4. **Depth only.** `list_initiatives` / `search_room` never contradict Here.

---

## 4. Machine (already planted — quote, do not remint)

| Lock | Where it lives now |
|------|-------------------|
| One Here block | `src/lib/room-context.ts` · `hereBlock()` — `Here (already true — tools are depth, not the first look):` |
| Dest | Same block — `Dest ${label}.` Omitted when dest is empty. |
| Roster idle/busy | Same block — `ROSTER_GLANCE` names as `label idle` / `label busy`, then `+N` |
| N in motion | Same block — `In motion: N.` Omitted when zero. |
| Open backlog titles | `backlogPointer` — `Open backlog (N): titles +M more. Already true — do not say the pile is empty.` On zero open: **omit** the line. Do not write “empty.” |
| Last founder line | Already in the 038 turn window (`kind=user` → `Founder: …`). Not a missing store. |
| Last few Travis lines | `TRAVIS_KEEP = 3` — last three Travis `agent_post` rows, kept even when the window would drop them |
| Live current | `src/lib/travis-live-client.ts` · `pushHere` via `session.update` after token / tool / transcript |
| Depth never contradicts Here | `formatInitiativeList`: miss with `q` → `No initiatives matching “q”. N open in this room.` |

**Glance bounds** (`BACKLOG_GLANCE = 5`, `TRAVIS_KEEP = 3`, `ROSTER_GLANCE = 8`) are **what fits in Here**. They are not product caps. A hundred open tickets is fine. Here shows five titles and `+N more`. Tools open the rest.

---

## 5. No new table

038 already pushes a turn window. 048 already lists artifacts. 068 already names Dest. This packet **does not mint** `travis.environment`, a snapshot row, or a Here store. The environment is a **read** of tables that already exist (`voice_session`, `room_membership`, `agent_binding`, `initiative`, `motion`, `voice_turn`).

Last founder line is a `voice_turn` with `kind=user`. If it is not in the window, widen the keep — do not mint a field.

---

## 6. Out of scope (named silences)

- POSIX / unfold.
- Integrations table.
- Cross-room look.
- Cancel-a-plan / digest plate.
- Browse OS.
- `link` kind / founder upload.
- Heard / Hear / Next / Skip.
- Seated Travis.
- Computer use.
- A Here **snapshot table**.

---

## 7. Engineer

**Nothing to plant.** PR **#112** is on `main`. If a later hotfix touches Here, keep the Story: environment is pushed; tools are depth; glance bounds are not caps; a miss is no match.

---

## Verify (already true on `main`)

- Here is one block. Dest first. Roster. N in motion. Open titles. Last founder line in the turn slice. Last few Travis lines kept.
- Live `session.update` after token / tool / transcript.
- `list_initiatives` with a miss never says the room is empty when open tickets exist.
- No new migration.
