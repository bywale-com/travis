#!/bin/sh
# Vercel Ignored Build Step. Exit 0 = skip this deploy. Exit 1 = build.
# https://vercel.com/docs/project-configuration/vercel-json#ignorecommand
#
# Stage: git push → Vercel Git hook, BEFORE a preview exists, BEFORE
# runtime-doors. Paper holds (`[vercel skip]`) must not rebuild into a
# known wall. Founder unlabel pushes an empty commit WITHOUT the tag, so
# that release still builds.

set -u
# Only the Vercel-provided message for THIS commit. Do not fall back to
# `git log` — that can see a parent whose subject merely names the tag.
msg="${VERCEL_GIT_COMMIT_MESSAGE:-}"
if [ -z "$msg" ]; then
  echo "vercel-ignore: build (no VERCEL_GIT_COMMIT_MESSAGE)"
  exit 1
fi
if echo "$msg" | grep -q '\[vercel skip\]'; then
  echo "vercel-ignore: skip (tag in this commit message)"
  exit 0
fi
echo "vercel-ignore: build"
exit 1
