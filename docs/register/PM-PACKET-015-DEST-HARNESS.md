# PM packet 015 — Dest harness recut (kit, not keywords)

**Number:** `015` — next PM packet is `016`. Never reuse. Index: [`PM-PACKETS.md`](./PM-PACKETS.md).  
**Seat:** Technical PM. **SA** ascribes as **031**.  
**When:** Named 2026-09-07.  
**Status:** Specified.  
**Wake:** sa
**Test spec:** [`PM-PACKET-015-DEST-HARNESS-TEST.md`](./PM-PACKET-015-DEST-HARNESS-TEST.md)  
**Flag:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md) **14:00 UTC 2026-08-25**.  
**Builds on:** 014 / 030 planted. First fork still dest-with-context. This recut is how that fork fires.  
**Next SA:** **031**.

**Where:** this PR. SA and Engineer commit here. Do not open a cousin. Do not remint 011–013 / 027–029 / **030**.

---

## Founder lock

> every initiative and idea we discuss in this chat … send that alongside prompting them as well, the technical PM, to list out every idea and initiative we've discussed that hasn't yet been implemented. … It means every initiative I've discussed inside of these chat logs with Travis Send that alongside a prompt that asks the technical PM to also list out all the ideas and initiatives that we've discussed, and obviously it's so that we can combine both of those things.

> I don't give a shit about your solution … I care about how people are building stuff like what we're building … we're trying to invent too much. Let's see what's out there and then try to integrate that … optimizing for as little new, innovative code as possible, and like, integrating, what exists

> My fear is that this adds context bloats and models you know, takes up our cost. Is this fear unfounded? … how is cost managed in this kind of architecture?

> We'll do that, we'll do that another, we'll do that afterwards. Just, you could feel free to go ahead on that recut though of the, the patients. That's what I meant to go ahead.

---

## What this packet is

014 / 030 planted the harness and the dest-with-context grain. Lived miss **907**: he said “alongside” / “this chat,” created a person, never dested. The grain only rewrites dest after a send, and only if the line hits a phrase list. Middleware classifies and returns. That is us inventing beside the kit.

This recut uses Deep Agents as shipped: filesystem + the hook that already runs before every think. No new keyword list. Dest seats stay Cursor.

---

## Face (plain)

When you send a job to Technical PM — or SA, or Engineer — the leaving message is **your ask plus the print of this chat**. He does not list first and then mail only the instruction. He does not create a new person when Technical PM is already seated. He does not paste the whole room into every cheap think. The long print lives in the kit file. The spoken window stays small. The full mail goes out once, with the dest.

---

## Lock

1. **No more marker words.** Drop `as context` / `printed chat` / `send that list` / `including what we just`. 907 said “alongside” / “this chat.” A longer list is more of our code. Assemble on **every** dest send (`send_to_seat` / `dispatch_to_seat`; `dest_job` if he still uses it). The dest body is the founder’s last ask plus the unclipped print. Model wrap is discarded.
2. **Use the kit hook, not a cousin classifier.** `wrapModelCall` already runs before every think. Hang the print in the kit filesystem (already seeded as `/print.md`). Do **not** inject the full print into every model request. Spoken Here stays clipped (`LINE_CAP` / `WINDOW_TURNS` / `WINDOW_CHAR_CAP`). Cost is managed by file + summarization + full mail **once on dest**.
3. **Named dest, not create.** When they name Technical PM, SA, or Engineer as the addressee, dest (`seat=pm|sa|engineer`). Do not `create_agent`. Hang a short roster fact on that same hook: Technical PM is seated; dest `seat=pm`; do not create. Catalog `pm` is still not this bind. Do not mint `/protocols/technical-pm.md`.
4. **Dest seats stay Cursor.** Do not remint `dest_job`. Do not swap Technical PM for a LangChain subagent.
5. **Stream chrome stays. Stream content on dest is the print.** 008 desk. Kinds stay `message` / `process` / `thought`. When dest leaves, `process` body is the print (enough to see the chat), not “include the printed chat” / `read_seat_reply`. A cheap “ok” is not dest — do not dump the room into that think.
6. **Log · Type first.** Phone chrome unchanged. No Hear it / Skip buttons.

## Technical cut (Engineer implements after SA)

Quoted, not memory.

Phrase gate (drop this as the fork):

