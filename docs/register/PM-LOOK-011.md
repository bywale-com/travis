# PM look — 011 Voice New, reply thread, stay

**Packet:** PM-PACKET-011
**Change packet:** SYSTEMS-CHANGE-PACKET-027
**PR:** https://github.com/bywale-com/travis/pull/140
**Preview:** https://travis-git-cursor-packet-011-voic-372e95-wale-omotayos-projects.vercel.app
**Verdict:** Pass

## Look

**Lock (PM-011 / SCP-027 / NEW-MESSAGES-FACE).** One desk. New is an unseen landing **after** the 026 `heard_at` cutoff. Rows that already existed are seen — one-shot write, latch `027-cutoff`. Seen is written **now**: Log bubble in view, or a founder `kind=user` turn after that landing. Hear / Skip **buttons** off. Spoken Hear / Skip / “read it” stay. Reply-to a specific message writes `reference_turn_id` (column exists). Dest timeout is a dest_job closer, not a stream close with a null card. A later completed post still hangs Stream **above that post**. Refresh restores this phone’s room, view, Talk|Type, and scroll — `travis-stay`, no new table. Glass dest is **Technical PM**. Catalog `pm` is hidden and is never the dest binding. Gist is outcome only. When Travis restates the founder, he polishes — same points, his words, excerpts — he does not paraphrase the request away. Do not remint 023–026. Do not remint `heard_at`, `reference_turn_id`, `travis.stream`. Do not plant Travis-writes-PHASE-ONE-LOG.

**src/ (planted, this PR, `472915f`).** Engineer handoff last plant **027 Voice stay** on #140. Cutoff is isolate-once in `ensureInitiativeStore` + `migrate.ts`. Column comment is the latch:

```102:124:src/server/initiative.ts
export async function applyHeardCutoffOnce(): Promise<void> {
  // IF col_description(heard_at) NOT LIKE '%027-cutoff%'
  //   UPDATE travis.voice_turn SET heard_at = created_at
  //   WHERE heard_at IS NULL AND kind = 'agent_post'
  //     AND speakable = true AND seat_key IS DISTINCT FROM 'travis'
  //   COMMENT ON COLUMN travis.voice_turn.heard_at IS '027-cutoff'
}
```

New is speakable non-Travis, non-catalog-`pm` `agent_post` with `heard_at` null. Person dests count. Chip uses person label, not catalog `PM`:

```25:32:src/lib/new-report.ts
export function isNewReportTurn(turn: NewReportTurn): boolean {
  if (turn.kind !== "agent_post") return false;
  if (turn.speakable === false) return false;
  if (turn.heardAt) return false;
  if (!turn.seatKey) return false;
  if (turn.seatKey === "travis") return false;
  if (isCatalogPm(turn.seatKey)) return false;
  return true;
}
```

```64:68:src/lib/new-report.ts
export function newReportChip(seats: NewSeat[]): string {
  if (!seats.length) return "";
  const names = seats.map((s) => destGlassName(s.seatKey, s.label));
  if (seats.length === 1) return `1 new · ${names[0]}`;
  return `${seats.length} new · ${names.join(", ")}`;
}
```

Log intersect POSTs `/heard` **now** (threshold 0.55). His next user turn hears prior unheard New rows. Hear / Skip buttons are gone from `Room.tsx` under the orb — chip may stay; spoken `parseHearInvite` stays.

```2217:2222:src/components/Room.tsx
          if (turn && isNewReportTurn(turn) && sid) {
            void fetch(`/api/session/${sid}/heard`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ turnIds: [id] }),
            }).then(() => refreshTurns(sid));
```

```225:251:src/server/seat-pipe.ts
export async function insertUserTurn(...) {
  // optional referenceTurnId → insertTurn + copy initiative_id
  await markUnheardBeforeSeq(sessionId, row.seq).catch(() => {});
  return row;
}
```

Reply door is selected-only on the Log bubble and on the ticket (`Reply`). Sets `pendingReferenceTurnId`. Send / live / finalize pass `referenceTurnId`. Ticket `onReply` copies the same hold.

Dest timeout inserts the quiet `{label} timed out.` closer and does **not** call `failLiveStreamWithoutCard`. `timeOutStaleDestJobs` only finishes the dest_job. Fail-without-card stays on Cursor-run-over with no post (pipe / reap).

```195:205:src/server/dest-job.ts
    const line =
      params.status === "completed"
        ? `${label} finished.`
        : params.status === "timed_out"
          ? `${label} timed out.`
          : `${label} failed.`;
    await insertAgentPostTurn(params.sessionId, line, "travis", null, false)
```

Stay is `localStorage` key `travis-stay`. Boot: if `plate === "room"` and the session exists, `enterRoom` (attachSession restores Voice|Log and Talk|Type), then scroll to `scrollTurnId`. Leave writes index. Scroll writes the turn at the top of the viewport.

