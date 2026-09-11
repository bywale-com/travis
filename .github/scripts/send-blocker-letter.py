#!/usr/bin/env python3
"""House mail when a PR is blocked on founder ops. Not Travis."""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request


def main() -> int:
    if len(sys.argv) < 4:
        print("usage: send-blocker-letter.py POCKET CAUSE BLOCKER_PATH")
        return 1
    pocket, cause, blocker_path = sys.argv[1], sys.argv[2], sys.argv[3]
    to = os.environ.get("EMERGE_EMAIL", "").strip()
    key = os.environ.get("RESEND_API_KEY", "").strip()
    sender = os.environ.get("RESEND_FROM_EMAIL", "").strip()
    if not (to and key and sender):
        print("No EMERGE_EMAIL + RESEND_API_KEY + RESEND_FROM_EMAIL.")
        return 2
    body = open(blocker_path, encoding="utf-8").read()
    payload: dict = {
        "from": sender,
        "to": [to],
        "subject": f"[BLOCKER] {pocket} blocked — {cause}",
        "text": body,
    }
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "User-Agent": "travis-house-blocker/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            print("Resend", resp.status, resp.read().decode()[:300])
        return 0
    except urllib.error.HTTPError as e:
        print("Resend failed", e.code, e.read().decode()[:400])
        return 0
    except Exception as e:
        print("Resend skipped/failed:", e)
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
