#!/usr/bin/env bash
# PM-022 / SCP-038: on a current-head runtime-doors red, choose fail-look vs outside-look.
# Caller already verified: not stale SHA, PR idle (no hold labels).
set -euo pipefail

pr="${1:?usage: runtime-doors-red-label.sh PR_NUMBER}"
N="${RUNTIME_DOORS_ESCALATE_N:-4}"

timeline=$(gh api "repos/${GITHUB_REPOSITORY}/issues/${pr}/timeline" --paginate 2>/dev/null || echo "[]")

reset_ts=$(echo "$timeline" | jq -r '
  [.[] | select(.event == "labeled" and (.label.name == "emerge" or .label.name == "outside-look")) | .created_at]
  | if length == 0 then "1970-01-01T00:00:00Z" else max end
')

fail_count=$(echo "$timeline" | jq --arg reset "$reset_ts" '
  [.[] | select(.event == "labeled" and .label.name == "fail-look" and .created_at > $reset)] | length
')

next=$((fail_count + 1))
if [[ "$next" -ge "$N" ]]; then
  echo "outside-look"
else
  echo "fail-look"
fi
