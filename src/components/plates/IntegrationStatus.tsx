"use client";

import { useEffect, useState } from "react";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import { TYPE } from "@/theme/scale";
import type { Tokens } from "@/theme/tokens";
import { plateShell, quietLink } from "./shell";
import type { IntegrationStatus } from "@/server/create-agent";

function Dot({ connected, t }: { connected: boolean; t: Tokens }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: connected ? t.accent : "transparent",
        border: connected ? "none" : `2px solid ${t.textMuted}`,
        flexShrink: 0,
        marginTop: 3,
      }}
    />
  );
}

function SectionLabel({ children, t }: { children: string; t: Tokens }) {
  return (
    <p
      style={{
        fontSize: TYPE.meta,
        letterSpacing: "0.08em",
        color: t.textMuted,
        margin: "20px 0 8px",
      }}
    >
      {children}
    </p>
  );
}

function StatusRow({
  t,
  connected,
  primary,
  secondary,
  action,
}: {
  t: Tokens;
  connected: boolean;
  primary: string;
  secondary: string;
  action?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        paddingBottom: 16,
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      <Dot connected={connected} t={t} />
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: TYPE.body }}>{primary}</p>
        <p style={{ margin: "2px 0 0", fontSize: TYPE.meta, color: t.textMuted }}>
          {secondary}
        </p>
      </div>
      {action ? (
        <span style={{ fontSize: TYPE.meta, color: t.textMuted, paddingTop: 2 }}>
          {action}
        </span>
      ) : null}
    </div>
  );
}

function UnavailableRow({ label, t }: { label: string; t: Tokens }) {
  return (
    <div style={{ paddingBottom: 16, borderBottom: `1px solid ${t.border}` }}>
      <p style={{ margin: 0, fontSize: TYPE.meta, color: t.textMuted, fontStyle: "italic" }}>
        {label}
      </p>
    </div>
  );
}

export function IntegrationStatusScreen({
  t,
  onBack,
}: {
  t: Tokens;
  onBack: () => void;
}) {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/integrations/status");
        const data = (await res.json()) as IntegrationStatus;
        if (!cancelled) setStatus(data);
      } catch {
        // leave null
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SurfaceBoundary id="integration-status" label="Cursor connection" order={11}>
      <div style={{ ...plateShell(t), overflowY: "auto" }}>
        <header style={{ padding: "16px 20px 8px" }}>
          <button
            type="button"
            onClick={onBack}
            style={{ ...quietLink(t), color: t.textSecondary, fontSize: TYPE.meta }}
          >
            ← Back
          </button>
          <h1 style={{ fontSize: TYPE.title, fontWeight: 600, margin: "12px 0 0" }}>
            Cursor
          </h1>
        </header>

        <div style={{ flex: 1, overflowY: "auto", padding: "4px 20px 24px" }}>
          {loading ? (
            <p style={{ color: t.textMuted, fontSize: TYPE.meta, marginTop: 24 }}>
              Checking…
            </p>
          ) : !status ? (
            <p style={{ color: t.textMuted, fontSize: TYPE.meta, marginTop: 24 }}>
              Could not reach the server.
            </p>
          ) : (
            <>
              <SectionLabel t={t}>CONNECTION</SectionLabel>
              {status.cursor.connected ? (
                <StatusRow
                  t={t}
                  connected
                  primary="Connected"
                  secondary={`${status.cursor.email} · ${status.cursor.keyName}`}
                  action="Change"
                />
              ) : (
                <StatusRow
                  t={t}
                  connected={false}
                  primary="Not connected"
                  secondary={
                    status.cursor.reason === "missing_key"
                      ? "CURSOR_API_KEY missing"
                      : "Invalid key"
                  }
                  action="Set up"
                />
              )}
              {!status.cursor.connected && (
                <p style={{ fontSize: TYPE.meta, color: t.textMuted, margin: "6px 0 0", fontStyle: "italic" }}>
                  Add CURSOR_API_KEY in Vercel — keys stay server-side.
                </p>
              )}

              <SectionLabel t={t}>GITHUB</SectionLabel>
              {status.github.connected ? (
                <StatusRow
                  t={t}
                  connected
                  primary={status.github.org}
                  secondary={`${status.github.repoCount} repos visible`}
                  action="Change"
                />
              ) : status.github.reason === "no_cursor" ? (
                <UnavailableRow label="No connection — requires Cursor. Resolve above first." t={t} />
              ) : (
                <StatusRow
                  t={t}
                  connected={false}
                  primary="Not connected"
                  secondary="No GitHub scope on this key"
                  action="Connect"
                />
              )}

              <SectionLabel t={t}>MODELS</SectionLabel>
              {status.models.available ? (
                <div style={{ paddingBottom: 16, borderBottom: `1px solid ${t.border}` }}>
                  <p style={{ margin: 0, fontSize: TYPE.body, color: t.textSecondary }}>
                    Fetched from Cursor
                    <span style={{ float: "right", color: t.textMuted, fontSize: TYPE.meta }}>
                      {status.models.count} available
                    </span>
                  </p>
                </div>
              ) : (
                <UnavailableRow label="— unavailable without Cursor" t={t} />
              )}

              <SectionLabel t={t}>REPOSITORIES</SectionLabel>
              {status.repositories.available ? (
                <div style={{ paddingBottom: 16, borderBottom: `1px solid ${t.border}` }}>
                  <p style={{ margin: 0, fontSize: TYPE.body, color: t.textSecondary }}>
                    Fetched from GitHub
                    <span style={{ float: "right", color: t.textMuted, fontSize: TYPE.meta }}>
                      {status.repositories.count} visible
                    </span>
                  </p>
                </div>
              ) : (
                <UnavailableRow
                  label={
                    status.cursor.connected
                      ? "— unavailable without GitHub"
                      : "— unavailable without Cursor"
                  }
                  t={t}
                />
              )}
            </>
          )}

          <p
            style={{
              marginTop: 32,
              fontSize: TYPE.meta,
              color: t.textMuted,
              fontStyle: "italic",
            }}
          >
            Keys stay server-side. Never sent to this device.
          </p>
        </div>
      </div>
    </SurfaceBoundary>
  );
}
