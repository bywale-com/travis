# Hotfix 099 — Test sheet

**Hotfix:** [`HOTFIX-099-CANCELLED-DOORS-ARE-RED.md`](./HOTFIX-099-CANCELLED-DOORS-ARE-RED.md)  
**When:** 2026-09-13  
**PR title shape:** `Hotfix 099 — cancelled doors are red`

## Automated deployment gate

1. Unit tests pass, including: YAML fail-look runs on `failure()` or `cancelled()`; emerge is `success()` only; paint is failure on cancel; `launchPhone` closes the browser on throw; runner fail-fast after the first browser miss.
2. Action log proves `runtime-doors.yml` came from `main`, checked out this SHA, and invoked that checkout’s `npm run test:runtime`.
3. Playwright starts (Chromium install + fake-audio proof). A boot crash before that is red.
4. If the phone face is missing, the walk fails on that miss. The log prints URL, title, and a short visible-text dump. The job does **not** sit until `timeout-minutes`.
5. That miss paints Vercel `runtime-doors` **failure** and adds `fail-look`. It does not paint success. It does not emerge.
6. If the phone face is present, 098 continues: Type before Send; Talk before I’m done; Voice ownership; real Voice canary with `stream-arch cue` leave before `I’m done`.
7. Green only when the walks step succeeded. Cancelled is red.

## Human smoke

1. Open the preview. Voice shows `View log`. Log shows Type / Talk.
2. A cancelled or timed-out doors run must not leave a green check and an empty label set.
3. Voice or Type: `Engineer, put this on the notes: stream-arch cue.` — leave starts before I’m done.
4. I saw: ________
