# SYSTEMS-CHANGE-PACKET-021 — Prove, keep, unfold, hands split

**Number:** `021` — next systems packet is `022`. Never reuse a number.  
**Status:** **Signed.** Engineer has **not** planted the loop. Plant **prove** on **this PR** ([#119](https://github.com/bywale-com/travis/pull/119)) after this file.  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-04  
**Envelope:** [`ENVELOPE-TRAVIS-WORKER.md`](./ENVELOPE-TRAVIS-WORKER.md)  
**Prior (do not remint):** 012 house · 020 box first slice (`run_box` / `read_box` / `write_box`, env pointer, no table) · 042 · 011 (no integrations table, no `GITHUB_TOKEN` for Cursor scope)  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

**Priority:** **1 → 4** in that order. **Five stays back.**

---

## 1. Story (signed)

The box is a **worker with rules**, not a second mouth. He **does**, **checks on that same machine**, **retries by rule**, and the receipt says it **worked** or it **failed**. The model calling `run_box` again is not a loop.

**House and disk are two.** Say so. Do not lie that `list_os` is `ls`. Unfold **copies** house templates onto the box, then pushes a GitHub repo. That is the join. It is not one store.

**Hands stay split.** His box is not their Cursor machine. 042 stands for seated work repos. Computer use stays back.

---

## 2. Stood up (quote, do not remint)

| Grain | Where |
|-------|--------|
| One box | Env `SPRITES_TOKEN` (+ aliases) · `TRAVIS_SPRITE_NAME` or `travis` · `src/server/travis-box.ts` |
| Run / read / write | `run_box` / `read_box` / `write_box` — one exec, then stop |
| Retry today | Model may call `run_box` again. **No harness loop. No verify.** |
| House | `travis.os_node` · `list_os` / `read_os` / `write_os` |
| Seats | Cursor Cloud · `cursor_agent_id` · Travis dest never uses that path |
| 042 | No work repo, diff, branch, test run, CI |

Owner already locked by 020: **one Travis, one box.** No `sprite_id` column. No per-room box. No table.

---

## 3. Prove (priority 1) — the rules

No new table. Same Sprite. Public `curl` is from **that machine**, not from Vercel.

### Tool: `prove_box`

New Travis tool. Harness loop around the box he already has.

| Arg | Law |
|-----|-----|
| `do` | Shell command. Required. Run on the Sprite via the same exec path as `run_box`. |
| `check` | Optional shell. Success = **exit 0**. |
| `path` | Optional. Check becomes `test -e <path>` on the Sprite. |
| `url` | Optional. Check becomes `curl -fsS -o /dev/null <url>` on the Sprite. Success = curl exit 0 (2xx / fetch ok). **Not a browser.** |

Need **`do` plus one of** `check` / `path` / `url`. Else refuse: `Need a check — path, url, or check.`

### Cycle

1. Run `do`.  
2. Run the check on the **same** sprite.  
3. Check exit 0 → **receipt worked.** Stop.  
4. Else retry from step 1.

**Max 3 cycles.** After the third failed check (or a failed `do` that still has retries), **stop** and **name failure**.

### Do not retry

- Box not wired (`SPRITES_TOKEN` empty)  
- Empty `do`  
- Auth / 401 from Sprites  
- Bad args  

Those fail **once**. Receipt names why.

### Receipt (tool return string)

Worked: `Proved. attempt N/3.` then the check’s stdout clip (`BOX_OUTPUT_CAP`).  
Failed: `Failed after N. last: … Same box. Do not mint a ticket.`

Post the same string the way other Travis tools return text. Do **not** mint a prove row. Do **not** mint a ticket from a failed prove.

### `run_box` / `read_box` stay one-shot

Do not silently loop them. Inspection is still one exec.

### `write_box` crossed the box

After a successful `tee`, harness `test -e <path>` on that sprite.  
If missing: **one** more `tee` + `test -e`.  
If still missing: fail receipt, not `Wrote …`.  
This is not `prove_box`. It is one verify because the write left the chat.

### `TRAVIS_SYSTEM`

After a write or a run that was supposed to work, call **`prove_box`**. Calling `run_box` again is not prove.

---

## 4. Keep (priority 2) — they are two

**Admit two. Stop lying.**

| Store | Job |
|-------|-----|
| **House** `os_node` | Law and templates. OS-scoped. All rooms. `list_os` / `read_os` / `write_os`. |
| **Box** Sprite disk | His computer. Shell, files, git, prove. `run_box` / `read_box` / `write_box` / `prove_box`. |

They do **not** become one tree this packet. Do **not** dump `os_node` onto the Sprite as the truth. Do **not** remint 012 as a VM. Do **not** add object storage. Persistent Sprite already is a disk.

**Join (unfold only):** read files under house `/templates/work-repo`, write them onto the box, then git push. House stays the source of template law. Disk is where the job runs. No bidirectional sync.

`TRAVIS_SYSTEM` must say: the house is not the box. `list_os` is not `ls`. The house is notes. The box is the disk and the shell.

No new table. No pointer field. Env stays the box pointer.

---

## 5. Unfold (priority 3) — the port

First POSIX job named on the OS-tree envelope: **seats directories, not a startup message.**

### Tool: `unfold_repo`

| Arg | Law |
|-----|-----|
| `name` | New GitHub repo name. Required. Slug `[A-Za-z0-9._-]+`, max 100. |

### Source

Walk `travis.os_node` at `/templates/work-repo` (dir + descendants). **Files only.** Recurse dirs. Server helper — not a new list tool.

**Empty (no files) → fail receipt:** `House template /templates/work-repo is empty. File it with write_os.`

Do **not** auto-seed from `docs/register/house-now/` or `docs/seats/`. `house-now/` is the git receipt. Runtime is `os_node`. 012 / 015 stand.

### On the box

Write each house file to `/work/<name>/<relative>` on the Sprite (`write_box` / exec). Then `git init` · add · commit on that tree.

### GitHub

| Item | Lock |
|------|------|
| Key | **`TRAVIS_GITHUB_TOKEN`** — server-side only. Same rule as `CURSOR_API_KEY`. Phone never sees it. |
| Not | `GITHUB_TOKEN` (011). Not the Cursor key. Not an integrations table. |
| Create | `POST https://api.github.com/user/repos` `{ name, private: true }` from **Vercel**, with that token. |
| Push | `git push` on the **box**. Pass the token as an **exec env var**. **Never** `write_box` / `tee` the token onto the disk. |
| Owner | Token user. No org field this packet. |
| Collision | GitHub 422 → fail receipt. Do not mint a cousin name. |

Missing token: `Unfold is not wired. Set TRAVIS_GITHUB_TOKEN.` (same shape as `BOX_NOT_WIRED`).

### Prove the unfold

After push, harness `prove_box` (or the same cycle) with `do` = `git ls-remote` of that repo, or `url` = the GitHub HTML URL, **from the box**. Receipt includes the repo URL. Failed push is a failed receipt.

### 042 does **not** move

Unfold is **his** create + push of a **new** skeleton. It is not a view of a seated Cursor checkout.

He still cannot see **their** work repo, diff, branch, test run, or CI. `unfold_repo` must not grow into `gh pr view`, compare, or clone a seat’s repo. Reading the new URL in the receipt is not 042 lifting.

Add `TRAVIS_GITHUB_TOKEN=` to `.env.example` with a one-line comment. Founder lands the secret on Vercel.

Plant unfold on this PR **after** prove smokes. Tool may exist `not wired` until the token is set.

---

## 6. Hands stay split (priority 4) — must-not

- Box tools (`run_box`, `read_box`, `write_box`, `prove_box`, `unfold_repo`) **never** become Cursor send. No `Agent.create` / `send` / `dispatch` from those handlers.
- Seat computers **never** become his disk. No `cursor_agent_id` on the Sprite. No Sprite id on `agent_binding`.
- **No auto-sit** catalog slugs.
- **No computer use** in 021. `curl` from the box is not a browser.
- 042 stays. Unlocking it is a later packet.
- Do not remint 012 / 020 first slice.
- Do not add a third orchestrator host.
- Do not mint `travis.environment`, a snapshot table, or a prove table.

`unfold_repo` is **not** on the 013 motion allowlist (too big for a step). `prove_box` **is** allowed on the motion allowlist — it is his box.

---

## 7. Five (back) — named silence

- Computer use / a face / a browser vendor.  
- Travis seeing Cursor PRs / dashboard.  
- Auto-sit catalog slugs.  
- Dedicated orchestrator host.  
- Integrations table.  
- Dumping the house onto the Sprite as one tree.

Do not pull these in on this PR.

---

## 8. Engineer (paste)

On **this PR** (`cursor/envelope-travis-worker-0bd3`), in order:

1. **`prove_box`** + write_box `test -e` once. Receipts as above. `TRAVIS_SYSTEM` line: prove is the loop; `run_box` again is not.  
2. **`TRAVIS_SYSTEM` keep:** house and box are two. `list_os` is not `ls`.  
3. **`unfold_repo`** + `.env.example` `TRAVIS_GITHUB_TOKEN`. May receipt `not wired`. After prove smokes.  
4. Hands: no send path from box tools. 042 sentence stays. No browser tool.

No new migration. No table. Tests for prove cycle (3, stop, no-retry on not-wired) and named-ticket hang still green.

Do not send **That’s fine.** from this bind.

---

## Verify

- `prove_box` retries on the same sprite and stops at 3.  
- A failed prove does not `insertOpen`.  
- `write_box` does not say Wrote if `test -e` fails twice.  
- `list_os` and `ls` on the box stay different tools.  
- `unfold_repo` with empty `/templates/work-repo` fails without touching GitHub.  
- Token never lands on the Sprite disk.  
- No computer-use tool. 042 tests still pass.  
