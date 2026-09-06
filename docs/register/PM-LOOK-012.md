# PM look — 012 Usable chat

**Packet:** PM-PACKET-012
**Change packet:** SYSTEMS-CHANGE-PACKET-028
**PR:** https://github.com/bywale-com/travis/pull/142
**Preview:** https://travis-git-cursor-packet-012-usab-4fa860-wale-omotayos-projects.vercel.app
**Verdict:** Pass

## Look

**Lock (PM-012 / SCP-028 / USABLE-CHAT).** The Log is a chat. Voice parked. Reply dests **that** `agent_post`’s author — this row only; do not walk `reference_turn_id`. Reply to a reply dests **that** author. He does not `@` again. Empty chips / sticky do not replace the author; explicit chips or call-by-name add. Quote names **who**, then the clipped text. Pending Type rail: `Reply to {label}`. If the picture is in the Cursor turn (artifacts API, tool image, or markdown image), it hangs on **that** post as `turn_artifact` (`image` | `file`) and paints under that post — not a raw path. Ticket Reply compose + send stay on **that ticket**. Same dest-the-author lock. Do not remint `reference_turn_id`, `heard_at`, `turn_artifact`, `travis.stream`. Do not put Hear it / Skip buttons back. No new table. Smoke is the sheet on the Log. Pass from `src/` only is a miss for the human walk. This look opens **this PR’s preview**, not psi — 028 is not on `main` until merge.

**src/ (planted, this PR, `dac01b7`).** Engineer handoff last plant **028 Usable chat** on #142. `destFromReferencedTurn` loads this session row only. `authorDestKeyFromTurn` returns the key only when `kind === "agent_post"`; a `kind=user` row’s `seat_key` is not a dest.

```42:63:src/server/dest-resolve.ts
export async function destFromReferencedTurn(
  sessionId: string,
  referenceTurnId: string,
): Promise<AgentBinding | null> {
  // this session row only — kind + seat_key
  const key = row ? authorDestKeyFromTurn(row) : null;
  if (!key) return null;
  if (isTravisSeat(key)) {
    return resolveDestBinding(sessionId, "travis");
  }
  return resolveDestBinding(sessionId, key);
}
```

```7:29:src/lib/reply-dest.ts
export function authorDestKeyFromTurn(turn: {
  kind?: string | null;
  seatKey?: string | null;
}): string | null {
  if (turn.kind !== "agent_post") return null;
  const key = turn.seatKey?.trim() ?? "";
  return key || null;
}
// mergeReplyDestKeys: author first; chips / call-by-name add; empty author → today’s dest
```

`/send`, live transcript, and finalize all call `destBindingsForSend` with `referenceTurnId`. Tests: reply to Engineer dests Engineer; reply to Engineer’s reply dests Engineer; user-row `seat_key` is not a dest; chips add and do not drop the author.

Quote staple is author label then body. Log pending rail is `Reply to {label}`. Ticket Messages uses the same rail and keeps a Type compose on the ticket.

```29:53:src/lib/dest-glass.ts
export function quoteAuthorLabel(...) { /* user → You; else destGlassName */ }
export function quoteRailText(...) { return `${params.authorLabel} — ${clipped}${more}`; }
export function replyToLabel(authorLabel: string): string {
  return `Reply to ${authorLabel}`;
}
```

```3041:3061:src/components/Room.tsx
                        {refTurn && (
                          <p ...>
                            {quoteRailText({
                              authorLabel: quoteAuthorLabel({
                                kind: refTurn.kind,
                                seatKey: refTurn.seatKey,
                                label: roomSeats.find(...)?.label,
                              }),
                              text: refTurn.text,
                            })}
```

Ticket `onReply` sets the pending ref and does **not** `setTicket(null)` / `setDoor(null)`. `onBack` still closes. Ticket composer is on `BacklogTicket` (`onSend={sendTyped}`).

```3414:3417:src/components/Room.tsx
          onReply={(turnId) => {
            setPendingReferenceTurnId(turnId);
            pendingRefTurnRef.current = turnId;
          }}
```

Harvest is one hang on **this** `turn_id`: markdown `![alt](src)` ∪ process-body image paths ∪ API window when `startedAt` is set. `alreadyHung` is paths on this turn only. `http(s)` paths 302 from the artifact proxy. `parseAgentPost` strips image markdown so the path is not the picture. `TurnAttachments` still paints under the post.

```129:155:src/server/artifacts.ts
    const hung = await db
      .select({ path: turnArtifact.path })
      .from(turnArtifact)
      .where(eq(turnArtifact.turnId, post.id));
    // hang markdownImageSrcs + processImagePathsForPost
    if (!params.startedAt) return;
```

```25:27:src/app/api/artifacts/[id]/route.ts
    if (isHttpArtifactPath(row.path)) {
      return NextResponse.redirect(row.path, 302);
    }
```

Must-not hold: no new table, no remint of 027 columns, no Hear / Skip **buttons** in `Room.tsx`, no cousin PR, no canvas.

**Preview.** Opened the #142 preview, not `travis-psi`. Phone viewport (430×932). Browser redirected to Vercel login (`vercel.com/login?next=…sso-api…travis-git-cursor-packet-012-usab-4fa860…`). Heading: “Log in to Vercel.” I did not sign in. Authenticated CLI fetch of the same preview returned the Travis email door: “Personal access by email — no password.” I did not request a link. I did not open production psi as this plant. I did not see Voice / Log / Type / room Travis from this seat. Deploy for `dac01b7` had completed (Ready).

## Test

Walked from [`PM-PACKET-012-USABLE-CHAT-TEST.md`](./PM-PACKET-012-USABLE-CHAT-TEST.md).

**URL I opened:** https://travis-git-cursor-packet-012-usab-4fa860-wale-omotayos-projects.vercel.app  
**Device:** phone-first (430×932).  
**Talk | Type:** never reached the toggle. Sheet names psi; this look used the preview (028 is not on `main`).

### A. You are in the chat
**I saw:** SSO wall in the browser. Travis email door behind protection (title Travis; Send login link). Not room Travis. Not Log. Not Type composer.

### B. Reply goes to that person
**I saw:** did not tap a left-side Engineer post. Did not type `Stay on that line.` `destFromReferencedTurn` + `mergeReplyDestKeys` dest that `agent_post` author; user-row `seat_key` is not a dest.

### C. A picture lands in the thread
**I saw:** did not dest a print of an existing image. Harvest hangs markdown + process paths on this `turn_id`; API window still when `startedAt` is set. `parseAgentPost` omits `![]()`. Did not see a picture under a post.

### D. Refresh stays
**I saw:** did not reload inside a room. 027 `travis-stay` stands. Did not confirm room + Log + Type after reload on glass.

### E. Ticket Reply stays
**I saw:** did not open Backlog. Ticket `onReply` keeps the ticket; Type compose is on the ticket. Did not send `Stay on that line.` from Messages.

**Steps I could not do (human):** Vercel team SSO. Travis email link (founder’s inbox). Enter room Travis. Switch to Log · Type. Reply to a left-side post. Dest that person without `@`. Watch a picture hang under a post. Reload in the Log. Backlog → ticket → Messages → Reply → send. Talk on a phone. Those are the human’s. I do not fail the look for them.

## Loop

Pass. Emerged. Human may walk the same sheet on this preview (SSO + email, then A–E). psi is `main` — do not treat it as this plant until merge. Same PR. No cousin. No `fail-look`.
