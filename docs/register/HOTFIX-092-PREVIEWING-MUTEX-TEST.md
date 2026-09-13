# Hotfix 092 — Test sheet

Setup: automations off until this is on `main`. Then one Hotfix PR. Do not push from a web chat onto that PR while `previewing` is on.

1. Plant / recut does **not** preview. Only the Action empty-commit whose subject is exactly `Preview [vercel build]` does. That same job adds **`previewing`**.
2. While `previewing` is on: no second green-light, no `fail-look`, no `wake-engineer`, no `wake-sa`. A recut push that edits `HOTFIX-NNN-*.md` does **not** re-add `wake-engineer`.
3. `runtime-doors` paints (green or red) → `previewing` comes off. Red and idle → one `fail-look`. Green → stop.
4. Fail-look Engineer recuts once, pushes, stops. Does not stay for Vercel / synchronize. The next `fail-look` is a new sitting after doors paint.
5. I saw: ________