```12:25:src/lib/dest-with-context.ts
const MARKERS = [
  "as context",
  "printed chat",
  "send that list",
  "including what we just",
  "including the one we just",
] as const;

export function isDestWithContextAsk(text: string): boolean {
  const t = text.toLowerCase();
  return MARKERS.some((m) => t.includes(m));
}
```

Grain only after send, and only if that gate hits:

```24:36:src/server/dest-with-context.ts
export async function destWithContextFor(
  sessionId: string,
): Promise<DestWithContext | null> {
  const turns = (await recentTurns(sessionId)) as PrintTurn[];
  const lastUser = [...turns].reverse().find((t) => t.kind === "user");
  if (!lastUser || !isDestWithContextAsk(lastUser.text)) return null;
  const print = unclippedPrint(turns);
  if (!print.trim()) return null;
  return {
    ask: lastUser.text,
    print,
    assembled: assembleDestWithContext({ ask: lastUser.text, print }),
  };
}
```

Middleware classifies and does nothing:

```98:104:src/server/travis-deep-agent.ts
const destWithContextMiddleware = createMiddleware({
  name: "dest-with-context",
  wrapModelCall: async (request, handler) => {
    void isDestWithContextAsk(lastUserText(request.messages));
    return handler(request);
  },
});
```

`/print.md` is already seeded in `invokeDeepAgent`. Filesystem tools were not left as the dest path. 030 said payload must not depend on the model reading that file. **Still true:** dest body is assembled grain, not hope he opens the file.

Here stays clipped:

```25:31:src/lib/room-context.ts
export const WINDOW_TURNS = 14;
export const LINE_CAP = 300;
export const RECEIPT_QUOTE = 140;
export const WINDOW_CHAR_CAP = 2600;
```

Create-vs-dest (why 907 never mailed):

```1135:1139:src/server/travis-tools.ts
You can create a person with create_agent — a name, optional model and repo. …
When the founder wants the PM, SA, or Engineer, send_to_seat or dispatch_to_seat with seat and no who. …
An unseated catalog slug is nobody — do not mail it. Create and sit, or offer Engineer.
```

**Grain.** On dest send, always assemble `prompt` = founder ask + unclipped print. `dispatchToSeat` gets that string. `dest_job.payload.text` is that string. A `process` event names the dest fork; **body is the print**. If the print is empty, dest is still the ask — do not invent a second classifier. Here / Live clip unchanged.

**Hook.** `wrapModelCall` hangs the print file and the roster fact (Technical PM seated; `seat=pm`; do not create). It does not paste the room into every think. Kit summarization stays the cost control for history.

**Print source.** Face: dest carries this chat, not Here. SA ascribes whether that print stays today’s `unclippedPrint` (last Travis speakable post + last `WINDOW_TURNS` worthy, no `LINE_CAP`) or a longer tape from existing `voice_turn`. Do not mint a table. Do not remint 030’s stores.

Do not plant a second Travis. Do not remint 011–013.

---

## Must / must-not

- Dest after a 907-style line (alongside / this chat, no marker words) leaves a body that **contains the ask and the print**.
- Creating Technical PM when he is already seated is a miss.
- Instruction-only dest (ask without the print) when tape exists is a miss.
- Dumping the room into every think is a miss.
- Cost later as a new product. Here clip stays. Kit file + dest mail is the control already named.
- Do not remint `voice_turn` / `dest_job` / `heard_at` / `reference_turn_id` / `travis.stream`.
- Do not remint 030 tables or rewrite 014 as if it never planted.
- Do not put Hear it / Skip buttons back.

---

## SA 031

Ascribe, quote planted loop (`travis-deep-agent.ts` / `dest-with-context.ts` / `runTravisTool` / `TRAVIS_SYSTEM`). No new table unless you name a store that is actually missing.

1. Drop the marker gate. Dest send always assembles ask + print. Grain, not hope.
2. `wrapModelCall`: print in the kit file; roster fact; do **not** inject full print into every model call. Use what the kit already ships (filesystem, summarization).
3. Named dest vs `create_agent` when they say Technical PM / SA / Engineer. Do not invent a phrase list. Do not mail catalog `pm`.
4. Print source: today’s `unclippedPrint` vs longer existing tape. Name it. Do not mint a table.
5. Stream: same `process` kind; dest body is the print. Cheap answer is not dest. Do not remint `travis.stream` / `stream_event`. Live: same cut or named silence.
6. Dest seats stay Cursor. Do not remint `dest_job`.
