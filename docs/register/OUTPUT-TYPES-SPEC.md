# Output types beyond text — product spec (considering)

**Status:** Considering. **Not a packet.** Founder asked to spec support like richer Cursor outputs (images, links, structured artifacts).  
**Does not plant.** Does **not** mint a store. SA ascribes blob vs URL vs Cursor-held ref before Engineer cuts.  
**Flag:** 14:00 UTC 2026-08-25 — images appear in the chat, in order. Visual is overflow, not the product center (19:32).  
**Already locked:** 005 — links are clickable; images/files were **stage**. 001 — artifact nested in the assistant turn.  
**Log:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md)

v1 stays a **dumb pipe**. Hygiene: speak assistant text; do not read thinking/tool spam; do not invent triage (what to hide). Labor is not an effect — no Summarize button for a 40k post.

---

## Supported types (v1 set)

Only types the **Cursor run/stream already emits**, or that we already locked. Do not invent a CMS.

| Type | In v1? | What it is | Speak? | Log |
|------|--------|------------|--------|-----|
| **Prose** | Yes (planted) | Assistant / seat text | Yes (hygiene) | Formatted receive (005) |
| **Link** | Yes (005 locked) | URL in a turn | Title or “there’s a link” — not the raw URL spelled | Clickable |
| **Image** | **Stated, not built** | Plate, screenshot, generated still from the run | “There’s an image.” Do not describe pixels | Inline in **thread order**, nested in that turn |
| **File** | Wave 2 | Blob the stream names (pdf, zip, patch) | “There’s a file: {name}.” | Row in the same turn: name + open/save |
| **Code / patch excerpt** | Wave 2 if stream has it | Structured text we already partly treat as inline code | Do not read a diff aloud | Scrollable block in the turn — not a second IDE |
| **Cursor artifact handle** | Wave 2–3 | Opaque ref the API already returns (download-after-result) | Same as file/image by kind | Same nest |
| **Board / Fieldtop** | **Out** | External apparatus (“place that on the board”) | — | Not this spec. Hold from 19:32 / 17:48 board stamp |

**Not v1:** video, live canvas, interactive widgets, galleries, attach-from-phone, founder-uploaded files, “share to web,” comment threads on an image.

User **send** stays plain text (004/005). Richness is **receive**.

---

## Voice vs log

One object. Two homes. Same order.

### Voice (Mode A)

Job: listen. Do not put the image on the orb.

| When it lands | Voice does |
|---------------|------------|
| Text | Travis reads (hygiene) |
| Link | Short beat: “There’s a link.” Then keep reading the prose. Tap **View log** to open |
| Image / file | Short beat: “There’s an image” / “There’s a file.” **No** alt-text novel. Presence stays the orb |
| Several in one turn | One beat per item, in order, then continue the prose |

Queue chip, Jump, narration receipt, 006 Voice-quiet (no swoosh) unchanged.

### Log (Talk / Type)

Job: see. This is where the un-speakable lives.

- Image: full width of the bubble, in sequence with the sentences around it. Tap → pinch/zoom sheet (portal, not clipped). Not a lightbox product.
- Link: in-prose, clickable (005).
- File: one quiet row under that turn — name, size if we have it, **Open**.
- Code/patch: inner-scroll block. Copy is a quiet text control, not a loud CTA.
- Jump to latest still works when an image is taller than the viewport (035).

Do not fake Voice + Type on one plate. V5/V7 already ride “image in the thread.”

---

## Interaction

| Pattern | Law |
|---------|-----|
| **Order** | Stream order = log order = spoken beats. Never sort by type. |
| **Nest** | Artifact belongs to the **turn** that produced it (001). Not a side rail. |
| **Open** | Tap image/file. Phone OS handles save. Travis does not become Files.app. |
| **Play** | Readback is for **text**. Images do not have a play button. |
| **Barge / queue** | Unchanged. A queued line does not carry an image (user send is plain). |
| **Manual parity** | Anything Travis can surface, you can open from the log. No Travis-only download. |
| **Attach** | Out. No paperclip this spec. |
| **“Put that on the board”** | Vision. Not a control here. |

---

## Permissions and sharing

Travis is one founder, rooms as primitive. This is **not** a sharing product.

