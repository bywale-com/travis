# OpenAI-side cost — plug-in model

**Kind:** Estimate aid. Not a packet. Not a face. Not Cursor billing.  
**When:** 2026-09-03 — founder asked for the OpenAI-side cost. We do **not** have billing access here.  
**Log:** [`PHASE-ONE-LOG.md`](./PHASE-ONE-LOG.md)  
**Rates:** verify on [OpenAI pricing](https://developers.openai.com/api/docs/pricing) before using a number. Figures below are the public list as of this stamp.

---

## What OpenAI is actually billed for

Dest **Travis** only. Seats (PM · SA · Engineer) are Cursor. Browser STT / `speechSynthesis` readback / send swoosh are not OpenAI.

| Meter | Planted path | Model (pinned) |
|-------|----------------|----------------|
| **Live** | Voice + dest Travis + Live up | `gpt-realtime-2.1` · voice `cedar` |
| **Text** | Talk/Type dest Travis; also Live tool loops that hit Responses | `gpt-5.6-luna` |
| **Gist** | `summarizeSeatReply` when a seat post is longer than 1800 chars | `gpt-5.6-luna` |

Live is the expensive meter. Luna text is cheap. Cursor `Agent.getUsage` is a **different bill**.

---

## Product facts that bound a turn (do not invent)

From the plant (`room-context`, `generateTravisText`, 038/029):

| Cap | Value | Why it matters |
|-----|--------|----------------|
| Room window | **14** turns, **2600** chars hard ceiling | Text input does not grow with room age |
| User/Travis line in the window | 300 chars | |
| Seat receipt in the window | 140 chars | Full post is not in the window |
| Verbatim `read_seat_reply` | 1800 chars, else gist | Gist = extra Luna call on the **full** post |
| Tool rounds per text turn | **6** max | Each round is another Responses call |
| System prompt | ~2200 chars (~550–700 tokens) | Sent as `instructions` (Live: plus window on **every connect**) |
| Live reconnect | Reseeds system + window | Talk→Voice, drop, “Travis” vocative = another seed |

Concurrency today: one founder, one room, one Live WebRTC session. Two phones/tabs both on Voice + dest Travis = two Live sessions.

---

## Assumptions you fill in

Pick a period (day / month). One “user” here is one founder phone.

| Symbol | Meaning | Starter (change these) |
|--------|---------|------------------------|
| `U` | Active users | 1 |
| `D` | Days in the period | 30 |
| `S` | Voice+Travis Live sessions per user per day | |
| `M` | Connected Live **minutes** per session (mic open, not “in the app”) | |
| `TalkFrac` | Share of those minutes Travis is **speaking** | 0.35 |
| `HearFrac` | Share you are **speaking** | 0.25 |
| `IdleFrac` | Connected but neither talking (still billed if the socket is up) | 0.40 |
| `R` | Dest-Travis **text** turns per user per day (Talk/Type `@TRV` / dest Travis) | |
| `Rounds` | Average Responses rounds per text turn (1 = no tools; 2–3 typical; 6 cap) | 2 |
| `Gist` | Gist calls per user per day (long Engineer posts) | |
| `Reconnects` | Extra Live connects per session (Talk↔Voice, drops) | 1 |

Audio token rule of thumb (OpenAI-derived, **not** a contract):

- ~**600** audio-input tokens per minute **you** speak  
- ~**1200** audio-output tokens per minute **Travis** speaks  
- Idle connected time still costs: session text + any keepalive / unused audio the API bills. Treat idle as **text + cached audio**, or measure — do not assume $0.

---

## Rates to paste (list, Sep 2026 — re-check)

Per **1,000,000** tokens unless noted.

**`gpt-realtime-2.1`**

| | Input | Cached input | Output |
|--|------:|-------------:|-------:|
| Audio | $32 | $0.40 | $64 |
| Text | $4 | $0.40 | $24 |

**`gpt-5.6-luna`** (short context)

| Input | Cached input | Output |
|------:|-------------:|-------:|
| $0.20 | $0.02 | $1.20 |

Worked **per Live speech-minute** (flagship, no cache):

- You talk 1 min: `600 × 32 / 1e6` ≈ **$0.019**  
- Travis talks 1 min: `1200 × 64 / 1e6` ≈ **$0.077**  
- Naive mixed minute ≈ **$0.05–0.11** if VAD + cache work; worse if the socket stays up and context re-sends.

`gpt-realtime-2.1-mini` is ~⅓ the audio rates if you ever pin it. Not planted.

---

## Plug-in (copy into a sheet)

Use `tokens ≈ chars / 4` when you lack a tokenizer.

### 1) Live — per user per day

```
audio_in_tok   = S * M * HearFrac * 600
audio_out_tok  = S * M * TalkFrac * 1200
live_text_in   = S * (1 + Reconnects) * (700 + 650)
                 # ~system + window on each connect

$live_audio = audio_in_tok/1e6 * 32  +  audio_out_tok/1e6 * 64
$live_text  = live_text_in/1e6 * 4
$live       = $live_audio + $live_text
```

If you measure **cached** audio input from the dashboard, price that slice at $0.40 not $32.

Idle minutes: if the dashboard shows audio tokens while nobody spoke, add them. If not, add a fudge `S * M * IdleFrac * $idle_per_min` and set `$idle_per_min` from one real session (start at $0.02 and replace).

### 2) Text dest Travis — per user per day

```
in_tok_per_round  = 700 + 650 + user_tok     # system + window + utterance
out_tok_per_round = reply_tok                # 150–400 typical; more with tools

$text = R * Rounds * (
          in_tok_per_round/1e6 * 0.20
        + out_tok_per_round/1e6 * 1.20
        )
```

Later rounds that send `previous_response_id` should be mostly **cached** input ($0.02/1M). If you trust that, price round 2+ input at cached.

### 3) Gist

```
$gist = Gist * (seat_chars/4 / 1e6 * 0.20  +  80/1e6 * 1.20)
```

A 40k-character Engineer post ≈ 10k in-tokens ≈ **$0.002** on Luna. Do not let gist scare you; Live does.

### 4) Period total

```
$day_user = $live + $text + $gist
$period   = U * D * $day_user
```

Add 10% if you turn on regional processing for models after 2026-03-05.

---

## Illustration only (not a forecast)

One user, 20 days, 4 Live sessions/day × 8 min, TalkFrac 0.35, HearFrac 0.25, 1 reconnect, 15 text turns/day × 2 rounds, 2 gists/day, user_tok 80, reply_tok 250:

| Line | Rough $ / day |
|------|----------------|
| Live audio | ~$1.10 |
| Live text seeds | ~$0.04 |
| Text dest | ~$0.01 |
| Gist | ~$0.00 |
| **Day** | **~$1.15** |
| **20 days** | **~$23** |

Change `M` or leave Live up while working and this moves first. Text dest almost does not show.

---

## How to replace guesswork (you have the bill; we do not)

1. OpenAI usage → filter project / `gpt-realtime-2.1` / `gpt-5.6-luna`.  
2. One real evening: note Live minutes, audio in/out tokens, text tokens, reconnect count.  
3. Solve `$ / Live minute` and `$ / text turn` from that night. Use those instead of the 600/1200 rules.  
4. Cursor spend stays on Cursor. Do not add it here.

---

## Levers (product, not a plate)

| Lever | Effect |
|-------|--------|
| Drop Live when dest is a seat, or after silence | Cuts the expensive meter (038/039 already: don’t idle-disconnect **while work is in flight**) |
| Prefer Talk/Type dest Travis for long tool loops | Luna instead of Realtime audio |
| Keep the window capped (already 2600) | Stops text from tracking room age |
| Gist long posts (already) | Stops 40k posts entering Travis |
| Pin `gpt-realtime-2.1-mini` | ~⅓ Live audio — product/quality call, not this stamp |
| Two Voice tabs | Two Live bills |

On-demand **Cost** door (considering): [`COST-PANEL-SPEC.md`](./COST-PANEL-SPEC.md). Not a dashboard. Same two invoices: Cursor `getUsage` plus this OpenAI math. Spoken total uses the same number.
