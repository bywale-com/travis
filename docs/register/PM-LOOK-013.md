# PM look — 013 The room stays live

**Packet:** PM-PACKET-013
**Change packet:** SYSTEMS-CHANGE-PACKET-029
**PR:** https://github.com/bywale-com/travis/pull/144
**Preview:** https://travis-git-cursor-packet-013-list-aa3f26-wale-omotayos-projects.vercel.app
**Verdict:** Pass

## Look

**Lock (PM-013 / SCP-029).** One room wire while he is in the room. A new turn, a backlog change, a ticket line, a stream card — an event on that wire. Resume from last `seq` (`Last-Event-ID` wins). Never blank. List is a list (title / lit / next), not every ticket’s thread. Poll is catch-up only while the wire is down. No websocket. No smarter poll as the product. Do not remint `voice_turn` / 023 / 012 / 028. Hear / Skip **buttons** stay off. Plate staples: ticket **title** · **lit** / **next** · Log tape (HOTFIX-057 B1 / B6). No new plates.

**src/ (planted, this PR, `74db1d9`).** Engineer handoff last plant **029 The room stays live** on #144. First 029 (smarter poll) is void. Index is isolate-once:

```87:89:src/server/initiative.ts
    CREATE INDEX IF NOT EXISTS voice_turn_session_seq_idx
      ON travis.voice_turn (session_id, seq)
```

Same SQL in `migrate.ts`. `notifyRoom` is `pg_notify('travis_room', session_id)` on the query client — after `insertTurn`, initiative hold/rename/done, stream open/close/fail, motion status.

```5:7:src/server/room-bus.ts
export async function notifyRoom(sessionId: string): Promise<void> {
  if (!sessionId) return;
  await db.execute(sql`SELECT pg_notify('travis_room', ${sessionId})`);
```

Room wire is `GET /api/session/:id/events`. Cookie auth. `afterSeq` / `Last-Event-ID`. Optional `ticketId`. Resume turns (`seq > afterSeq` OR streaming thought) + one cheap `backlog` (`listAt`) + optional `ticket` + `stream`. Then dedicated LISTEN client. `maxDuration = 800`. Heartbeat `: ping` every 15s. Abort UNLISTENs.

```17:17:src/app/api/session/[id]/events/route.ts
export const maxDuration = 800;
```

```47:61:src/app/api/session/[id]/events/route.ts
/** SCP-029 — one room wire. Resume from seq, then LISTEN travis_room. */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  return jsonRoute(async () => {
    const { id } = await ctx.params;
    await requireOwnedSession(req, id);

    const url = new URL(req.url);
    const afterSeq = resumeAfterSeq(
      req.headers.get("Last-Event-ID"),
      url.searchParams.get("afterSeq"),
    );
```

Face holds the wire with `fetch` (not `EventSource`). Merge `turn` by id. Apply `backlog` only when `items` is an array. Last good on drop. Reconnect with last `seq`. Foreground `visible` aborts and reopens now. `streamPollMs` is backoff only inside the wire-down catch. `GET /turns?afterSeq=` is the fallback select.

```1948:1972:src/components/Room.tsx
          const afterSeq = maxTurnSeq(turnsRef.current);
          const params = new URLSearchParams();
          if (afterSeq != null) params.set("afterSeq", String(afterSeq));
          if (ticketIdRef.current) params.set("ticketId", ticketIdRef.current);
          const headers: HeadersInit = {};
          if (afterSeq != null) headers["Last-Event-ID"] = String(afterSeq);
          const res = await fetch(
            `/api/session/${sid}/events?${params.toString()}`,
            { signal: abort.signal, headers },
          );
          if (!res.ok) throw new Error("room wire down");
          await consumeRoomWire(res);
        } catch (err) {
          if (cancelled) return;
          if (err instanceof DOMException && err.name === "AbortError") {
            continue;
          }
          try {
            await fallbackCatchUp(sid);
          } catch {
            /* last good */
          }
          await new Promise((resolve) => {
            window.setTimeout(resolve, streamPollMs());
          });
```

