# PM packet 011 — Voice New, reply thread, stay

**Number:** `011` — next PM packet is `012`. Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Technical PM. **SA** ascribes as **027**.  
**When:** Named 2026-09-06. Go + recut same day.  
**Status:** Specified.  
**Wake:** sa
**Test spec:** [`PM-PACKET-011-VOICE-TPM-TEST.md`](./PM-PACKET-011-VOICE-TPM-TEST.md)  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **14:00 UTC 2026-08-25**.  
**Builds on:** 007 / 010 / 026 Hear · 051 New · 009 / 025 / 076 Stream · 073 / 075 Technical PM.  
**Next SA:** **027**.

**Where:** this PR. SA and Engineer commit here.

---

## Founder lock

> Stop ad-libbing in log summaries, especially ending with “do not read” style lines. In voice mode, don’t show “3 new” for PM/Engineer/SA when they’re just existing initiatives.

> the new, it's stale … it just stays stale … you've actually already responded in the chat, and it still keeps continually reading this to renew. It doesn't even take in the fact that there is actually … a new message. … there was no way for it to not be new anymore … after I read it, like lots of times, it still kept reading them.

> I don't even need a hear it, or skip. I don't need those buttons. Travis should already be able to skip, or I can go into the log, and look at those messages, if they … really are new. … there's already something that should say new when new messages. So, only the things after that cutoff are new. … Unless I've already seen those messages, they're not new.

> the curation mechanism is just … a thread, thread of replies and references … after you've created an initiative … sent it to the first person … their replies are replies … back to that initiative and then subsequently to themselves … when Travis or me is responding back to a message and an initiative, we can't like literally reply to that specific message

> it said technical PM timed out. … your stream was showing … I refreshed, and then … you had completed this. What you just said here, I saw it in chat. But then your card, the stream card that should have been above your message … was absent.

> when I scroll down and refresh, wherever I am, it just takes me out of the room and back to the room place. … whenever I refresh, it should just bring me back to exactly where I was.

> Travis, is paraphrasing my request … summarizing it. … the PM … is logging verbatim things. Travis needs to treat what I say, in the very similar way that you log … He just needs to polish what I've said. … keep it the way I've … when it can drop in excerpts, just like the way you log stuff.

> I want … these … augmenting … what you're working on in this hotfix with these items

> we need to just discuss what that means, first of all … What it means for Travis to be logging in this way

---

## Why one packet

One desk walk. New is true. A landing can be seen. A reply hangs on a message. A Stream that finishes still hangs a card. Refresh leaves him where he was. Travis does not replace his words with a summary.

---

## Pocket 1 — New is a landing after the cutoff

**Lived miss:** Voice shows `3 new · PM, Eng, SA` for seats that already have tickets. It stays New after he has read the Log and after he has already answered in chat. A real new landing does not register. Travis keeps reading the old ones.

**Planted:** `listUnheardReports` is every speakable cursor `agent_post` with `heard_at` null (`src/server/serve.ts`). 026 added the column and did not backfill. `newReportChip` prints `N new ·` plus unique shorts (`src/lib/new-report.ts`). Log-in-view writes `heard_at` only when leaving Log for Voice, and only for ids in `seenInLogRef` (`Room.tsx` `switchViewMode`). Intersection threshold is 0.55. Hear / Skip also write `heard_at`. His reply in chat does not.

**Lock:**

- New = a seat post that landed **after** the cutoff **and** he has **not** seen it.
- Seen = sat in view on the Log, **or** he already answered that landing in chat. Write `heard_at` then — not later, not only when flipping to Voice.
- Cutoff = when 026 added `heard_at`. Rows that already existed are seen. SA ascribes the write. Do not remint the column.
- A new landing after the cutoff **registers**. The chip names **that** seat. It does not keep the three old names.
- Travis does not keep speaking old New. Once seen, it is not spoken again.
- Voice may still show the New chip. There are **no Hear it / Skip buttons**. Travis already takes spoken Skip / Hear. The Log is the look.

---

## Pocket 2 — No Hear it / Skip buttons

**Lived miss:** Those two Voice controls. He does not need them.

**Planted:** `Room.tsx` under the orb: **Hear** and **Skip**.

**Lock:** Remove both buttons. Do not replace them with another pair. Spoken Hear / Skip / “read it” stay. Log stays.

---

## Pocket 3 — Initiative curate is a reply thread

**Lived miss:** Curation of a backlog ticket cannot be a thread if he and Travis cannot reply to a **specific** message.

**Planted:** `voice_turn.reference_turn_id` exists. Dest-seat beats already chain: first insert references the user dest line; later inserts reference the previous post (`src/lib/beats.ts` `nextSeatBeat`). The Log / ticket face has no door to pick a message and reply to it. Founder and Travis replies do not set `reference_turn_id` to that bubble.

