#!/bin/sh
# Vercel Ignored Build Step. Exit 0 = skip. Exit 1 = build.
# https://vercel.com/docs/project-configuration/vercel-json#ignorecommand
#
# Preview is opt-in. Seat handoffs (SA, Engineer, PM Look, fail-look)
# must not deploy. Production always builds.

set -u
if [ "${VERCEL_ENV:-}" = "production" ]; then
  echo "vercel-ignore: build (production)"
  exit 1
fi
msg="${VERCEL_GIT_COMMIT_MESSAGE:-}"
if echo "$msg" | grep -q '\[vercel build\]'; then
  echo "vercel-ignore: build (green light)"
  exit 1
fi
echo "vercel-ignore: skip (no [vercel build] on this commit)"
exit 0