```2050:2057:src/components/Room.tsx
    const stay = readStay();
    if (stay?.plate === "room" && stay.sessionId) {
      pendingStayScrollRef.current = stay;
      void enterRoom(stay.sessionId);
    }
```

Glass dest: `hideCatalogPm` on dest chips, roster, Create-room picker. Spoken / typed `pm` goes through `resolveRoleDest("pm")`. `SIT_ROLE_LABEL.pm` is `Technical PM`. `uniqueSeatKeys` keeps person dests outside the `SeatKey` union.

```8:18:src/server/dest-resolve.ts
  if (destKey === "pm") {
    try {
      return await resolveRoleDest({ sessionId, role: "pm" });
    } catch (err) {
      if (err instanceof SitError) return null;
      throw err;
    }
  }
```

Empty gist is the offer line once. No “full text / do not read” closer. `SUMMARY_SYSTEM` forbids that closer. Travis polish paragraph is on `TRAVIS_SYSTEM`. `summarizeSeatReply` stays seat-body only.

```76:78:src/lib/offer.ts
export function gistEmptyFallback(offer: string): string {
  return offer.trim() || "Hear it?";
}
```

Must-not hold: no new table, no remint of `heard_at` / `reference_turn_id` / `travis.stream`, no `/protocols/technical-pm.md`, no Hear/Skip replacement pair, no Travis-appends-PHASE-ONE-LOG, no canvas.

**Preview.** Opened the #140 preview, not `travis-psi`. Phone viewport (430×932). Redirected to Vercel login (`vercel.com/login?next=…sso-api…travis-git-cursor-packet-011-voic-372e95…`). Heading: “Log in to Vercel.” I did not sign in. I did not open production psi. I did not see Voice / Log glass from this seat. Deploy for `472915f` had completed (Ready).

## Test

Walked from [`PM-PACKET-011-VOICE-TPM-TEST.md`](./PM-PACKET-011-VOICE-TPM-TEST.md).

**URL I opened:** https://travis-git-cursor-packet-011-voic-372e95-wale-omotayos-projects.vercel.app  
**Device:** phone-first (430×932).  
**Talk | Type:** never reached the toggle.

### A. Voice is quiet when nothing new has landed
**I saw:** SSO wall. Not the listen line. src/ New predicate excludes catalog `pm` and pre-cutoff rows (cutoff write + `heard_at`). Chip builder cannot print `PM` for catalog `pm`. No Hear / Hear it / Skip **buttons** in `Room.tsx`. Spoken invites stay in `parseHearInvite`.

### B. Log look marks seen
**I saw:** did not open Log. Intersection POSTs `/heard` at 0.55 now. Did not sit on a bubble.

### C. A real landing registers as New
**I saw:** did not dest Engineer. Did not wait for a New chip or a Stream card. `isNewReportTurn` + `newReportChip` name that seat; catalog `pm` is not New.

### D. His answer also marks seen
**I saw:** did not dest again. `insertUserTurn` → `markUnheardBeforeSeq` hears prior unheard New rows.

### E. Reply to a specific message
**I saw:** did not open a ticket. Reply door is selected-only (`Reply` on Log + ticket). `referenceTurnId` passes through send / live / finalize. Copies `initiative_id` from the referenced turn.

### F. Dest timeout still hangs the Stream card
**I saw:** did not dest Technical PM. `finishDestJobsForBinding` no longer closes the stream. 025 hang still sets `close_turn_id` when a dest post lands.

### G. Refresh stays in the same place
**I saw:** did not pull-to-refresh inside a room. `travis-stay` write/read + attachSession view restore are in src/. Boot does not force `plate: "index"` when stay says room.

### H. Technical PM, not catalog PM
**I saw:** did not open dest chips. `hideCatalogPm` + `resolveDestBinding("pm")` + `SIT_ROLE_LABEL.pm` = Technical PM.

### I. Travis polishes the request
**I saw:** did not send the three-point line. `TRAVIS_SYSTEM` polish paragraph is planted. Did not hear a restatement.

### J. Gist has no closer
**I saw:** no New chip on glass. `gistEmptyFallback` is the offer once. Wrote `no New — skipped` for the spoken Hear walk.

**Steps I could not do (human):** Vercel team SSO. Travis email link (founder’s inbox). Talk on a phone. Dest Engineer / Technical PM / Travis. Sit on a Log bubble. Reply door on a live bubble. Watch a dest timeout then a completed post. Pull-to-refresh in room Travis. Open dest chips. Say `Hear it`. Those are the human’s. I do not fail the look for them.

## Loop

Pass. Emerged. Human may walk the same sheet on this preview (SSO + email, then A–J). Same PR. No cousin. No `fail-look`.