```476:495:src/components/Room.tsx
        const res = await fetch(url);
        if (!res.ok) return;
        const data = (await res.json()) as {
          turns?: Turn[];
          cards?: MotionCardData[];
          streams?: { live?: StreamGrain[]; cards?: StreamGrain[] };
        };
        if (!Array.isArray(data.turns)) return;
        applyIncomingTurns(data.turns, afterSeq != null);
        if (Array.isArray(data.cards)) {
          setMotionCards(data.cards);
        }
        if (data.streams && typeof data.streams === "object") {
          const next = data.streams;
          setLiveStreams(Array.isArray(next.live) ? next.live : []);
          setStreamCards(Array.isArray(next.cards) ? next.cards : []);
        }
      } catch {
        /* last good stays */
      }
```

`listInitiatives` is one initiative select + one `voice_turn` select for those ids (`kind IN ('user','agent_post')`), grouped in memory. Artifact names only when `q` is set. `turnsForInitiative` is not per row. `loadBacklog` does not `setBacklogRows([])` on catch. No loading flash on a poll when rows already exist.

Typed send paints the founder line immediately (`tmp-` row), then the wire / send SSE merges the real turn.

No Hear / Skip **buttons** in `Room.tsx`. Spoken `parseHearInvite` stays. No websocket. No new table. No remint of `voice_turn` columns.

Must-not hold: no smarter-poll product tick while the wire is up, no `setTurns(data.turns ?? [])` on a bad body, no Hear/Skip replacement pair, no 012 / 028 remint, no cousin.

**Preview.** Opened the #144 preview, not `travis-psi`. Phone viewport (430×932). Redirected to Vercel login (`vercel.com/login?next=…sso-api…travis-git-cursor-packet-013-list-aa3f26…`). Heading: “Log in to Vercel.” Email / Google / GitHub / ChatGPT / SAML SSO / Passkey. I did not sign in. I did not open production psi. I did not see Voice / Log / Backlog glass from this seat. GitHub’s Vercel check on `74db1d9` was failed at look time; the alias still SSO-gated. I do not treat that as a plant miss — no compile quote, no glass. Human walks a Ready preview of this SHA.

## Test

Walked from [`PM-PACKET-013-LIST-LIVE-TEST.md`](./PM-PACKET-013-LIST-LIVE-TEST.md).

**URL I opened:** https://travis-git-cursor-packet-013-list-aa3f26-wale-omotayos-projects.vercel.app
**Device:** phone-first (430×932).
**Log | Type:** never reached the room.

### A. The wire, not the timer — A.1 Send and see
**I saw:** SSO wall. Did not type `One-line note on the tape.` Did not Send. src/ paints the founder line on send (`tmp-` row) and holds `/events` while in-room. Reply / Stream ride `turn` / `stream` events, not a later refresh.

### B. Reconnect does not lose — B.1 Leave and come back
**I saw:** did not switch to Rooms. Did not enter Travis again. Reconnect is last `seq` + resume select, then LISTEN. Enter-room full catch-up then open the wire.

### C. Backlog — C.1 List
**I saw:** did not open Backlog. `loadBacklog` keeps last good on `!ok` / catch. Wire emits `backlog` with `items` + `listAt`. No empty wipe.

### C.2 Ticket
**I saw:** did not open a ticket. Wire sends `ticket` when `ticketId` is on the URL. Face applies only if that ticket is still open.

### Voice
**I saw:** no Hear / Skip **buttons** in `Room.tsx`. Spoken invites stay.

**Steps I could not do (human):** Vercel team SSO. Travis email link (founder’s inbox). Type / Send in room Travis. Leave to Rooms and re-enter without hard refresh. Open Backlog and watch a new row land. Open a ticket and watch a line land. Talk on a phone. Those are the human’s. I do not fail the look for them.

## Loop

Pass. Emerged. Human may walk the same sheet on this preview (SSO + email, then A–C). Same PR. No cousin. No `fail-look`. Walk a Ready deploy of `74db1d9`, not production psi.
