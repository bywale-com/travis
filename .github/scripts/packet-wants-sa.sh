#!/usr/bin/env bash
# Cheap gate: a PM packet wakes SA only when it has this exact line:
#   **Wake:** sa
# Missing, **Wake:** hold, or any other value = wait. No Cursor boot.
# Usage: packet-wants-sa.sh <file> [<file>...]
# Reads files from disk. Exit 0 if any file wants SA; 1 if all are on hold.
set -euo pipefail
if [[ $# -lt 1 ]]; then
  echo "hold (no packet file)"
  exit 1
fi
wants=""
for f in "$@"; do
  if [[ ! -f "$f" ]]; then
    echo "$f missing on disk — hold"
    continue
  fi
  if grep -q '^\*\*Wake:\*\* sa[[:space:]]*$' "$f"; then
    echo "$f has Wake: sa"
    wants=1
  else
    echo "$f is on hold (no **Wake:** sa)"
  fi
done
if [[ -n "$wants" ]]; then
  exit 0
fi
exit 1
