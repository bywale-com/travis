# SYSTEMS-CHANGE-PACKET-037 — Look (file a lived miss)

**Number:** `037` — next systems packet is **038**. Never reuse a number. Do not steal **038** (PM-022).  
**Status:** **Signed.** Recut 2026-09-15 (who-wakes). Plant the recut on this PR ([#194](https://github.com/bywale-com/travis/pull/194)). Chrome from the first plant **stands**.  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** First sign 2026-09-15 11:20 UTC. Recut 2026-09-15 12:16 UTC.  
**PM packet:** [`PM-PACKET-021-LOOK.md`](./PM-PACKET-021-LOOK.md) (recut: File wakes Engineer B).  
**Test:** [`PM-PACKET-021-LOOK-TEST.md`](./PM-PACKET-021-LOOK-TEST.md)  
**FACE (look, do not remint chrome):** [`PLATES-LOOK.md`](./PLATES-LOOK.md) LK1–LK2. Lock photos `travis-lk0-psi-*`. Staples — **Look** · **File** · **Close**. Dest-to-Engineer canary stays (acknowledge-only).  
**Work order (022 only — do not plant):** [`WORK-ORDER-OUTSIDE.md`](./WORK-ORDER-OUTSIDE.md)  
**Engineer B prompt (Architect recut on this PR; founder re-pastes):** [`house-now/automations/sa-complete-engineer.prompt.md`](./house-now/automations/sa-complete-engineer.prompt.md)  
**Prior (do not remint):** **023** `dest_job` · **024** stream · **031** dest assemble · **033** dest-gate · **035** stream-intent · **008–010** initiative / backlog · **011** unfold `TRAVIS_GITHUB_TOKEN` · **020** doors · **086** fail-look · **092** `previewing` · **093** gated preview. First Look chrome + `POST /look` + GitHub seed already planted on this PR.  
**Flag (read-only):** PHASE-ONE-LOG **14:00 UTC 2026-08-25**.  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)  
**Desk:** `https://travis-psi.vercel.app` — Log · Look. Voice has no Look.

036 stays the unsigned hole for PM-020. This cut stays **037** as PM-021 named. Packet **022** (N-red escalate / outside agent) is held — do not plant a counter. Do not Save+Activate `outside-look` for this door.

---

## 1. Intent

The founder files a lived miss from Log without typing a Cursor ticket. Quiet **Look** opens a portal sheet; **File** is the one loud action. Persist the seed on GitHub (Issue body when there is no open PR; PR comment always). Wake **regular Engineer B** by fresh-adding PR label **`wake-engineer`** as `WAKE_GITHUB_TOKEN`. Same automation as a hotfix / SCP. **Not** `outside-look`. **Not** `fail-look`. **Not** Hold → Initiative. Cursor automations wake on **PR** labels, so production-psi File with no open preview PR still mints a draft `look/{issue}` PR after the Issue. Do not mint `travis.look`. Walk Files must not label. Chrome already planted — this recut is who File wakes.

---

## 2. Story

### Must

- Operator owns the room (`requireOwnedSession`). Empty note **and** empty `turnIds` is a miss (400).
- Selected turn ids, if any, must be `voice_turn` rows for **this** `session_id`. Unknown id → 400.
- File never calls `holdInitiative` / `promoteInitiative` / `insertDestJob` / `dispatchToSeat`.
- Persist on GitHub. No `travis.look` table. No tape row.
- Token is **`WAKE_GITHUB_TOKEN`**. Not `TRAVIS_GITHUB_TOKEN`. Not `GITHUB_TOKEN`. Unset on a real File → 503 `"Look is not wired. Set WAKE_GITHUB_TOKEN."`
- Walk File: request cookie equals `process.env.TRAVIS_TEST_OPERATOR_COOKIE` (when set) → **200** `{ ok: true, filed: false, reason: "walk" }`. No GitHub. No label.
- File (and delayed arm) fresh-add **`wake-engineer`**. Never add, create, or strip **`outside-look`** from this door.
- Preview (open PR for this deploy): PR comment with the seed + `<!-- travis-look -->`. Fresh-add `wake-engineer` unless `previewing` or `blocker` is on (then comment only; Action arms after that hold clears).
- Production psi / no open PR for this SHA: Issue + empty-commit `look/{issue}` + draft PR against `main` + comment + fresh-add `wake-engineer`. Title `Look — lived miss` — never `Hotfix`.
- Fresh-add = delete then add so a label-added trigger fires if `wake-engineer` was already on.
- Strip `wake-sa` / `wake-pm-look` / `fail-look` when labeling so Engineer B’s fail-look gate does not steal the seed. Do **not** strip `previewing`, `blocker`, or `outside-look`.
- After a successful label (door or delayed arm), PATCH that seed comment to append `<!-- travis-look-armed -->`. Delayed arm only arms comments that have `<!-- travis-look -->` and lack `<!-- travis-look-armed -->`. A later File posts a new unarmed seed. This is the one-shot tell — not a table.
- `outside-look` may stay in hold lists (022 name). Look File must not add it. While it is on (later), Engineer B still stops — that gate is already in B’s prompt.
- Look chrome only on Log. Voice has no Look. Do not remint LK1 / LK2.
- Dest-to-Engineer canary stays acknowledge-only. Live stays in preflight and runtime-doors.

### Must-not

- Mint `travis.look` or any telemetry table.
- Hang File on `POST /api/session/:id/initiatives`. Merge Look into `RequestLogDoor`. Add File to the hold sheet.
- Use `TRAVIS_GITHUB_TOKEN` or Actions `GITHUB_TOKEN` as the Look label actor.
- Fresh-add or `gh label create` **`outside-look`** from `look-github.ts`, `runtime-doors.yml` delayed arm, or `preview-when-clear.sh` arm.
- Remint Look chrome, grain parse, HTTP status table, dest mail, stream-intent, `dest_job`, unfold, 092/093 mutex, 020 walks.
- Plant 022’s N-count. Skip `fail-look` on a 4th red. Remove Live from sensors.
- Recut `sa-complete-engineer.prompt.md` (Architect already recut the Look-seed file-gate skip on this PR). Founder re-pastes B.
- Cousin PR. Product cap. Toast stack. Accent rings. Speak the seed. Write a tape receipt.
- Steal packet number **038**.

### Chain

```text
Log · Look (planted chrome) → sheet → File
        ↓
POST /api/session/:id/look  { turnIds, note }
        ↓
requireOwnedSession → parseLookBody → turns in this room
        ↓
walk cookie? → 200 filed:false  (stop)
        ↓
WAKE_GITHUB_TOKEN unset? → 503  (stop)
        ↓
resolve target PR (preview id / commits/{sha}/pulls open)
        ↓
  PR exists → issue comment (seed) → maybe fresh-add wake-engineer
  no PR    → Issue (seed) → empty-commit branch look/{n} → draft PR → comment → label
        ↓
labeled? PATCH seed with <!-- travis-look-armed -->
        ↓
200 { ok: true, filed: true, pr, labeled }
        ↓
sheet closes. Cursor Automation (wake-engineer added) plants the seed as Engineer B.
```

Delayed label: unarmed seed comment + `previewing` or `blocker` on → `labeled: false`. `runtime-doors` after it clears `previewing` (and `preview-when-clear` on blocker release) fresh-adds `wake-engineer` from that unarmed comment, then marks it armed. Then `fail-look` runs and skips because `wake-engineer` is already a hold.

### Silence (named — do not invent)

| Silence | Why |
|---------|-----|
| **`travis.look` / session-miss table** | Issue body + PR comment hold session id, turn ids, note, SHA, URL. Armed tell is an HTML comment on that same comment. |
| **Tape receipt** | GitHub taking `wake-engineer` is the wake. |
| **N-red escalate / outside agent** | Packet **022**. Held. `outside-look` hold name may stay. File must not add it. |
| **Hold-sheet File** | Initiative is dest/backlog. |
| **Travis orchestrator / Issue-only wake** | Cursor automations wake on **PR** labels. Issue can persist; a PR must still exist. |
| **Save+Activate `outside-look` for Look** | Wrong agent. 022 later. This door uses Engineer B, already live. |
| **`fail-look` as the File wake** | That path reads a red doors log. Look is a lived miss doors never saw. |
| **Remint Look chrome** | LK1 / LK2 already planted (`LookMissDoor`, Log header **Look**). |
| **Hotfix file as the production mint** | Production Look PR title is `Look — lived miss`. The seed skip in B is what lets that empty-commit PR run. |

---

## 3. Requirements (extraction)

From PM-021 recut founder lock + technical cut. Not a second invention.

1. Persist: GitHub Issue body (production) and/or PR comment (always, once a PR exists). Refuse a store.
2. Production-psi: mint a draft PR when no open PR matches this SHA. Empty-commit so GitHub will accept a PR off `main`. Label that PR `wake-engineer`.
3. Token: `WAKE_GITHUB_TOKEN`. Same founder user as seat labels.
4. File wake: **`wake-engineer`**, never `outside-look`. Fresh-add. Delayed arm after `previewing` / `blocker` clears: same label from an unarmed `<!-- travis-look -->` comment.
5. Engineer B: a PR body or comment containing `<!-- travis-look -->` skips the packet/hotfix file gate. Architect already recut the prompt. Founder re-pastes. Job is the seed.
6. Runtime walk asserts the **HTTP door** (2xx, no initiative, no dest). It does **not** assert the GitHub label.
7. First plant’s `outside-look` hold in doors / green-light / `add_seat` **stays** as a name for 022. Look File must not add that label.

Plate staples (not scenery): **Look** · **File** · **Close**. Do not remint from PNG scenery.

---

## 4. Inventory — quoted stood-up (this PR, after first plant)

### Chrome (do not remint)

```2679:2693:src/components/Room.tsx
            {viewMode === "log" ? (
              <button
                type="button"
                onClick={() => setDoor("look")}
                ...
                Look
              </button>
            ) : null}
```

`LookMissDoor` is `SurfaceBoundary` `id="look-miss"`, portal sheet, quiet Close, note, selected wash, loud File → `POST /api/session/${sessionId}/look`. Voice has no Look.

### HTTP door (stands)

`POST /api/session/:id/look` — auth, grain, walk dry-run, 503 if token unset, then `fileLookOnGithub`. Walk cookie / seed marker / empty+empty 400 stay.

### Miss — File still labels the outside agent

```11:16:src/server/look-github.ts
const STRIP_ON_LOOK = [
  "wake-sa",
  "wake-engineer",
  "wake-pm-look",
  "fail-look",
] as const;
```

```170:180:src/server/look-github.ts
async function freshAddOutsideLook(...) {
  await removeLabel(..., "outside-look");
  await addLabel(..., "outside-look");
  for (const lab of STRIP_ON_LOOK) {
    await removeLabel(..., lab);
  }
}
```

`ensureOutsideLookLabel` POSTs label `outside-look`. Recut deletes that create and that add.

### Delayed arm still adds `outside-look`

```99:156:.github/workflows/runtime-doors.yml
      - name: Arm delayed outside-look from Look seed comment
        ...
          if echo "$pr_labels" | grep -qx outside-look; then
            echo "outside-look already on #$pr."
            exit 0
          fi
          ...
            gh pr edit "$pr" --add-label outside-look
```

Same arm in `.github/scripts/preview-when-clear.sh` L15–27.

### Holds — `outside-look` name stays (022)

```204:204:.github/workflows/runtime-doors.yml
          for hold in wake-sa wake-engineer wake-pm-look fail-look blocker previewing outside-look; do
```

```29:29:.github/scripts/preview-when-clear.sh
for hold in wake-sa wake-engineer wake-pm-look fail-look blocker previewing outside-look; do
```

```126:141:.github/workflows/wake-packet-seats.yml
            for l in wake-sa wake-engineer wake-pm-look fail-look outside-look; do
            ...
            if echo "$pr_labels" | grep -qx outside-look; then
              echo "outside-look on #$pr. No new seat ($lab)."
```

Do not strip those holds. Do not plant 022’s N-count. `wake-engineer` is already a fail-look / green-light hold — arming it before fail-look skips doors-red on that sitting.

### Engineer B Look-seed gate (prompt already recut; founder re-pastes)

```36:40:docs/register/house-now/automations/sa-complete-engineer.prompt.md
**Else if this PR body or a comment contains `<!-- travis-look -->`:** skip the file gate. Continue.
- Read the seed ... That is the job — not a failed `runtime-doors` log unless the seed names one.
```

If `outside-look` is on, B still stops (L9). Do not recut the prompt this sitting.

### Token (stands)

```36:38:src/server/look-github.ts
export function wakeGithubToken(env: NodeJS.ProcessEnv = process.env): string {
  return env.WAKE_GITHUB_TOKEN?.trim() || "";
}
```

### Tests that still grep File → `outside-look`

```42:45:src/lib/preview-mutex.test.ts
  const armAt = yml.indexOf("Arm delayed outside-look from Look seed comment");
  ...
  assert.ok(armAt > clearAt && armAt < failAt, "arm delayed outside-look before fail-look");
```

Hold-list greps for `outside-look` in `circuit-breaker.test.ts` / `preview-mutex.test.ts` **stay** (022 name).

---

## 5. Stores / fields / contracts

### Add (unchanged from first plant — already stood up)

| What | Where | Shape |
|------|--------|--------|
| GitHub Issue (production only) | `POST /repos/{owner}/{repo}/issues` | Title `Look — lived miss`. Body = seed markdown. |
| GitHub PR comment | `POST /repos/{owner}/{repo}/issues/{n}/comments` | Seed markdown. Always, once a PR exists. |
| Draft PR (production only) | empty-commit + `POST /pulls` | Head `look/{issue}`, base `main`, draft true. |
| HTTP contract | `POST /api/session/:id/look` | Stands. |

Seed markdown (staple labels — Engineer B greps the marker, not scenery):

```markdown
<!-- travis-look -->
## Look (lived miss)

**Session:** {uuid}
**Turns:** {id, id}   (or `none`)
**Note:** {founder note}
**SHA:** {VERCEL_GIT_COMMIT_SHA or unknown}
**Deploy:** {publicOrigin(req) or VERCEL_URL}
**When:** {ISO}
```

Repo: `VERCEL_GIT_REPO_OWNER` + `VERCEL_GIT_REPO_SLUG`, else `bywale-com` / `travis`. SHA: `VERCEL_GIT_COMMIT_SHA`. Preview PR: `VERCEL_GIT_PULL_REQUEST_ID`.

### Change (this recut)

| What | How |
|------|-----|
| `src/server/look-github.ts` | Fresh-add **`wake-engineer`**. Stop `ensureOutsideLookLabel`. Stop adding/stripping `outside-look`. `STRIP_ON_LOOK` = `wake-sa`, `wake-pm-look`, `fail-look` (not `wake-engineer`). Capture comment id from POST. If labeled, `PATCH /repos/{owner}/{repo}/issues/comments/{id}` append `<!-- travis-look-armed -->`. |
| `.github/workflows/runtime-doors.yml` | Delayed arm step: from unarmed `<!-- travis-look -->` comments, fresh-add **`wake-engineer`**, strip `wake-sa` / `wake-pm-look` / `fail-look`, PATCH armed. Do **not** add `outside-look`. Do **not** exit-0 merely because `outside-look` is on. Keep `outside-look` in the fail-look hold list. Arm still after clear-previewing and before fail-look. |
| `.github/scripts/preview-when-clear.sh` | Same delayed arm (blocker-release / green-light path). Keep `outside-look` in the hold loop. |
| Tests that grep File → `outside-look` | `preview-mutex.test.ts` arm step string matches **wake-engineer**. Keep hold-list `outside-look` asserts. Add a unit that `look-github.ts` source contains fresh-add `wake-engineer` and does not add label `outside-look`. |
| `docs/register/ENGINEER-HANDOFF.md` | Look File → **`wake-engineer`**. Not the outside agent. Not N=4. Founder re-pastes B. Must **not** tell founder to Save+Activate `outside-look` for this door. |

### Refuse

| What | Why |
|------|-----|
| `travis.look` / miss / telemetry table | GitHub holds the seed + armed tell. |
| New Vercel secret name | Same `WAKE_GITHUB_TOKEN`. |
| `TRAVIS_GITHUB_TOKEN` / `GITHUB_TOKEN` as Look actor | Unfold / bot. |
| `voice_turn` row for File | Silence. |
| Initiative / dest / motion row | Different job. |
| Recut Engineer B prompt this sitting | Architect already recut. |
| Remint Look chrome / `look-miss.ts` grain / look route status table | First plant stands. |
| `gh label create outside-look` from File or delayed arm | 022. `wake-packet-seats.yml` may keep creating the name. |
| Packet **038** | Reserved for 022. This recut stays **037**. |

---

## 6. Runtime behavior

### POST `/api/session/:id/look`

Unchanged except GitHub side-effect (who is labeled). Status table stands: 401/404 auth, 400 ended / grain / turn-not-in-room / note-too-long, 200 walk, 503 unwired or GitHub refused, 200 filed with `pr` / `labeled` / optional `issue`.

Server GitHub (`src/server/look-github.ts`) recut:

1. Headers as unfold. Token = `WAKE_GITHUB_TOKEN` only. Do not create `outside-look`.
2. Resolve PR: `VERCEL_GIT_PULL_REQUEST_ID` if set; else `GET /repos/{owner}/{repo}/commits/{sha}/pulls` first **open** PR. Prefer `head.sha === sha` when several.
3. If PR: `POST` comment. Read labels. If `previewing` or `blocker` → do not label, `labeled: false` (comment stays unarmed). Else delete+add `wake-engineer` (fresh add). Remove `wake-sa` / `wake-pm-look` / `fail-look`. Do **not** remove `previewing`, `blocker`, or `outside-look`. PATCH comment with `<!-- travis-look-armed -->`.
4. If no PR: Issue + empty-commit `look/{n}` + draft PR + comment + same label path. Production has no `previewing`.
5. If `look/{issue}` already exists, do not mint a cousin branch — comment + fresh-add on the open PR for that head.

Delayed arm (`runtime-doors.yml` + `preview-when-clear.sh`):

1. Wait while `previewing` or `blocker` is on.
2. Find issue comments whose body contains `<!-- travis-look -->` and does **not** contain `<!-- travis-look-armed -->`. None → stop (no delayed label).
3. Fresh-add `wake-engineer`. Strip `wake-sa` / `wake-pm-look` / `fail-look`. PATCH each unarmed seed comment with the armed marker.
4. Never add `outside-look`. Never `gh label create outside-look` here.
5. Arm before fail-look. `wake-engineer` is already in the fail-look hold list — a red doors paint on this sitting does not steal the seed.

Face: do not remint. 2xx File still closes the sheet.

Walks: `TRAVIS_TEST_OPERATOR_COOKIE` on Vercel still dry-runs. Founder ops for the two secrets stay (`BLOCKER-004` cause). Do not rewrite that blocker into a Save+Activate for `outside-look`.

Founder ops (not code): re-paste Engineer B so the Look-seed gate is live. Do **not** Save+Activate `outside-look` for this door.

---

## 7. Ports

| Port | Real vs stand-in |
|------|------------------|
| `WAKE_GITHUB_TOKEN` on GitHub Actions | **Real.** Labels seats today. |
| `WAKE_GITHUB_TOKEN` on Vercel | **Must be real** for File. Unset = 503. Blocker 004 named it. |
| `TRAVIS_GITHUB_TOKEN` | **Real unfold.** Do not use. |
| `GITHUB_TOKEN` | Actions bot. **Forbidden** as Look actor. |
| GitHub REST (`api.github.com`) | **Real.** Issue / comment / PATCH comment / PR / labels / git commits. |
| Cursor Automation Engineer B (`wake-engineer`) | **Real.** Already Save+Activated. Founder **re-pastes** so `<!-- travis-look -->` skips the file gate. Until re-paste, a production `look/{n}` empty-commit PR would stop on the old file gate. |
| Cursor Automation `outside-look` | **022. Not this door.** Do not Save+Activate for Look. Hold name may stay in Actions. |
| `TRAVIS_TEST_OPERATOR_COOKIE` on Vercel | **Must be real** so walks do not label. |
| `CURSOR_API_KEY` | Untouched. Server-side only. |

---

## 8. Verify

**Units** (`src/lib/look-miss.test.ts`): stands (empty+empty, note-only, walk cookie, seed marker). Add / recut a source grep: `look-github.ts` fresh-adds `wake-engineer` and does not add label `outside-look`. Recut `preview-mutex.test.ts` arm-step string to delayed **wake-engineer** (still before fail-look). Keep `outside-look` in hold-list greps.

**Runtime walk** (`src/runtime/walks/look-miss.spec.ts`): stands. HTTP File 2xx, no initiative. Do not assert a GitHub label.

**Preflight Chromium:** stands. Log Look chrome + File POST. Voice has no Look.

**Human (sheet 021):** GitHub path received the seed; **`wake-engineer`** on the PR this packet named (preview = this PR; production = the minted Look PR). **No** `outside-look` from this File. Founder re-paste of B is still human.

**Wires:** delayed arm names `wake-engineer`. `outside-look` remains in hold lists. No N=4 skip. Live in both sensors.

---

## 9. Out of scope

- Packet **022** N consecutive reds and Save+Activate `outside-look`.
- Remint Look chrome / grain / HTTP status table.
- Recut Engineer B prompt (already on this PR).
- Remint 020 / 035 / dest / initiative / unfold / 092 mutex.
- Hear / Skip / Next.
- Cousin PR. Comment “ready” on GitHub.
- `PHASE-ONE-LOG` append. SQL migration. Packet **038**.

---

## 10. File plan (Engineer)

| File | What goes in (not code) | Why a file |
|------|-------------------------|------------|
| `src/server/look-github.ts` | Fresh-add `wake-engineer`. Never `outside-look`. Armed PATCH. Keep Issue + `look/{n}` draft. | Who-wakes. |
| `.github/workflows/runtime-doors.yml` | Delayed arm → `wake-engineer` from unarmed seed. Keep `outside-look` hold. | After previewing clears. |
| `.github/scripts/preview-when-clear.sh` | Same delayed arm. Keep `outside-look` hold. | Blocker-release / green-light. |
| `src/lib/preview-mutex.test.ts` (+ look-github source grep) | Arm string / File label match `wake-engineer`. Hold-list `outside-look` stays. | First sensor. |
| `docs/register/ENGINEER-HANDOFF.md` | File → `wake-engineer`. Not outside. Not N=4. Founder re-pastes B. | Sheet 021 Before. |

Do not edit `WORK-ORDER-OUTSIDE.md` or `outside-look.prompt.md` (Architect recut 022 away from this door). Do not recut `sa-complete-engineer.prompt.md`. Do not edit `runtime-doors.yml` to count reds. Do not remint `LookMissDoor` / Log Look button / `look-miss.ts` / look route. Do not rewrite dest canary except acknowledge-only.

---

## 11. Numbering

| # | Meaning |
|---|---------|
| **036** | Named for PM-020. Never signed. **Do not reuse.** |
| **037** | This packet. Recut who-wakes. |
| **038** | Next. Held for PM-022. Do not steal. |
