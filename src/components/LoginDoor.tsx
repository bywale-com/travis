"use client";

import { useMemo, useState } from "react";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import { TYPE } from "@/theme/scale";
import { AntShell } from "@/theme/AntShell";
import { useCharacter } from "@/theme/character";
import { plateShell, quietLink } from "@/components/plates/shell";
import { Button } from "antd";
import { readJson } from "@/lib/http";

export function LoginDoor() {
  const { t } = useCharacter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return email.trim().includes("@") && email.trim().length <= 254;
  }, [email]);

  async function requestLink() {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/operator/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await readJson<{ ok?: boolean; error?: string }>(res);
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setStatus("Check your email — open the personal Travis link.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AntShell t={t}>
      <SurfaceBoundary id="login-door" label="Login door" order={0}>
        <div style={{ ...plateShell(t), overflowY: "auto", padding: 24 }}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "var(--travis-logo)",
                fontSize: TYPE.display,
                fontWeight: 800,
                letterSpacing: "0.14em",
                marginBottom: 8,
              }}
            >
              TRAVIS
            </div>
            <p style={{ margin: 0, color: t.textSecondary, fontSize: TYPE.body }}>
              Personal access by email — no password.
            </p>
          </div>

          <div style={{ maxWidth: 420, margin: "28px auto 0" }}>
            <p style={{ margin: "0 0 12px", color: t.textSecondary, fontSize: TYPE.meta }}>
              Enter your email. If it’s on the allowlist, we’ll send your personal link.
            </p>

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              inputMode="email"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: `2px solid ${t.border}`,
                background: "transparent",
                color: t.textPrimary,
                outline: "none",
                marginBottom: 12,
                fontSize: 16,
              }}
            />

            <Button
              block
              type="primary"
              disabled={!canSubmit || busy}
              onClick={() => void requestLink()}
              style={{
                background: t.accent,
                borderColor: t.accent,
                height: 44,
              }}
            >
              {busy ? "Sending…" : "Send login link"}
            </Button>

            {status ? (
              <p
                style={{
                  marginTop: 16,
                  color: t.textSecondary,
                  textAlign: "center",
                  whiteSpace: "pre-wrap",
                  fontStyle: "italic",
                }}
              >
                {status}
              </p>
            ) : null}

            <div style={{ marginTop: 22, textAlign: "center" }}>
              <button type="button" onClick={() => setEmail("")} style={quietLink(t)}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </SurfaceBoundary>
    </AntShell>
  );
}

