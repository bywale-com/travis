#!/usr/bin/env python3
"""House blocker mail. Not Travis. Called from wake-packet-seats.yml."""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request


def parse_blocker(body: str) -> tuple[str, str, str]:
    """Return (title, pocket, cause) from a BLOCKER markdown file."""
    title = ""
    for line in body.splitlines():
        m = re.match(r"^#\s+Blocker\s+\d+\s+—\s+(.+)$", line.strip())
        if m:
            title = m.group(1).strip()
            break
        m = re.match(r"^#\s+(.+)$", line.strip())
        if m and not title:
            title = m.group(1).strip()

    pocket = ""
    cause = ""
    section = ""
    for line in body.splitlines():
        stripped = line.strip()
        if re.match(r"^\*\*Pocket\*\*", stripped, re.I):
            section = "pocket"
            rest = re.sub(r"^\*\*Pocket\*\*\s*:?\s*", "", stripped, flags=re.I)
            if rest:
                pocket = rest
            continue
        if re.match(r"^\*\*Cause\*\*", stripped, re.I):
            section = "cause"
            rest = re.sub(r"^\*\*Cause\*\*\s*:?\s*", "", stripped, flags=re.I)
            if rest:
                cause = rest
            continue
        if section == "pocket" and stripped and not stripped.startswith("**"):
            pocket = (pocket + " " + stripped).strip() if pocket else stripped
            continue
        if section == "cause" and stripped and not stripped.startswith("**"):
            cause = (cause + " " + stripped).strip() if cause else stripped
            continue
        if stripped.startswith("**") and section:
            section = ""

    if not cause:
        for para in re.split(r"\n\s*\n", body.strip()):
            p = para.strip()
            if p and not p.startswith("#") and not p.startswith("**"):
                cause = p.split("\n")[0].strip()
                break

    if not pocket:
        pocket = title or "Travis PR"

    if not title:
        title = pocket

    return title, pocket, cause or title


def build_subject(pocket: str, cause: str) -> str:
    short_cause = cause.split("\n")[0].strip()
    if len(short_cause) > 120:
        short_cause = short_cause[:117] + "..."
    return f"[BLOCKER] {pocket} blocked — {short_cause}"


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: send-blocker-letter.py BLOCKER.md")
        return 1

    blocker_path = sys.argv[1]
    body = open(blocker_path, encoding="utf-8").read()
    title, pocket, cause = parse_blocker(body)
    subject = build_subject(pocket, cause)

    to = os.environ.get("EMERGE_EMAIL", "").strip()
    key = os.environ.get("RESEND_API_KEY", "").strip()
    sender = os.environ.get("RESEND_FROM_EMAIL", "").strip()
    if not (to and key and sender):
        print(f"No EMERGE_EMAIL + RESEND_API_KEY + RESEND_FROM_EMAIL. Would send: {subject}")
        return 0

    payload: dict = {
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
