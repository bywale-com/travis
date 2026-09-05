#!/usr/bin/env python3
"""House mail. Not Travis. Called from wake-packet-seats.yml."""

from __future__ import annotations

import base64
import json
import os
import sys
import urllib.error
import urllib.request


def main() -> int:
    if len(sys.argv) < 3:
        print("usage: send-emerge-letter.py LETTER NNN [ATTACHMENT] [FILENAME]")
        return 1
    letter_path, nnn = sys.argv[1], sys.argv[2]
    att = sys.argv[3] if len(sys.argv) > 3 else ""
    testfile = sys.argv[4] if len(sys.argv) > 4 else ""
    to = os.environ.get("EMERGE_EMAIL", "").strip()
    key = os.environ.get("RESEND_API_KEY", "").strip()
    sender = os.environ.get("RESEND_FROM_EMAIL", "").strip()
    if not (to and key and sender):
        print("No EMERGE_EMAIL + RESEND_API_KEY + RESEND_FROM_EMAIL.")
        return 2
    body = open(letter_path, encoding="utf-8").read()
    payload: dict = {
        "from": sender,
        "to": [to],
        "subject": f"{nnn} emerged — walk this sheet",
        "text": body,
    }
    if att:
        raw = open(att, "rb").read()
        payload["attachments"] = [
            {
                "filename": (testfile or "packet-test.md").rsplit("/", 1)[-1],
                "content": base64.b64encode(raw).decode("ascii"),
            }
        ]
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "User-Agent": "travis-house-emerge/1.0",
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
