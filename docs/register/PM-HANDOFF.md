# PM seat handoff — 2026-09-07 12:20 UTC

**This bind is done.** Last Technical PM: `bc-25c5c6bf-006f-4252-9f25-49ab183835b2`. The next bind pastes the block at the bottom into a **new** chat. Do not start from a transcript. Do not keep talking as the living PM from the old `bc-`.

**Flag:** PHASE-ONE-LOG **14:00 UTC 2026-08-25** — do not overwrite.

**Seat:** Technical PM. Inspect `src/`. Spec face + technical cut. Keep the log. Do not plant. Do not mint tables.

**Room Travis:** `0e8875f8-283b-4dae-bf54-76c82a05b6ef`  
**Production:** `https://travis-psi.vercel.app` (open desk unless `TRAVIS_OPEN_DESK=0`)

**Rebind:** hang still points at the old bind (`technical-pm` → `bc-25c5c6bf-…`, path `/protocols/pm.md`). After the new chat has a `bc-`, Founder / Engineer rebinds. Do not mail catalog `pm`. Do not mint `/protocols/technical-pm.md`. Do not remint `hang-technical-pm.sql` as a new packet — update `cursor_agent_id` on the living person row. After this PR is on `main`, Engineer refiles house (`docs/register/house-now/file-house.ts`) so Travis’s `/protocols/pm.md` matches the repo.

---

## Where we stopped

