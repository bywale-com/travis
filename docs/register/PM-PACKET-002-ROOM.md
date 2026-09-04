# PM packet 002 — Room (two modes, Travis-only voice)

**Number:** `002` — next PM packet is `003`. Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Product Manager. For the **Systems Analyst** first, then the **Engineer**. One pocket. Do not lose this.  
**When:** Locked 2026-08-27 — founder approved glass from room ideation pass.  
**Plates:** [`ROOM-FACE.md`](./ROOM-FACE.md) · Mode A: [`plates/travis-mode-a-voice-travis-speaking.png`](./plates/travis-mode-a-voice-travis-speaking.png) · [`plates/travis-mode-a-voice-travis-reading-eng.png`](./plates/travis-mode-a-voice-travis-reading-eng.png) · Mode B: [`plates/travis-mode-b-log-compact-thoughts.png`](./plates/travis-mode-b-log-compact-thoughts.png) · [`plates/travis-mode-b-log-sa-thought-expanded.png`](./plates/travis-mode-b-log-sa-thought-expanded.png). Addressing reference: R3–R5 · R8 in `docs/register/plates/`.  
**Builds on:** [`PM-PACKET-001-VOICE-SESSION.md`](./PM-PACKET-001-VOICE-SESSION.md) · SCP-001 plant on `main`. Hotfix 001 (stream) may merge in parallel — not a blocker for SA ascribe.  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **14:00 UTC** — do not overwrite. Read: [`PLATE-READ.md`](./PLATE-READ.md).  
**Does not:** external agents; agents speaking directly to user; triage judgment; mint tables from PNG; auto-wake SA/Engineer chain; replace 001 pipe — **extends** it.

---

## Do not miss

**Smartphone web.** Primary device = phone browser.

### Travis is the only voice (founder law)

- When you are **talking**, you talk **with Travis** (facilitator).
- You may **address** PM · SA · Engineer by name — they **do not talk back**.
- They **post in the message log**; **Travis reads** their posts aloud in **Mode A**, or you **read the log** in **Mode B**.

### Two modes — two views

| Mode | Glass | Read aloud |
|------|-------|------------|
| **A · Voice** | Travis logo · End session **top-right** · pills · orb · **one tiny subtitle** · quiet **View log** | Travis reads (default) |
| **B · Log** | Same header · **Back to voice** · compact thought circles · timestamped log | Off / optional — you're reading |

### Message log (Mode B only)

- **One room log**, timestamp-ordered.
- **You → right.** **Agents → left** with avatar.
- **Thought ≠ post:** thinking lives in compact **overlapping circles** above log (glow = thinking); **no** open thought text by default; **tap** circle to expand thought stream. When done, agent **posts** — post is what Travis may read in Mode A.
- **Reference reply:** thin **left rail** + muted italic quote inside agent bubble — not a heavy nested card.

### Addressing (inherits room thread; ship when SA/engineer can)

- **Default addressee** = PM (modular later).
- **Call by name** → Travis routes to that seat.
- **Dead-man** after silence: last agent asks *“Are you talking with me?”* · **No** → PM · **No, X** → X.
- **Ambiguous utterance:** Travis asks *“Who was that meant for?”*

**SA:** ascribe stores/contracts for the above. **Engineer:** do not plant until SA change packet exists.

---

## Paste — Systems Analyst

```text
You are Travis’s Systems Analyst. Identity: docs/README.md § Systems Analyst · docs/seats/SYSTEMS-ANALYST.md. Log: docs/register/SYSTEMS-ANALYST-LOG.md. Product flag PHASE-ONE-LOG 14:00 is read-only.

Face pocket: docs/register/PM-PACKET-002-ROOM.md + ROOM-FACE.md + plates A1 A2 B1 B2.

Do not mint tables from pictures. Do not freeze example copy as law.

Ascribe in systems language — deliverable = change packet(s) so Engineer only cuts:

A. Mode flag: voice vs log view — what session state holds; switch preserves one session.

B. Addressee router: default PM · call-by-name · dead-man · “who was that meant for?” — state machine, not UI copy only.

C. Thought vs post: thought stream (banner/circles, not spoken) vs posted message (log row, Travis-readable). Promotion thought → post.

D. Agent seats: PM · SA · Eng only — bindings / agent ids / which Cursor agent each seat uses (extends SCP-001 single binding).

E. Facilitator read path (Mode A): Travis TTS attributes agent posts (“Engineer says…”) from log rows — hygiene: no thinking/tool spam.

F. Log query shape: one ordered thread; user right / agent left is presentation; store grain is your call.

G. Fit vs SCP-001 on main: what 001 already houses; what 002 adds; name silences.

Stamp SYSTEMS-ANALYST-LOG. Cut SYSTEMS-CHANGE-PACKET-002 (or next number) when Engineer has no analysis left.
```

