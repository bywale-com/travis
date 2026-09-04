# Systems change packet 014 — Split beats + Voice create-agent

**Number:** `014` — next systems packet is `015`. Never reuse a number.  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-04  
**Decision:** **Close a beat when the incoming post is not a growing snapshot of the same message.** Same insert/update law as Live Travis (`nextLiveTravisText`). First beat quotes the founder line; each next beat quotes the last post from that seat. **Sign** `create_agent` as the Voice write of the planted V4 screen. No role. No seated.  
**Founder lock:** If it is visible in the Cursor chat, it is visible here. One growing bubble is the bug. Create / in-the-room / seated stay three moments — Voice create does **not** attach a protocol.  
**Glass:** [`PLATES-LOG-FACE.md`](./PLATES-LOG-FACE.md). L1 + L3 + dest-seat hang are **064** — do not remint. **L2** look signed: three ENG bubbles; first quotes the founder; each next quotes the last ENG; files hang on the beat that made them.  
**Engineer handoff leftover:** Travis Voice create is SA; what closes a beat is SA.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

---

## Intent

`absorbStreamingAgentPost` keys one `agent_post` on `userTurnId` + `seatKey`. Every iterative post in the same Cursor run overwrites that row. L2 is three posts, one run. Live Travis already knows insert vs update (`nextLiveTravisText`, 059). Dest seats do not. Apply that law. Quote rail is already `referenceTurnId` on the Log.

Travis told the truth at 15:15: he has no create tool. V4 is planted. Effect parity: the same write from Voice.

---

## Stood-up truth (quote, not memory)

```220:244:src/server/seat-pipe.ts
export async function absorbStreamingAgentPost(params: {
  sessionId: string;
  userTurnId: string;
  seatKey: SeatKey;
  text: string;
}): Promise<VoiceTurn> {
  // … existing WHERE kind=agent_post AND referenceTurnId=userTurnId AND seatKey
```

One row per user turn per seat. That is the growing bubble.

```11:26:src/lib/absorb-text.ts
export function nextLiveTravisText(
  prev: string,
  incoming: string,
): { mode: "update" | "insert"; text: string } {
  // prefix / snapshot → update; else insert
```

Used for dest-Travis Live. Not used for dest-seat `agent_post`.

```303:312:src/server/cursor-port.ts
      if (e.type === "assistant") {
        const chunk = textFromAssistantMessage(e.message?.content);
        if (chunk) {
          const next = absorbText(postText, chunk);
          // … one postText for the whole run
```

The port already folds every assistant event into one string before the pipe can split.

Create is HTTP `createAgentBinding` — name / model / repo / ref. Prompt: `You are ${label}. You sit in a Travis room.` No Travis tool. `room_membership.role` is `member` | `facilitator` only.

---

## Must / must-not

### Must — split beats

- **Closer:** treat dest-seat posted text with the same insert/update law as `nextLiveTravisText`.  
  - `update` → keep growing the **current** `agent_post` (snapshot / prefix).  
  - `insert` → **close** that row (leave its text) and **insert** a new `agent_post`.
- **Quote chain:**  
  - Beat 1 `referenceTurnId` = the user turn (founder line).  
  - Beat *n* `referenceTurnId` = the previous `agent_post` for that seat in this run (last ENG).  
  Do not keep pointing every beat at the user turn — that is why absorb collapses them.
- **Port:** `cursor-port` must not fold a new assistant message into the previous `postText` when `nextLiveTravisText` would `insert`. Yield a beat boundary the pipe can see (`post_beat` or a `post_delta` that does not share a prefix — pick one, test it). `conversation()` fallback that joins all `assistantMessage` steps with `\n\n` must **not** re-glue split beats into one row at `done`.
- **Artifacts:** hang new `image` | `file` on the **current** beat (the open `agent_post`). When a beat closes, later files go on the next beat. Same kinds as 009/064. No `link` kind.
- Log already quotes `referenceTurnId`. Plant L2 on that rail. No new table.

### Must — Voice create

- Travis tool `create_agent` `{ label, model?, repository?, ref?, join? }`.  
  - `label` required (same “Name the agent” as V4).  
  - `model` / `repository` / `ref` optional — same `Agent.create` shape 011 already fixed.  
  - `join` default **true**: also insert `room_membership` in **this** room (`role=member`). `join: false` = catalog only. Two writes, two moments — not a role.  
  - Prompt stays the one-line stub. No protocol. No `seat_key` minted from “Engineer” as seated-as.  
- Same function as V4 (`createAgentBinding` + existing add-to-room). Do not a second create path.  
- 040: `create_agent` = **write**.  
- `TRAVIS_SYSTEM`: you can create a person (name, optional model/repo). You do not assign a role. You do not invent a Cursor id.

### Must-not

- Remint L1 / L3 / dest-seat hang (064).  
- `link` / structured artifact kind / founder upload.  
- Seated link / protocol on create.  
- A create tool that only works when dest is Engineer.  
- A product cap on how many agents or how many beats.  
- POSIX, Browse OS, heard, integrations table.  
- Glue split beats back together at `run.wait` / `conversation()`.

---

## Stores

**No new table.** `voice_turn` already has `kind=agent_post`, `referenceTurnId`, `seatKey`. Membership already has join.

---

## Runtime

```text
dest-seat stream
  post snapshot of same message → UPDATE current agent_post
  post that is a new message   → INSERT agent_post
       reference = previous post (or user turn if first)
  harvest                       → current beat

create_agent
  createAgentBinding(label, model, repository, ref)
  if join !== false → room_membership this session, role=member
```

---

## Ports / tools

| Port | 014 |
|------|-----|
| Beat insert/update (`nextLiveTravisText`) | **Real** — dest seat |
| Quote chain `referenceTurnId` | **Real** — already on glass |
| Artifacts on current beat | **Real** — kinds unchanged |
| `create_agent` | **Real** — V4 write |
| `link` kind / upload | **Refused** |
| Role at create | **Refused** |
| L1 / L3 | **064 — do not remint** |

---

## Verify

1. One dest-Engineer run that posts three times (L2): **three** `agent_post` rows. First `referenceTurnId` is the user turn. Second references the first ENG. Third references the second. Log shows three bubbles + quote rails. **Zero** extra `initiative` rows unless they Held.
2. Image + file produced on the middle beat hang on **that** row, not on beat 1 or 3.
3. A single growing sentence (token snapshots) stays **one** row.
4. `conversation()` fallback after a dead stream does not merge the three texts into one row.
5. Voice: “Spin up another engineer seat, name it Eng 2.” → new `agent_binding` + `room_membership` in this room. Prompt is the stub. `role` is `member`. Roster shows them. V4 of the same name still works (unique slug).
6. `create_agent` with `join: false` → binding, no membership.
7. `tool-policy` includes `create_agent`. No executing/agent cap.

---

## Out of scope

- Heard / Hear / Next / Skip / urgency (still silence).  
- Seated (agent → protocol).  
- `link` kind.  
- 064 look (already planting).

---

## Engineer handoff

Stop keying dest-seat absorb on `userTurnId` alone. Use insert/update. Chain `referenceTurnId`. Harvest on the current beat. Add `create_agent` as V4. Do not remint 064. Do not append SA or PM logs.
