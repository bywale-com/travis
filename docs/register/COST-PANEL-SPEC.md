# Cost panel — on-demand door (considering)

**Status:** Considering. **Not a packet.** Not a dashboard. Not always-on on Voice.  
**Job:** See what this **scope** has spent — when invited.  
**Flag:** 14:00 UTC — voice is the product. Dollars are overflow.  
**Law:** Nothing Travis-only (effect parity, not surface parity). Rare effect → **door**. Labor is not an effect — no “explain my bill” essay.  
**Does not mint a store.** SA ascribes Cursor `getUsage` vs OpenAI usage vs our estimate. We do not have billing access in this seat.  
**Sits with:** [`OPENAI-COST-MODEL.md`](./OPENAI-COST-MODEL.md) (the math). Envelope #57: cost was optional / spoken. This stamp **opens the door**; it does not put a ticker on the orb.  
**Log:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md)

---

## UX — a compartment, not a home

**Door.** Quiet text: **Cost** — on the log (Talk/Type) and as a line on the Voice “more” / session sheet (same family as Leave). Not a pill on the orb. Not a dollar on every thought circle.

**Surface.** Portal + `position: fixed` sheet (overlay-escape). Phone-height. One column. Dismiss: tap outside, swipe, Done.

**One loud number.** The total for the current scope. Everything else is quieter.

```
Cost                          Done

This room · Today

     about $4.20
     Estimate · as of 2:18 AM

Travis (OpenAI)     about $3.10   estimate
Seats (Cursor)      $1.10         confirmed

Live                22 min
Eng run             $0.80
SA run              $0.30

Refresh
```

No chart. No month picker farm. No “budget remaining” ring.

**Voice.** Opening the sheet does not interrupt Live. 006 still holds (no send/queue sounds). Travis may **speak** the total if asked (“what has this room cost”) — same number as the sheet, short: “About four dollars today, mostly Live.” Do not read the table.

**Talk/Type.** Same sheet. Same numbers.

---

## Scope (defaults)

| Control | Default | Also |
|---------|---------|------|
| **Where** | **This room** | All rooms (later — only if SA can roll up) |
| **When** | **Today** (local date) | This session / last 7 days — behind the same quiet pair, not two new screens |

Default pair is the lived question: *what did this room cost me today?*

Switch is two muted lines or a single `This room · Today` that opens a tiny menu (portal). One scope at a time. Do not stack filters.

---

## Metrics (what to show)

Show only what we can source. Hide a row if the port is silent — do not invent $0.00 as a fact.

| Line | What | Source (SA confirms) |
|------|------|----------------------|
| **Total** | One number + honesty mark | Sum of lines we have |
| **Travis (OpenAI)** | Live + Luna text + gist | Estimate from tokens × list rate, **or** OpenAI usage if a port exists |
| **Seats (Cursor)** | Runs in this room in scope | `Agent.getUsage()` dollars when the API returns them |
| **Live** | Minutes the Realtime socket was up | Our session clock (estimate driver, not a bill) |
| **Per seat** | Eng / SA / PM (and later N) | Cursor usage, if broken out; else omit |
| **As of** | Clock time of last fetch | Client |

**Do not show:** token dumps, model IDs as chrome, cache hit rates, “you could save,” Compare-to-yesterday, invoices, payment methods.

Create-agent spend (V4) stays a muted line **on that form**. This sheet is running cost, not the mint moment.

---

## Estimate vs confirmed

We will **not** always have the bill. The sheet must say so. Never look more precise than the source.

| Mark | When | How it looks |
|------|------|----------------|
| **Confirmed** | Port returned a dollar figure (Cursor `getUsage`, or OpenAI usage if ascribed) | `$1.10` · quiet word `confirmed` |
| **Estimate** | We multiplied tokens or minutes by the list rate ([`OPENAI-COST-MODEL.md`](./OPENAI-COST-MODEL.md)) | `about $3.10` · `estimate` |
| **Mixed** | Any line is estimate | Loud total is **`about $X`**. Do not drop “about” on the hero if a child is soft |
| **Unknown** | Port failed or not stood up | Muted: `Travis · not available` — **not** `$0` |
| **Running** | Live is up **right now** | Extra muted line: `Live is up — total will move` |

Rounding: **cents**, not fractions. `$4.20` not `$4.197`.

Copy law: **about** = estimate in the number. Do not hide estimate in a tooltip.

If OpenAI billing is days behind and Cursor is live, the hero stays `about` until both sides are confirmed — or we show two heroes (don’t). One hero, honest mark.

Spoken form matches: “About four dollars” vs “One dollar ten, confirmed” only when the whole total is confirmed.

---

## Refresh

| When | Behavior |
|------|----------|
| **Open** | Fetch once. Show last-known immediately if we have it, then replace. |
| **While open** | No 1-second ticker. Quiet refresh every **60s** if the sheet is still up **and** Live or a seat run is in flight. Otherwise stay. |
| **Manual** | Text **Refresh**. |
| **Close** | Stop timers. Do not background-poll. |
| **As of** | Always visible. Stale (>5 min, sheet left in background) → dim the number until Refresh. |

The cost **of** watching cost: do not call OpenAI usage on a tight loop. SA caps the ports.

---

## Permissions

| Rule | |
|------|--|
| **Who** | Founder. Same person who can Leave the room. |
| **Keys** | Usage fetch is server-side. Phone never sees `OPENAI_API_KEY` or `CURSOR_API_KEY`. |
| **Share** | No. No screenshot-as-product, no public link. |
| **Parity** | You can open Cost without asking Travis. Travis can speak the same total. |
| **Seats** | Agents do not get a Cost door. |

---

## Defaults (lock these unless you say otherwise)

1. Scope: **this room · today**.  
2. Closed until invited.  
3. Hero: **about $X** whenever any line is estimate.  
4. Currency: **USD** (invoice currency). No FX.  
5. Empty: muted `No usage in this scope` — not a fake $0 dashboard.  
6. Voice: no dollar on the orb.  
7. No toggle to “pin cost on Voice.”

---

## Five buckets

1. **Copy:** Cost door · sheet · one total · Travis vs seats · honesty mark · as-of · Refresh.  
2. **Do not build:** Chart, budget ring, month grid, token table, pin-to-orb, payment, share.  
3. **Implied:** Spoken “what did this cost” uses the same total. Create-agent line on V4 unchanged.  
4. **Completes:** All-rooms rollup only after SA can sum. Last-7-days in the same sheet.  
5. **Out:** Board, Fieldtop cost, Cursor invoice UI, OpenAI dashboard clone.

---

## SA must ascribe (do not mint)

1. Which ports return **dollars** vs **tokens** vs **minutes**.  
2. Whether OpenAI usage is available to our key (we do not assume it).  
3. How a **room** maps to Cursor usage (per agent? per run tagged how?).  
4. Retention of snapshots — or none, fetch-live-only.  
5. Silence: if a side cannot be known, the row is `not available`.

---

## Plate

If this locks: **one** sheet in Mission (and Carbon token twin only if we are printing twins). Not a 14th rooms plate until they green-light. Door chrome rides V5/K2.

---

## Open

1. Like the door (Cost on log / session sheet) vs spoken-only?  
2. Default **this room · today** — yes?  
3. Hero always `about` when mixed — yes?  
4. Lock as a packet after SA names ports, or hold behind Wave 1 images / rooms plates?
