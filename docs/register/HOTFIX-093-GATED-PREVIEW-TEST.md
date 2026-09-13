# Hotfix 093 — Test sheet

Setup: automations off until this is on `main`.

1. Pushing incidental files (docs, test sheets, scripts, plates) on an unlabeled PR branch does **not** trigger `preview-when-clear`. No `previewing` label is added, and no empty commit is pushed.
2. Pushing a finished plant touching `src/` or `docs/register/ENGINEER-HANDOFF.md` sets `green_light=true`, stripping seats and executing `preview-when-clear`.
3. Adding the `preview` label manually to an open PR triggers `manual-preview`, removes `preview`, and runs `preview-when-clear.sh` (as long as no hold labels are on).
4. Unlabeling `blocker` continues to trigger `blocker-release` -> `preview-when-clear.sh`.
5. I saw: ________
