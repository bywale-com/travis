# Hotfix 093 — Gated preview: green-light only on plant finish or manual trigger

**Number:** `093` — next engineer hotfix is `094`. Never reuse.  
**Seat:** Engineer.  
**When:** 2026-09-13  
**PR title shape:** `Hotfix 093 — Gated preview: green-light only on plant finish or manual trigger`  
**Test:** [`HOTFIX-093-GATED-PREVIEW-TEST.md`](./HOTFIX-093-GATED-PREVIEW-TEST.md)

## Why

Previews run full runtime door tests and deployment checks. Every preview build has real consequences.

Previously, `preview-when-clear` in `.github/workflows/wake-packet-seats.yml` executed on **every** push to an open PR branch whose labels were clear. If an open PR had no active hold or seat labels (for instance, while a founder, PM, or engineer was drafting, editing docs, tweaking scripts, or pushing incidental assets), the push did not assign any seat labels—and GitHub Actions immediately assumed the PR was "finished" and ran `preview-when-clear.sh`. That script tagged the commit with `Preview [vercel build]`, set `previewing`, and kicked off an unintended Vercel preview build and test run.

This created phantom builds and risked restarting automated loops on incidental pushes.

## Cut

1. **Gate `preview-when-clear` on an explicit `green_light` output.** In `wake-packet-seats.yml`, job `label` sets output `green_light=true` **only** when a plant finish condition is met:
   - The push touches `src/` or `docs/register/ENGINEER-HANDOFF.md` AND seats are stripped on a hotfix or packet PR.
2. **`preview-when-clear` job condition:**
   `if: github.event_name == 'push' && github.ref != 'refs/heads/main' && needs.label.result == 'success' && needs.label.outputs.green_light == 'true'`
   Any incidental push that does not finish a plant skips `preview-when-clear` entirely.
3. **Manual preview trigger via `preview` label.** If a human or automation wants to explicitly trigger a Vercel preview without pushing a plant, adding the label `preview` to the PR triggers the new `manual-preview` job. The action consumes the label and executes `preview-when-clear.sh` (respecting mutex holds).
4. **`blocker-release` remains intact.** When founder unlabels `blocker`, `blocker-release` continues to trigger `preview-when-clear.sh`.

No phantom builds. No accidental loops on unlabeled PR pushes.
