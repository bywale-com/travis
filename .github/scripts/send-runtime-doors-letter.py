#!/usr/bin/env python3
"""House mail when runtime-doors is red for ops, not an Engineer recut.

Not emerge. Subject is the miss, not \"ops emerged — walk this sheet\"."""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request


def main() -> int:
    if len(sys.argv) < 3:
        print("usage: send-runtime-doors-letter.py LETTER SUBJECT")
        return 1
    letter_path, subject = sys.argv[1], sys.argv[2]
    to = os.environ.get("EMERGE_EMAIL", "").strip()
    key = os.environ.get("RESEND_API_KEY", "").strip()
    sender = os.environ.get("RESEND_FROM_EMAIL", "").strip()
    if not (to and key and sender):
        print("No EMERGE_EMAIL + RESEND_API_KEY + RESEND_FROM_EMAIL. Issue is the letter.")
        return 0
    body = open(letter_path, encoding="utf-8").read()
    payload = {
        "from": sender,
        "to": [to],
        "subject": subject,
        "text": body,
    }
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "User-Agent": "travis-house-runtime-doors/1.0",
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