## Paste — engineer

```text
Read docs/register/PM-PACKET-002-ROOM.md ALL THE WAY THROUGH. Then ROOM-FACE.md and PLATE-READ.md. Plates: travis-mode-a-voice-travis-speaking.png, travis-mode-a-voice-travis-reading-eng.png, travis-mode-b-log-compact-thoughts.png, travis-mode-b-log-sa-thought-expanded.png.

You are Travis’s Engineer. Identity: docs/README.md § Engineer · AGENTS.md. Wait for SA change packet before planting room machine — this PM packet is the glass.

When assigned SA packet: build on SCP-001 plant + merged Hotfix 001 if on main.

Mode A — Voice:
- Shared header: Travis serif logo top-left, End session top-right (small, NOT bottom bar).
- Room pills (e.g. Room · via Eng, Eng · live).
- Center orb + status (Listening / Travis speaking).
- ONE tiny subtitle line — glance only, not full log.
- Quiet View log link. NO message bubbles on Mode A.

Mode B — Log:
- Same header. Back to voice link.
- Compact overlapping thought circles PM SA Eng; glow = thinking; tap to expand thought (B2).
- Log: user right, agents left, avatars, timestamps.
- Reference reply: thin left rail + muted quote inside bubble.
- Play reply optional in log mode.

Agents never speak directly to user — Travis reads in Mode A.

Do not mint tables SA refused. Do not append PM/SA logs. Two buckets only.
```

---

## Five buckets (PLATE-READ)

1. **Copy:** Shared header (Travis serif + End session top-right) · room pills · **Mode A:** orb · status · tiny subtitle · View log · **Mode B:** Back to voice · compact thought circles · scrollable log · user right / agents left · quote rail on reference replies · play optional on agent posts · End session always top-right.

2. **Do not build:** Full log on Mode A · agents talking directly to user · always-open thought text strip · bottom End session bar · user and agent bubbles same side · heavy nested quote cards · external agents · browser chrome as product · teaching example copy as modules.

3. **Implied:** One session across mode switch · tap thought circle expands (B2) · thought not spoken until post · Travis attributes agent name when reading · call-by-name updates pills · default PM when modular not shown.

4. **Completes:** Dead-man voice prompt (R3) · “Who was that meant for?” (R8) · thought→post collapse into left bubble · addressing chips update on call/switch · paused/listening orb variants · color system (founder TBD — use plate palette until recut).

5. **Out of scope this build:** External AI agents · ambient speak-without-post · PM→SA→Engineer auto-wake · triage/compression bar · Fieldtop primary · desktop Cursor puppet · auth product beyond session already in SCP-001.

---

## Founder comments (preserve)

- Main goal remains: speak with PM; room expands who you address — **you always talk with Travis** in voice mode.
- **Two modes both exist:** voice = Travis only on glass; log = separate view you switch to.
- Agents **message in chat**; **Travis reads** (Mode A). In log mode you read yourself.
- **Likes F2 shell:** Travis logo · **End session at top** next to header — keep.
- Log: **user right, agents left** — prior plate wrong when same side.
- Thought area: **compact overlapping circles**, glow = thinking, **tap** for thought log — not always visible open text.
- Reference reply: **dislikes** heavy nested card — use **minimal quote rail**.
- Seats v1: **PM · SA · Engineer only.**
- Addressing: default PM · call by name · dead-man · “No” → PM · “No, X” → X · “Who was that meant for?” when ambiguous.
- **Founder approved this packet 2026-08-27** — ready for SA ascribe, then Engineer.

---

## Do not

- Overwrite 14:00 flag.
- Ship agents speaking without Travis in Mode A.
- Show message log on Mode A.
- Put End session as big bottom button.
- Mint room machine before SA packet.
- Append PHASE-ONE-LOG or SYSTEMS-ANALYST-LOG from engineer cut.
