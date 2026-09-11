#!/bin/sh
# Vercel Ignored Build Step. Exit 0 = skip. Exit 1 = build.
# https://vercel.com/docs/project-configuration/vercel-json#ignorecommand
#
# Preview is opt-in. The only green light is an exact first-line subject
# matching the Action empty commit. Naming the tag in a body ("No …")
# must not build. Production always builds.

set -u
if [ "${VERCEL_ENV:-}" = "production" ]; then
  echo "vercel-ignore: build (production)"
  exit 1
fi
msg="${VERCEL_GIT_COMMIT_MESSAGE:-}"
first=$(printf '%s\n' "$msg" | awk 'NR==1 { sub(/\r$/, ""); print; exit }')
if [ "$first" = "Preview [vercel build]" ]; then
  echo "vercel-ignore: build (green light)"
  exit 1
fi
echo "vercel-ignore: skip (subject is not the green-light commit)"
exit 0
