# Blocker 004 — Look walk 503 (Vercel secrets)

**When:** 2026-09-15  
**PR:** [#194](https://github.com/bywale-com/travis/pull/194)  
**Run:** [runtime-doors #34962089448](https://github.com/bywale-com/travis/actions/runs/34962089448)

## Cause

`look-miss` is the only red walk. File on Log is supposed to dry-run when the request cookie equals `TRAVIS_TEST_OPERATOR_COOKIE` on the Vercel app. That env is unset on Preview, so the door treated the walk as a real File. Real File then hit unset `WAKE_GITHUB_TOKEN` and returned 503. Engineer cannot paste Vercel env. Other walks on the same run were green (`bind-agent`, `come-back`, `type-dest`, `type-send`, `type-walk-back`, `voice-stream-arch`, `voice-wrap`).

SCP-037 already named this as founder ops: same PAT as Actions `WAKE_GITHUB_TOKEN`, plus the walk cookie, on Vercel Production **and** Preview. Do not remint Look. Do not fall back to `GITHUB_TOKEN`.

## Tape

```
look-miss: look was json 503 {"error":"Look is not wired. Set WAKE_GITHUB_TOKEN."}
tape:
#1 user/travis speak=true Look walk line on the tape.
#2 agent_post/travis speak=true The tape has one line: > “Look walk line on the tape.” — 2026-09-15 11:14 UTC
```

`# tests 8` / `# pass 7` / `# fail 1` — only `look-miss` red.

## Action

1. In Vercel → travis → Settings → Environment Variables, paste **both** onto Production **and** Preview (same values as the GitHub Actions secrets of the same names):
   - `WAKE_GITHUB_TOKEN` — founder PAT (Issues write, Pull requests write, Contents write). Same actor as seat labels.
   - `TRAVIS_TEST_OPERATOR_COOKIE` — same value as Actions, so walk Files return `{ ok: true, filed: false, reason: "walk" }` and do not label.
2. Remove the `blocker` label on [#194](https://github.com/bywale-com/travis/pull/194) after the vars exist. That re-previews. Do not strip `previewing` by hand.
3. Save+Activate [`house-now/automations/outside-look.prompt.md`](./house-now/automations/outside-look.prompt.md) if that automation is still a stand-in.

## URL

Preview from that run: `https://travis-lj23tssgf-wale-omotayos-projects.vercel.app`
