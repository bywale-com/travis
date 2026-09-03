# Project brief — Travis

Filled from the Om Coda `PROJECT-BRIEF` template. Hand this to the agent with `docs/build-foundation/README.md` and `00-rudiments.md`.

---

## Product

- **Name:** Travis
- **One-line what it is:** A voice interface between you and Cursor — speak, hear replies, see images when needed.
- **Primary user (role):** Founder / builder who works from a smartphone and needs the Cursor loop to stay live without staring at Cursor (including while in motion).

## Molecular outcome (one paragraph)

> When it is time to build, the user opens Travis (not Cursor), speaks an instruction, voice-sends it into a Cursor agent run, and hears every readable reply read back while images and other un-speakable artifacts appear in the same chat in order — so the build loop continues without phone-staring or app-switching into Cursor.

## Where we start

- **First UI surface to build / extend:** Phone-first voice + chat thread (text + image bubbles) backed by a thin server that holds the Cursor API key and proxies agent runs / SSE.
- **In-scope for this session (docs stand-up):** Seats, logs, method pack, build-foundation pack, this brief, remote repo. **No product UI plant until PM/SA lock a cut.**
- **Out of scope for this session:** Triage/judgment layer; Fieldtop mount productization; desktop Cursor automation; full visual design system beyond rudiments stubs when UI starts.

## Constraints

- Stack / repo layout notes: TBD at plant time — prefer TypeScript; `@cursor/sdk` or Cloud Agents API; API keys server-side only; phone-first.
- Existing design references: Om Coda method + build-foundation (this repo). Product is not Tower.
- Must stay on rudiments: tokens · icons · surface boundaries · How/flows when relevant.
- Same seat law as Tower: PM / SA / Engineer; two buckets for Engineer; no third bucket.

## Agent instruction

Follow `docs/build-foundation/00-rudiments.md`. Build only the in-scope starting surface when a session is seated as Engineer and the pocket is locked. Register every new region. Do not invent process language before How leaves. Do not expand into out-of-scope modules. Do not mint tables. Do not append PM/SA logs. Job is another seat's: handoff seat (complete brief, one hop, stop).
