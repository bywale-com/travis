#!/bin/sh
# After handoffs: empty-commit Preview [vercel build] so Vercel may build.
# Skip while wake-sa / wake-engineer / wake-pm-look / fail-look / blocker
# / previewing / outside-look are on. previewing is the mutex: Vercel has the ball.
# Caller must pass a writable checkout of the PR head. $1 = PR number. $2 = branch.

set -eu
pr="${1:?need PR number}"
branch="${2:-}"

labels=$(gh pr view "$pr" --json labels --jq '.labels[].name')
echo "Labels on #$pr:"
echo "$labels"

if ! echo "$labels" | grep -qx previewing && ! echo "$labels" | grep -qx blocker; then
  repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
  unarmed=$(gh api "repos/${repo}/issues/${pr}/comments" --paginate --jq \
    '.[] | select((.body // "") | contains("<!-- travis-look -->") and (contains("<!-- travis-look-armed -->") | not)) | .id' 2>/dev/null || true)
  if [ -n "$unarmed" ]; then
    gh pr edit "$pr" --remove-label wake-engineer || true
    if gh pr edit "$pr" --add-label wake-engineer; then
      echo "Armed delayed wake-engineer on #$pr from Look seed comment."
      for lab in wake-sa wake-pm-look fail-look; do
        gh pr edit "$pr" --remove-label "$lab" || true
      done
      printf '%s\n' "$unarmed" | while IFS= read -r id; do
        [ -z "$id" ] && continue
        gh api "repos/${repo}/issues/comments/${id}" --jq .body \
          | jq -Rs '{body: (. | rtrimstr("\n") + "\n<!-- travis-look-armed -->\n")}' \
          | gh api --method PATCH "repos/${repo}/issues/comments/${id}" --input -
      done
      labels=$(gh pr view "$pr" --json labels --jq '.labels[].name')
    fi
  fi
fi

for hold in wake-sa wake-engineer wake-pm-look fail-look blocker previewing outside-look; do
  if echo "$labels" | grep -qx "$hold"; then
    echo "Handoff/hold '$hold' still on #$pr. No green light."
    exit 0
  fi
done

msg=$(git log -1 --pretty=%B)
first=$(printf '%s\n' "$msg" | awk 'NR==1 { sub(/\r$/, ""); print; exit }')
if [ "$first" = "Preview [vercel build]" ]; then
  echo "HEAD already has the green-light tag. No extra commit."
  exit 0
fi

gh label create previewing --color 1D76DB --description "Vercel has the ball — no second green-light, no new seat" 2>/dev/null || true
if ! gh pr edit "$pr" --add-label previewing; then
  echo "Could not add previewing on #$pr. No green light."
  exit 0
fi

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git commit --allow-empty -m "Preview [vercel build]"
if [ -n "$branch" ]; then
  if ! git push origin "HEAD:refs/heads/${branch}"; then
    gh pr edit "$pr" --remove-label previewing || true
    echo "Push failed. Cleared previewing on #$pr."
    exit 1
  fi
else
  if ! git push; then
    gh pr edit "$pr" --remove-label previewing || true
    echo "Push failed. Cleared previewing on #$pr."
    exit 1
  fi
fi
echo "Pushed green-light empty commit on #$pr. previewing is on."