| Rule | |
|------|--|
| **Scope** | Artifact is visible in the **room** that received the turn. Leave the room, you still see history if the room persists (Leave ≠ End). End-as-wipe takes the turns with it. |
| **Who** | Founder. Seats produce; they do not get a separate ACL. |
| **Keys** | `CURSOR_API_KEY` / `OPENAI_API_KEY` stay server-side. Phone gets a **ref** or short-lived fetch, never the long-lived key. |
| **Public URL** | Do not mint. If Cursor already gave a URL, render it; do not wrap a Travis CDN. |
| **Share sheet** | OS share on long-press is Completes (Implied), not a Travis social graph. |
| **Other people** | Out. No invite, no expiring viewer link. |

SA names: Cursor-held vs Travis-copied bytes. If we copy, retention follows the room. Do not invent a second identity store.

---

## Versioning

**Turns are the version.** A replacement image is a **new** nest on a **new** (or same-run updated) turn. Do not build a stack of v1/v2/v3 on the thumbnail.

| Do | Don’t |
|----|--------|
| Keep stream order | Edit-in-place gallery |
| If the run updates the same ref, refresh that nest | History drawer |
| Failed fetch: muted status line (027 kind) | Fake placeholder art |

If SA later ascribes an `artifact_id` that Cursor mutates, the pane **updates**. That is still one nest, not a version tree.

---

## Incremental rollout

Each wave is specified **and** clear only when SA has named how that type arrives on the stream. Missing grain stays SA — do not mint.

| Wave | What | Why this order | Packet / plant |
|------|------|----------------|----------------|
| **0** | Clickable links, formatted text | Locked 005. Done enough to keep. | 005 |
| **1** | **Images in thread order** + Voice beat “there’s an image” | Flagship. 001 already asked. Store is still text-only (SA today). | Small packet after SA ascribes image/ref. Ride V5/V7. **No gallery.** |
| **2** | Named files + open/save row | Same nest, second mime. | Same packet family or 00N addendum. |
| **3** | Code/patch block if the stream types it | Already halfway (inline code). Only if SA says the event exists. | Do not invent a diff viewer. |
| **4** | Cursor artifact handle / download-after-result | Confirm the API path (001 open fact). | Engineer after SA quotes the SDK. |
| **Hold** | Board, Fieldtop, attach, video, share-to-web | Overflow / later. | Not this spec. |

Wave 1 is the next locked pocket when they say go. Waves 2–4 do not start until Wave 1 is lived.

006 Voice-quiet, queue, rooms envelope — stay on their own tracks. This spec does not block 006.

---

## Success metrics (lived, not a dashboard)

No analytics plant. These are **smoke tests**.

| Metric | Pass |
|--------|------|
| **Order** | Image sits between the sentences that produced it — same as Cursor chat |
| **No Cursor** | Founder sees the plate without opening Cursor |
| **Voice glance** | In Voice, they hear the short beat and can stay on the orb; View log shows the still |
| **Hygiene** | TTS does not read a 40-line alt or a raw URL |
| **Parity** | Same image openable from Talk and Type |
| **Failure** | Dead ref → muted status, not a broken-image shrine |
| **Jump** | Tall image does not trap scroll (035 still holds) |

---

## Risks

| Risk | Guard |
|------|--------|
| Kitchen-sink “Cursor clone” | Types only if the stream emits them. No attach. No gallery. |
| Second product (board/Fieldtop) | Hold. Visual stays overflow. |
| Minting a file table from vibes | SA ascribes or we name silence. Engineer does not invent `artifact` in the SPA. |
| Speaking images (fake triage) | Fixed short beat. v2 may compress; v1 does not judge. |
| Travis-only bytes | Phone fetch must work if Travis is down? Prefer Cursor-held URL + server proxy with the key. SA picks. |
| Cost | Images are Cursor/OpenAI **their** meters, not a new OpenAI Live cost. Don’t put stills through Realtime. |
| Versioning theater | Turns are versions. |
| Clipped overlay | Zoom sheet portals (overlay-escape). |
| Recutting C3/C4 | Don’t. Image nest is a new object on 003 chrome. |

---

## SA must ascribe (do not mint here)

1. How an image/file arrives: SSE event vs download-after-result (001 open fact). Quote the SDK.  
2. What Travis persists: URL, Cursor artifact id, or copied bytes. Retention vs room End.  
3. Speakable vs display: which fields are TTS, which are nest-only.  
4. Failure: expired ref, 404, too large for the phone.  
5. Silence: types the API cannot give us — stay unnamed, not faked.

---

## Open

1. Lock Wave 1 (images in order) as the next packet after 006, or hold until rooms plates kick off?  
2. Voice beat copy: “There’s an image.” — like that wording?  
3. Board stays held — confirm.
