# PM look — 089 Notify the house on ops-red doors

**Packet:** HOTFIX-089
**Change packet:** none (hotfix)
**PR:** https://github.com/bywale-com/travis/pull/175
**Preview:** none (workflow / hang — no glass)
**Verdict:** Pass

## Look

Lock ([`HOTFIX-089-DOORS-OPS-NOTIFY.md`](./HOTFIX-089-DOORS-OPS-NOTIFY.md)): 088 left `runtime-doors` red on Cursor hard limit / unwired and skipped `fail-look`. That stopped the B loop but did not tell the team. On that ops miss: open (or comment) a GitHub issue with the cause and the house move, assign `bywale-com`, comment the open PR once when the issue is new, mail `EMERGE_EMAIL` with an honest subject. Do not `fail-look`. Do not use the emerge subject (`ops emerged — walk this sheet`). Same open issue is the living thread — later red walks comment it; they do not mail again. `repository_dispatch` runs the workflow on `main`. Live after merge.

Plant (Engineer handoff **089 ops notify (this PR)**, commit `dc938d8`):

**1. Ops vs Engineer miss classification**

```80:90:.github/workflows/runtime-doors.yml
          log="${WALK_LOG:-}"
          ops=""
          if [[ -f "$log" ]]; then
            if grep -qE "Cannot use import|did not speak|run error on tape: Travis" "$log"; then
              ops=""
            elif grep -qiE "hard limit" "$log"; then
              ops="hard-limit"
            elif grep -qiE "isn.t wired" "$log"; then
              ops="unwired"
            fi
          fi
```

Engineer misses (`Cannot use import`, `did not speak`, `run error on tape: Travis`) clear `ops` and fall through to the `fail-look` path. Founder ops (`hard limit`, `isn't wired`) set `ops`.

**2. House issue + one mail on first open**

```100:151:.github/workflows/runtime-doors.yml
          if [[ -n "$ops" ]]; then
            if [[ "$ops" == "hard-limit" ]]; then
              title="runtime-doors: Cursor hard limit — dest cannot leave"
              subject="runtime-doors red — Cursor hard limit (dest cannot leave)"
              ...
            else
              title="runtime-doors: Travis isn't wired — OPENAI_API_KEY missing on this deploy"
              subject="runtime-doors red — Travis isn't wired (OPENAI_API_KEY)"
              ...
            fi
            ...
            existing=$(gh issue list --state open --limit 50 --json number,title \
              --jq "[.[] | select(.title==\"${title}\") | .number][0] // empty")
            opened=""
            if [[ -z "$existing" ]]; then
              issue=$(gh issue create --title "$title" --body-file "$letter" --assignee bywale-com \
                || gh issue create --title "$title" --body-file "$letter")
              opened=1
            else
              gh issue comment "$existing" --body-file "$letter"
            fi
            if [[ -n "$opened" && -n "$pr" ]]; then
              gh pr comment "$pr" --body-file "$letter" || true
            fi
            if [[ -n "$opened" ]]; then
              python3 .github/scripts/send-runtime-doors-letter.py "$letter" "$subject"
            fi
            ...
            echo "No fail-look."
            exit 0
          fi
```

Letter names cause, house move, deploy URL, walk URL, optional PR. PR comment and Resend mail only when the issue is new (`opened=1`). Repeat miss comments the living issue only — no second mail, no PR comment, no `fail-look`. Subjects are the miss, not emerge.

**3. Engineer loop unchanged**

```163:170:.github/workflows/runtime-doors.yml
          gh label create fail-look --color CCCCCC --description "Cursor: Engineer loop after PM look Fail" 2>/dev/null || true
          gh pr edit "$pr" --remove-label fail-look || true
          if gh pr edit "$pr" --add-label fail-look; then
            echo "Labeled #$pr fail-look (fresh add)."
```

Non-ops red walks still fresh-add `fail-look` (088 skip + 089 notify are orthogonal).

**4. House mail script**

```1:31:.github/scripts/send-runtime-doors-letter.py
"""House mail when runtime-doors is red for ops, not an Engineer recut.

Not emerge. Subject is the miss, not \"ops emerged — walk this sheet\"."""
...
    to = os.environ.get("EMERGE_EMAIL", "").strip()
    key = os.environ.get("RESEND_API_KEY", "").strip()
    sender = os.environ.get("RESEND_FROM_EMAIL", "").strip()
...
        "subject": subject,
```

Same Resend secrets as emerge (`EMERGE_EMAIL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`). Subject comes from the workflow argv — contrast emerge: `f"{nnn} emerged — walk this sheet"` in `send-emerge-letter.py`. Workflow header and `issues: write` permission match the cut.

**What I opened or queried:** none (no glass). `DATABASE_URL` unset — not a SQL cut; no verify row to query.

## Test

Walked [`HOTFIX-089-DOORS-OPS-NOTIFY-TEST.md`](./HOTFIX-089-DOORS-OPS-NOTIFY-TEST.md).

**URL I opened:** none (workflow cut)  
**Device:** this bind (no phone)

### 1. Ops-red: issue + mail, no fail-look
**I saw:** Static trace of `runtime-doors.yml` — `ops=hard-limit` or `ops=unwired` enters the house branch, creates an issue (or comments existing), assigns `bywale-com`, mails only on first open with subject `runtime-doors red — Cursor hard limit (dest cannot leave)` or `runtime-doors red — Travis isn't wired (OPENAI_API_KEY)`. Branch exits before `fail-look`. `python3 -m py_compile .github/scripts/send-runtime-doors-letter.py` — pass.

### 2. Same miss again while issue open
**I saw:** When `existing` is non-empty, only `gh issue comment` runs. `opened` stays empty — no PR comment, no `send-runtime-doors-letter.py`, no `fail-look`.

### 3. Engineer miss still fail-looks
**I saw:** Log lines matching `Cannot use import|did not speak|run error on tape: Travis` leave `ops` empty. Workflow falls through to fresh-add `fail-look`. No ops issue branch.

### 4. I saw
**I saw:** Static code review only. Did not trigger `repository_dispatch`, did not open a live GitHub issue, did not receive house mail.

**Steps I could not do (human):** Trigger a real red `runtime-doors` run on a preview with unwired or Cursor hard limit and confirm issue + mail land once. Trigger a repeat miss and confirm comment-only, no second mail. Trigger an Engineer generate miss and confirm `fail-look` fresh-adds. Read the house inbox for subject line. Those are the human’s. I do not fail the look for them.

## Loop

Pass: emerged. Human may walk the same sheet after merge (`repository_dispatch` uses `main`). Same PR. No cousin. No `fail-look`.
