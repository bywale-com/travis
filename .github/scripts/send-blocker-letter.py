#!/usr/bin/env python3
"""House mail. Not Travis. Called from wake-packet-seats.yml on BLOCKER push."""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request


def parse_cause(body: str) -> str:
    for line in body.splitlines():
        m = re.match(r"^\*\*Cause:\*\*\s*(.+)$", line.strip())
        if m:
            return m.group(1).strip()
    return "Deploy blocked"


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: send-blocker-letter.py BLOCKER_FILE")
        return 1
    blocker_path = sys.argv[1]
    to = os.environ.get("EMERGE_EMAIL", "").strip()
    key = os.environ.get("RESEND_API_KEY", "").strip()
    sender = os.environ.get("RESEND_FROM_EMAIL", "").strip()
    if not (to and key and sender):
        print("No EMERGE_EMAIL + RESEND_API_KEY + RESEND_FROM_EMAIL.")
        return 2
    body = open(blocker_path, encoding="utf-8").read()
    cause = parse_cause(body)
    payload: dict = {
        "from": sender,
        "to": [to],
        "subject": f"[BLOCKER] {cause}",
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