**Lock:**

- After an initiative is created and sent to the first person, that person’s replies **reference that initiative’s dest / founding line**.
- Their later replies on that ticket **reference their last post** (themselves), unless he points them at another message.
- He or Travis can **reply to a specific message** on that ticket. That write sets `reference_turn_id` to that message. The ticket Messages list is that thread.

Do not remint `reference_turn_id`. SA ascribes the reply door and who writes the column. Do not mint a second thread store.

---

## Pocket 4 — Dest timeout must not eat the Stream card

**Lived miss:** Dest Technical PM. Stream showed. Label **Technical PM timed out.** Refresh. The completed post was on the Log. The Stream card that should sit **above** that post was absent.

**Planted:** Dest timeout (default 120s) calls `finishDestJobsForBinding` → inserts `{label} timed out.` (`speakable=false`) and `failLiveStreamWithoutCard` (`src/server/dest-job.ts`). That close is `status: failed`, `close_turn_id: null` (`src/server/stream.ts`). The card paints only when `closeTurnId === turn.id` (`Room.tsx`). No close turn → no card. A later completed post does not rehang it.

**Lock:** A dest that times out and then **lands a completed post** still hangs the Stream card **above that post**. Timeout must not close the stream with a null close turn. `{label} timed out.` may stay as the quiet dest closer. The card is the record of the stream he watched.

Do not remint `travis.stream`. Do not remint 025 / 076 hang-on-answering-post.

---

## Pocket 5 — Refresh returns him to the same place

**Lived miss:** Pull-to-refresh (scroll down) dumps him on the rooms list.

**Planted:** `Room` boots `plate: "index"` (`Room.tsx`). No last-room persist. Character pick persists (`travis-character`). The room does not.

**Lock:** Refresh (browser reload or the pull-to-refresh that reloads) opens the **same room**, **same view** (Voice or Log), **same Talk|Type**, **same scroll** as before the refresh. It does not open the rooms list unless he was on the rooms list.

---

## Pocket 6 — Technical PM, not catalog PM

**Lived miss:** Glass and dest still say **PM** for catalog `pm`.

**Planted:** Catalog `pm` label `"PM"`. Short **PM**. Sit path `/protocols/pm.md` is already Technical PM. Person dest `technical-pm` is the living bind.

**Lock:** The product PM is **Technical PM**. Catalog `pm` is not dest, not a New name, not a roster chip labeled PM. Spoken / typed “PM” is the Technical PM person. Catalog `pm` is not shown.

Do not mint `/protocols/technical-pm.md`.

---

## Pocket 7 — Gist / restatement does not invent a closer

**Lived miss:** Spoken summaries end with “do not read…” / “full text is in the Log.”

**Lock:** Outcome only. Empty gist = the offer line once. No appended “full text / do not read” sentence.

---

## Pocket 8 — Travis polishes; he does not paraphrase the request

**Lived miss:** Travis summarizes what he said when restating the request.

**Lock (this packet):** When Travis restates the founder, he **polishes** — same points, his words, excerpts where a stamp would quote. He does not replace the request with a shorter paraphrase.

**Held for discussion (not this plant):** Travis becoming the PHASE-ONE-LOG / the person who keeps the trail the way the Technical PM stamp does. See the 09:43 stamp. Do not mint a log store. Do not plant Travis-appends-PHASE-ONE-LOG.

---

## Must / must-not

- New = unseen landing after the cutoff. Seen = Log in view or he already answered.
- No Hear it / Skip buttons.
- Reply-to a specific message on a ticket. `reference_turn_id` is that staple.
- Timeout + later complete → Stream card above that post.
- Refresh = same room, same view, same place in the thread.
- Face says Technical PM. Catalog `pm` is hidden.
- Travis polishes the request. He does not paraphrase it away.
- Do not remint 023–026, `heard_at`, `reference_turn_id`, or `travis.stream`. Do not plant canvas. Do not plant Travis-writes-the-PM-log.

---

## SA 027

Ascribe, quote live rows:

1. Cutoff + when `heard_at` is written (Log in view now; his answering user turn).
2. Remove Hear / Skip buttons; spoken invites stay.
3. Reply door on a message → `reference_turn_id`. Ticket thread is that chain.
4. Dest timeout vs Stream close — do not leave `close_turn_id` null if a post lands.
5. Persist room + view + scroll across reload.
6. Glass / dest map: Technical PM; hide catalog `pm`.
7. Gist instructions + empty-gist recut.
8. Where Travis restates the founder (receipt / dest text / tool write) — polish, not paraphrase.

---

## Verify

Walk [`PM-PACKET-011-VOICE-TPM-TEST.md`](./PM-PACKET-011-VOICE-TPM-TEST.md) on psi, phone, room Travis.
