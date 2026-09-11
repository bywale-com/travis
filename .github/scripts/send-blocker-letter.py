#!/usr/bin/env python3
"""House mail. Not Travis. Called from wake-packet-seats.yml on BLOCKER file push."""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request


def _field(content: str, name: str) -> str:
    m = re.search(rf"^\*\*{re.escape(name)}:\*\*\s*(.+)$", content, re.MULTILINE)
    return m.group(1).strip() if m else ""


def _parse_blocker(path: str) -> dict[str, str]:
    content = open(path, encoding="utf-8").read()
    title = re.match(r"^#\s*BLOCKER-(\d+)\s*[—–-]\s*(.+)$", content, re.MULTILINE)
    nnn = title.group(1) if title else ""
    short = title.group(2).strip() if title else ""

    cause = _field(content, "Cause") or short
    required = _field(content, "Required action")
    resolve_at = _field(content, "Resolve at")
    pr_url = _field(content, "PR")
    when = _field(content, "When")

    tape_m = re.search(r"^\*\*Tape excerpt:\*\*\s*\n(.*)$", content, re.MULTILINE | re.DOTALL)
    tape = tape_m.group(1).strip() if tape_m else ""

    pocket = short or f"BLOCKER-{nnn}" if nnn else os.path.basename(path)
    pr_num = re.search(r"/pull/(\d+)", pr_url)
    if pr_num:
        pocket = f"PR #{pr_num.group(1)}"

    return {
        "nnn": nnn,
        "pocket": pocket,
        "cause": cause,
        "required": required,
        "resolve_at": resolve_at,
        "pr_url": pr_url,
        "when": when,
        "tape": tape,
    }


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

    parsed = _parse_blocker(blocker_path)
    cause = parsed["cause"] or "founder ops required"
    subject = f"[BLOCKER] {parsed['pocket']} blocked — {cause}"

    lines = [
        f"Blocker {parsed['nnn'] or os.path.basename(blocker_path)} needs founder action.",
        "",
        f"Cause: {cause}",
    ]
    if parsed["required"]:
        lines.extend(["", f"Required action: {parsed['required']}"])
    if parsed["resolve_at"]:
        lines.extend(["", f"Resolve at: {parsed['resolve_at']}"])
    if parsed["pr_url"]:
        lines.extend(["", f"PR: {parsed['pr_url']}"])
    if parsed["when"]:
        lines.extend(["", f"When: {parsed['when']}"])
    if parsed["tape"]:
        lines.extend(["", "Tape excerpt:", parsed["tape"]])

    payload = {
        "from": sender,
        "to": [to],
        "subject": subject,
        "text": "\n".join(lines),
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