| What | Where |
|------|--------|
| Trail | [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) — Current is **12:20 UTC 2026-09-07**. Flag **14:00**. |
| 013 | [`PM-PACKET-013-LIST-LIVE.md`](./PM-PACKET-013-LIST-LIVE.md). SA **029**. [#144](https://github.com/bywale-com/travis/pull/144) **merged**. Hobby `maxDuration` **60**. Hard refresh to see a row is Fail. |
| 012 | [`PM-PACKET-012-USABLE-CHAT.md`](./PM-PACKET-012-USABLE-CHAT.md) · story [`USABLE-CHAT.md`](./USABLE-CHAT.md). SA **028**. [#142](https://github.com/bywale-com/travis/pull/142) **merged**. Do not remint. |
| 011 | [`PM-PACKET-011-VOICE-TPM.md`](./PM-PACKET-011-VOICE-TPM.md). SA **027**. [#140](https://github.com/bywale-com/travis/pull/140) **merged**. Hear it / Skip buttons stay **off**. |
| 010 | [`PM-PACKET-010-SERVE.md`](./PM-PACKET-010-SERVE.md). SA **026**. [#134](https://github.com/bywale-com/travis/pull/134) **merged**. |
| Next | PM packet **014**. SA **030**. Hotfix **079**. Only from new lived smoke. |
| Travis vs this seat | [`TRAVIS-AS-PM.md`](./TRAVIS-AS-PM.md) — Travis = face PM. Dest Technical PM = the cut. Write-port **not planted**. |
| Held | Travis write-port. Canvas / 022 ports on [#120](https://github.com/bywale-com/travis/pull/120). Grok Bot orchestra — discussed, not locked. House [#139](https://github.com/bywale-com/travis/pull/139). |

---

## Next PM job

1. Accept. Paste the block below. Read **Current**, then the newest stamp, then this file.
2. Human walk **012** and **013** on **psi** (not a preview). Look Passes in this bind hit Vercel SSO and never opened the Log — those are not use.
3. Do not remint 011 / 012 / 013 / 027 / 028 / 029.
4. Cut **014** or hotfix **079** only from new lived smoke.
5. After you have a `bc-`, get hung as the living Technical PM person. Catalog `pm` stays put.

---

## Must-not

- Do not overwrite the 14:00 flag.
- Do not plant `src/` except a deploy blocker already cut.
- Do not remint 011–013 / 027–029. Do not remint `heard_at`, `reference_turn_id`, `turn_artifact`, `travis.stream`, `seq`, hang SQL, the cutoff UPDATE, or the 029 index.
- Do not put Hear it / Skip buttons back.
- Do not Pass a look that never opened the Log / psi.
- Do not mint `/protocols/technical-pm.md`.
- Do not fold Grok orchestra into a desk packet.
- Do not merge leftover cousin PRs: **#124 #122 #121 #118 #113**. **#120** is 022 (signed, living, conflicting) — do not remint. **#139** House — do not merge as leftover.
- Wake is its **own line**: `**Wake:** hold` or `**Wake:** sa`. Do not tuck it onto Status.

---

## Seat / protocol (so you sit this seat)

The **job** is written. The **Cloud always-on** is not this seat.

| Layer | What it is |
|-------|------------|
| Always-on (Cloud) | Repo-root `AGENTS.md` — first line is **Engineer**. If this chat seated you as Technical PM, **stop implementing** and accept the paste. |
| House hang | `/protocols/pm.md` — same file for catalog `pm` and person `technical-pm`. You may be hung as `technical-pm` (or `technical-pm-N`). Catalog `pm` is not you. |
| Practice | [`../seats/PRODUCT-MANAGER.md`](../seats/PRODUCT-MANAGER.md) |
| Identity | [`../README.md`](../README.md) Product Manager |
| Trail | This log. Chat is thrown away. |
| Packet chain | [`AUTOMATION-PACKET-CHAIN.md`](./AUTOMATION-PACKET-CHAIN.md) |

Founder asked this bind (2026-09-07): is the system message and this Technical PM seat well documented? Honest: process on paper, yes. System message for a Cloud Technical PM, no — Engineer `AGENTS.md` wins unless you paste. The hang file was missing the `technical-pm` line; that line is now on `/protocols/pm.md`.

---

## This chat (printed) — ideation order

Founder (2026-09-07): *Send what we've talked about in this chat, like when you print it out to me, when you are sending this request as well, so it can log that too.* Then: get the seat ready to pass to another Technical PM.

Same bind: `bc-25c5c6bf-006f-4252-9f25-49ab183835b2`. Flag 14:00 stands. Founder later: he does not care what “v1” is called — he cares what the app is **right now** and that existing features work.

### 1. Wake hold / 011 did not boot Cursor

First 011 push had `**Wake:** hold` (correct silence). A go recut wrote `**Wake:** sa` **on the Status line**. Action greps a **whole line** `^**Wake:** sa`. Log said “on hold.” No `wake-sa`. House push did not touch the packet.

**Lock:** Wake is its own line. Do not tuck it onto Status. Landed on 011; SA 027 booted. Canon in `PM-PACKETS.md` / `AUTOMATION-PACKET-CHAIN.md`.

### 2. Travis as conversational PM (process, not a plant)

**Founder:** Vision is talked with Travis, not dest’d to Technical PM. Capture is unprompted (like PM stamps). Room first; repo = reference. No loss: Technical PM must see it when checking.

**Lock:** [`TRAVIS-AS-PM.md`](./TRAVIS-AS-PM.md). Travis = PM of the **face**. Dest `technical-pm` = the **cut**. Write unprompted when load-bearing. One trail = `PHASE-ONE-LOG.md`. **Write-port not planted.** Do not fold into 027.

### 3. Travis vs Grok Bot (vision talk)

**Similar:** Named someone above the IDE; thread; phone; work moves when you are not at the desk.

**Split:** Grok Bot = teammate you give a job and leave (own computer, logins, parallel bots, routines). Travis = voice pipe to Cursor as it exists + PM you talk to while building. Eyes-free. Capture.

**Short:** Grok Bot is a **worker you hire**. Travis is a **wire you wear**. Do not collapse them.

### 4. Grok Bot uses *for this house* (not integration)

Around the loop, not in it: desk watch (wake-sa / SA URL / psi deploy); morning house ritual as a routine; leftover cousin janitor with confirm; live plates from psi; Cursor/SDK changelog; usage-bar sample.

**Not:** the room, the trail, dest seats, `src/`, flipping Wake, Look Pass/Fail.

### 5. Travis beyond build / Grok Bot orchestra (discussed, not locked)

**Founder:** Travis is build-focused; rooms already have the shape; Cursor need not be the only backend; one app vs “just talk to Grok Bot”; Travis coordinates Grok Bots / a chief of staff.

**Alignment:** Same reason he does not open Cursor. Smarter = routing, not personality. **Not a lock. Not 027. Not a store.** Held.

### 6. Pipe tests in this chat

- “Say something I’m testing” → short speakable reply.
- “Print an existing image, no generate plate” → `docs/register/plates/travis-t2-voice-paper.png`. **Did not populate in the Log.** Markdown/local path is not `turn_artifact`.

### 7. Packet 011 / 027 — Voice New, reply thread, stay

Pockets: New after cutoff + seen now; **no Hear it / Skip buttons**; reply to a specific message (`reference_turn_id`); dest timeout must not eat Stream card; refresh stays; Technical PM not catalog `pm`; gist outcome only; Travis polishes, does not paraphrase.

[#140](https://github.com/bywale-com/travis/pull/140) merged. Look 011 Pass never opened the Log (Vercel SSO). Founder: look is not use.

### 8. Packet 012 / 028 — Usable chat (the Log is a chat)

**Founder:** App generally unusable. Enough logs — stop making him specify. Reply to a reply does not dest that person. Forget Voice. Text side unusable. Images don’t populate. Engineer keep working with computer use until cohesive. “It’s just a chat app.” Later: forget “v1” / “don’t mint tables” as excuses — **look at the app**.

**Story:** [`USABLE-CHAT.md`](./USABLE-CHAT.md)

**Locks:** Reply dests **that message’s author**. Reply-to-reply dests **that** author. Staple stays. Picture visible in the Cursor turn hangs **under that Log post** (`turn_artifact`, image|file). Ticket Reply **stays on that ticket**. Quote names **who**. Walk is Log / Type on **psi**. Pass from `src/` only is a miss.

Lived walk (computer-use on psi, before plant finished): Send works. Images = paths; Artifacts empty. Ticket Reply leaves the ticket. Quote has no who.

[#142](https://github.com/bywale-com/travis/pull/142) merged after look Pass + green Vercel. Human walk on psi still open.

### 9. Packet 013 / 029 — The room stays live

**Founder:** Messages, backlogs, etc. populate too slowly or not at all until hard refresh.

First cut (void): smarter poll. Founder: **too provincial**.

**What Cursor/Claude use:** durable tape + one live wire (SSE) + resume from last id. Hard refresh = re-read from zero. They never need that for a new line.

**Recut lock:** One **room SSE** while he is in the room. Resume from `voice_turn.seq` / `Last-Event-ID`. Other-request writes `NOTIFY travis_room`. Never blank a list on a failed GET. Backlog list is a list (not N+1). Poll is **fallback only**. 023 room-bus silence **opens**. No second websocket.

Vercel fail on #144: `maxDuration = 800` on Hobby. Set **60**; reconnect is the no-loss.

[#144](https://github.com/bywale-com/travis/pull/144) merged.

### 10. House #139 / leftover cousins — not merged

Merged **142** and **144** only (plus earlier 138 / 134 / 140 in this bind). Do not merge leftovers as leftovers.

### 11. Dest this print / pass the seat (2026-09-07)

**Founder:** Send the printed chat to Technical PM so it logs. Then: is this seat’s system message / protocol well documented? Then: get the seat ready to pass.

This file + the 12:20 stamp **are** that dest. Successor reads them. Old bind stops.

---

## Landed on `main` this bind (do not remint)

| PR | What |
|----|------|
| #138 | Wake hold |
| #134 | 010 Serve |
| #140 | 011 / 027 Voice stay |
| #142 | 012 / 028 Usable chat |
| #144 | 013 / 029 Room wire + Hobby `maxDuration` 60 |

---

## Read order (new chat)

1. Paste below, then [`../README.md`](../README.md) Product Manager identity  
2. This file  
3. [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) — Current, then newest stamp, then **14:00** flag  
4. [`../seats/PRODUCT-MANAGER.md`](../seats/PRODUCT-MANAGER.md)  
5. [`TRAVIS-AS-PM.md`](./TRAVIS-AS-PM.md) · [`USABLE-CHAT.md`](./USABLE-CHAT.md)  
6. Packets 012 + 013 + their tests  
7. Planted `src/` when the fork is about what is already true  
8. [`ENGINEER-HANDOFF.md`](./ENGINEER-HANDOFF.md) — last plant 029 (do not append it)

---

## Paste for the new chat

```text
You are Travis’s Technical Product Manager. Read docs/README.md “Product Manager — identity” and accept it. You are not the Systems Analyst. You are not the Engineer.

Repo-root AGENTS.md will try to seat you as Engineer. Stop implementing. You are the Technical PM: inspect src/, spec face + technical cut, keep the log. Do not plant. Do not mint tables.

You may be hung as technical-pm (or technical-pm-N). Catalog pm is not you. Same protocol: /protocols/pm.md. Do not mint /protocols/technical-pm.md.

Keep docs/register/PHASE-ONE-LOG.md (append unless I mark a separate entry). Read docs/register/PM-HANDOFF.md first (this bind is done; you are the successor). Then Current at the top of the log, then the newest stamp, then docs/register/PHASE-ONE.md. Flag 14:00 UTC 2026-08-25 — do not overwrite.

Capture founder wording; do not generate substitute flags. Ask at inflections. Cadence ≥4 stamps/day in session. Do not remint 011–013 / 027–029. Do not put Hear it / Skip buttons back. Do not Pass a look that never opened the Log on psi.

Detailed: docs/seats/PRODUCT-MANAGER.md.
```
