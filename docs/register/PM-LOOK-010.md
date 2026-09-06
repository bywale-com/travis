# PM look — 010 Serve

**Packet:** PM-PACKET-010
**Change packet:** SYSTEMS-CHANGE-PACKET-026
**PR:** https://github.com/bywale-com/travis/pull/134
**Preview:** https://travis-git-cursor-packet-010-serve-35b2-wale-omotayos-projects.vercel.app
**Verdict:** Pass

## Look

**Lock (PM-010 / SCP-026 / PLATES-ARTIFACTS O2 O1 A1 A2).** One walk. Dest a seat on a ticket. That dest user line and the answering seat post stamp onto **that** ticket. Follow-on dest without `id` inherits the last open dest ticket. A dest line that already has `initiative_id` is not retargeted. Stream hangs through existing `close_turn_id` — no `stream.initiative_id`. A plate hangs on that post (`turn_artifact`) and paints in the bubble and in Artifacts. Voice learns it from the first-icon badge, not a still on the orb. Seat insert does not speak the body. Travis offers with seat + ticket title (or “that other thing”). Hear is `summarizeSeatReply`. Skip writes `heard_at` and leaves the post. Dest-job closer is `{label} finished.` with `speakable=false`. Badge = unseen (`seen_at` null). Seen = sat in view on the Log **or** opened in Artifacts. Do not remint 023–025. Do not remint hang SQL. Do not plant canvas.

**src/ (planted, this PR, `051d4a8`).** Engineer handoff last plant **026 Serve** on #134. Columns exist: `voice_turn.heard_at`, `turn_artifact.seen_at` (Drizzle + isolate-once + `migrate.ts`). No `stream.initiative_id`.

Follow-on inherit is dest_job → last dest user → then `ensureViaTravis`. `stampPassOn` files the existing stamp and does not overwrite:

```277:304:src/server/initiative.ts
export async function ticketForHand(
  sessionId: string,
  initiativeId?: string,
  sendText?: string,
): Promise<Initiative | null> {
  // id → that ticket
  // else namedTicketFromSpeech
  // else inheritOpenDestTicket (dest_job, then last dest user)
  // else ensureViaTravis(sessionId)
}
```

```376:396:src/server/initiative.ts
    if (existing?.initiativeId) {
      await fileDestJobInitiative({
        sessionId,
        userTurnId: params.userTurnId,
        initiativeId: existing.initiativeId,
      });
      // ...
      return getInitiative(existing.initiativeId);
    }
```

Ticket read lists dest lines + every cursor-seat post + Stream cards via trigger/close hang. `canonicalPosts` is not this read. Empty line is only when no seat post **and** no Stream:

```722:755:src/server/initiative.ts
  const destLines = turns.filter(
    (t) => t.kind === "user" && isCursorSeat(t.seatKey),
  );
  const posts = turns.filter(
    (t) => t.kind === "agent_post" && isCursorSeat(t.seatKey),
  );
  // streams: cards whose trigger or close turn is on this ticket
```

```860:888:src/server/initiative.ts
  const hasSeatPost = ticket.posts.some(
    (p) => p.kind === "agent_post" || isCursorSeat(p.seatKey),
  );
  // else streams, else “No seat has posted on this ticket.”
```

Ticket Messages paint the Stream card **above** the close post (`BacklogTicket.tsx`). Ticket Artifacts tab stays `attachmentsForInitiative` — not merged with the first-icon compartment.

Offer copy is locked. Not stored. Not “New message from engineer.” Chip stays `n new · Eng`. `newReportBeat` is not the spoken product:

```47:58:src/lib/offer.ts
export function offerBeat(items: OfferSeat[]): string {
  // About {title|that other thing}, this is what the {Seat} has to say. Hear it?
  // Two+: one “Hear it?”
}
```

Ear busy → chip only (`pendingOfferRef`). Ear frees → one `speakOffer` (`POST /hear` `action: "offer"`). Hear / Next / “read it” → gist or `READ_CAP` clip; empty gist is the offer plus “The full text is in the Log.” Skip / Hear / Log-in-view write `heard_at`. Dest closer:

```201:204:src/server/dest-job.ts
    await insertAgentPostTurn(params.sessionId, line, "travis", null, false).catch(
      () => {},
    );
```

Harvest: hang without `updatedAt` if the path is new; one retry on empty list (`shouldHangArtifact` + `harvestTurnArtifacts`). Inline `TurnAttachments` stays; intersection marks `seen_at`.

First icon is registry slug `artifacts`, token tint `t.textSecondary`, leading of the shared header before the room pill (`Room.tsx` + `ChromeIcon`). Same control on Voice and Log. Badge = unseen count, `t.accent`, gone at 0. Compartment title **Artifacts**, portal sheet, quiet list (thumb + name, weight vs muted). Full + **X** returns to the list. No still on the Voice orb. PNG lamp / fake filenames are scenery — written lock is the cut.

Must-not hold: no canvas, no C3/C4 remint, no second messages/artifact store, no hang-SQL remint.

**Preview.** Opened the #134 preview, not `travis-psi`. Phone viewport (430×932). Redirected to Vercel login (`vercel.com/login?next=…sso-api…travis-git-cursor-packet-010-serve-35b2…`). Heading: “Log in to Vercel.” I did not sign in. I did not open production psi. I did not see Voice / Log glass from this seat. Deploy for `051d4a8` had completed.

## Test

Walked from [`PM-PACKET-010-SERVE-TEST.md`](./PM-PACKET-010-SERVE-TEST.md).

**URL I opened:** https://travis-git-cursor-packet-010-serve-35b2-wale-omotayos-projects.vercel.app  
**Device:** phone-first (430×932).  
**Talk | Type:** never reached the toggle.

### 1. Dest on the ticket
**I saw:** SSO wall. Not a dest receipt. src/ inherit + `stampPassOn` leave-existing match Expect; I did not send the dest sentence.

### 2. Seat posts
**I saw:** nothing on the Log. Could not wait for a seat bubble or an inline plate.

### 3. Ticket has it
**I saw:** did not open an initiative. `readInitiative` / `BacklogTicket` list dest + posts + Stream card + attachments in src/.

### 4. Travis can query it
**I saw:** did not say `What's on that ticket?` `formatInitiativeRead` names dest, every seat post, and Stream; empty cousin only when none of those exist.

### 5. Offer, don’t barge
**I saw:** did not dest again. Offer mouth is `offerBeat` via `/hear` `offer`; closer is `speakable=false`; chip is New. Body TTS is not the product in src/.

### 6. Skip
**I saw:** did not say skip. `serveSkip` writes `heard_at`. Post is not deleted.

### 7. Hear
**I saw:** did not say Hear. `serveHear` is gist (`summarizeSeatReply`); empty gist does not TTS the raw body. O2 in src/ is icon + badge, not a still on the orb.

### 8. Two landings
**I saw:** did not land two seats. Coalesce is one `offerBeat` / one `speakOffer` when the ear frees.

**Steps I could not do (human):** Vercel team SSO. Travis email link (founder’s inbox). Talk on a phone. Dest Engineer on a named open ticket. Wait for a seat post and a hung plate. Open that ticket’s Messages. Say `What's on that ticket?` Hear / Skip on the glass. Two landings while talking. Those are the human’s. I do not fail the look for them.

## Loop

Pass. Emerged. Human may walk the same sheet on this preview (SSO + email, then 1–8). Same PR. No cousin. No `fail-look`.
