"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { SeatMark } from "@/components/QueueChrome";
import { readJson } from "@/lib/http";
import { seatSlugFromLabel } from "@/lib/seat-slug";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import { TYPE } from "@/theme/scale";
import type { Tokens } from "@/theme/tokens";
import { plateShell, quietLink } from "./shell";

export type CreatedAgent = { id: string; seatKey: string; label: string };

type Options = { models: string[]; repositories: string[] };

function fieldLabel(t: Tokens): CSSProperties {
  return {
    fontSize: TYPE.meta,
    letterSpacing: "0.08em",
    color: t.textMuted,
    margin: "24px 0 8px",
  };
}

function underlineField(t: Tokens): CSSProperties {
  return {
    width: "100%",
    border: "none",
    borderBottom: `1px solid ${t.border}`,
    background: "transparent",
    color: t.textPrimary,
    fontSize: TYPE.body,
    padding: "8px 0",
    outline: "none",
    fontFamily: "inherit",
    appearance: "none",
    borderRadius: 0,
  };
}

export function CreateAgent({
  t,
  backLabel,
  costLine,
  onBack,
  onCreated,
}: {
  t: Tokens;
  backLabel: string;
  costLine?: string | null;
  onBack: () => void;
  onCreated: (agent: CreatedAgent) => void;
}) {
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [repository, setRepository] = useState("");
  const [ref, setRef] = useState("main");
  const [options, setOptions] = useState<Options>({ models: [], repositories: [] });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await fetch("/api/agents/options");
      const data = await readJson<Options>(res);
      if (cancelled) return;
      setOptions({
        models: Array.isArray(data.models) ? data.models : [],
        repositories: Array.isArray(data.repositories) ? data.repositories : [],
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const slug = seatSlugFromLabel(name);
  const markKey = slug || name.trim() || "agent";

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: name,
          model: model.trim() || undefined,
          repository: repository.trim() || undefined,
          ref: ref.trim() || undefined,
        }),
      });
      const data = await readJson<{ agent?: CreatedAgent; error?: string }>(res);
      if (!res.ok || !data.agent) {
        throw new Error(data.error ?? "Cursor would not create the agent.");
      }
      onCreated(data.agent);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SurfaceBoundary id="create-agent" label="Create an agent" order={3}>
      <div style={plateShell(t)}>
        <header style={{ padding: "16px 20px 8px" }}>
          <button
            type="button"
            onClick={onBack}
            style={{ ...quietLink(t), color: t.textSecondary, fontSize: TYPE.meta }}
          >
            ← {backLabel.trim() || "Back"}
          </button>
          <h1
            style={{
              fontSize: TYPE.title,
              margin: "12px 0 0",
              fontWeight: 600,
            }}
          >
            Create an agent
          </h1>
        </header>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "8px 20px 16px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ ...fieldLabel(t), marginTop: 16 }}>NAME</p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Agent name"
                style={underlineField(t)}
              />
            </div>
            <div style={{ textAlign: "center", paddingBottom: 4 }}>
              <SeatMark seatKey={markKey} label={name.trim() || "Agent"} t={t} size={40} />
              <div style={{ fontSize: TYPE.meta, color: t.textMuted, marginTop: 4 }}>
                mark
              </div>
            </div>
          </div>

          <p style={fieldLabel(t)}>MODEL</p>
          {options.models.length ? (
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={underlineField(t)}
            >
              <option value="">Choose a model</option>
              {options.models.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Model id"
              style={underlineField(t)}
            />
          )}

          <p style={fieldLabel(t)}>REPOSITORY</p>
          {options.repositories.length ? (
            <select
              value={repository}
              onChange={(e) => setRepository(e.target.value)}
              style={underlineField(t)}
            >
              <option value="">Choose a repository</option>
              {options.repositories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={repository}
              onChange={(e) => setRepository(e.target.value)}
              placeholder="owner/repo"
              style={underlineField(t)}
            />
          )}

          <p style={fieldLabel(t)}>STARTING REF</p>
          <input
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="main"
            style={underlineField(t)}
          />
          <p style={{ margin: "8px 0 0", color: t.textMuted, fontSize: TYPE.meta }}>
            branch, tag or commit
          </p>

          {costLine ? (
            <p style={{ margin: "28px 0 0", color: t.textMuted, fontSize: TYPE.meta }}>
              {costLine}
            </p>
          ) : (
            <p style={{ margin: "28px 0 0", color: t.textMuted, fontSize: TYPE.meta }}>
              Runs are billed to your Cursor account.
            </p>
          )}
        </div>

        {error ? (
          <p style={{ color: t.dangerQuiet, padding: "0 20px" }}>{error}</p>
        ) : null}

        <div style={{ padding: "12px 20px 24px" }}>
          <button
            type="button"
            disabled={busy || !name.trim()}
            onClick={() => void submit()}
            style={{
              width: "100%",
              height: 48,
              border: "none",
              borderRadius: 8,
              background: t.accent,
              color: t.bgPrimary,
              fontSize: TYPE.body,
              fontWeight: 600,
              cursor: busy || !name.trim() ? "default" : "pointer",
              opacity: busy || !name.trim() ? 0.55 : 1,
            }}
          >
            {busy ? "Creating…" : "Create agent"}
          </button>
          <p
            style={{
              textAlign: "center",
              color: t.textMuted,
              fontSize: TYPE.meta,
              margin: "12px 0 0",
              lineHeight: 1.45,
            }}
          >
            You can remove it from the room later.
            <br />
            Deleting an agent for good is done by hand.
          </p>
        </div>
      </div>
    </SurfaceBoundary>
  );
}
