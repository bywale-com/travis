#!/bin/sh
# After handoffs: empty-commit Preview [vercel build] so Vercel may build.
# Skip while wake-sa / wake-engineer / wake-pm-look / fail-look / blocker are on.
# Caller must pass a writable checkout of the PR head. $1 = PR number. $2 = branch.

set -eu
pr="${1:?need PR number}"
branch="${2:-}"

labels=$(gh pr view "$pr" --json labels --jq '.labels[].name')
echo "Labels on #$pr:"
echo "$labels"

for hold in wake-sa wake-engineer wake-pm-look fail-look blocker; do
  if echo "$labels" | grep -qx "$hold"; then
    echo "Handoff/hold '$hold' still on #$pr. No green light."
    exit 0
  fi
done

msg=$(git log -1 --pretty=%B)
if echo "$msg" | grep -q '\[vercel build\]'; then
  echo "HEAD already has the green-light tag. No extra commit."
  exit 0
fi

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git commit --allow-empty -m "Preview [vercel build]"
if [ -n "$branch" ]; then
  git push origin "HEAD:refs/heads/${branch}"
else
  git push
fi
echo "Pushed green-light empty commit on #$pr."
