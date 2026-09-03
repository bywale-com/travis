"use client";

/**
 * SCP-011 — I4. Model + repo are selection rows opening real pickers.
 * No free-text model/repo inputs. Rebuilt from plate.
 */
import { useEffect, useState, type CSSProperties } from "react";
import { SeatMark } from "@/components/QueueChrome";
import { ModelPicker } from "@/components/plates/ModelPicker";
import { RepoPicker } from "@/components/plates/RepoPicker";
import { readJson } from "@/lib/http";
import { seatSlugFromLabel } from "@/lib/seat-slug";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import { TYPE } from "@/theme/scale";
import type { Tokens } from "@/theme/tokens";
import type { ModelOption, OptionsResponse, RepoOption } from "@/server/create-agent";
import { plateShell, quietLink } from "./shell";
import { ChevronRight } from "lucide-react";

export type CreatedAgent = { id: string; seatKey: string; label: string };

function fieldLabel(t: Tokens): CSSProperties {
  return {
    fontSize: TYPE.meta,
    letterSpacing: "0.08em",
    color: t.textMuted,
    margin: "24px 0 8px",
  };
}

function underlineInput(t: Tokens): CSSProperties {
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
  };
}

function SelectionRow({
  t,
  primary,
  secondary,
  placeholder,
  onClick,
}: {
  t: Tokens;
  primary?: string;
  secondary?: string;
  placeholder: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        width: "100%",
        alignItems: "flex-start",
        border: "none",
        borderBottom: `1px solid ${t.border}`,
        background: "transparent",
        color: t.textPrimary,
        padding: "8px 0",
        cursor: "pointer",
        fontFamily: "inherit",
        gap: 4,
      }}
    >
      <div style={{ flex: 1, textAlign: "left" }}>
        {primary ? (
          <>
            <span style={{ display: "block", fontSize: TYPE.body, fontWeight: 600 }}>
              {primary}
            </span>
            {secondary ? (
              <span style={{ display: "block", fontSize: TYPE.meta, color: t.textMuted }}>
                {secondary}
              </span>
            ) : null}
          </>
        ) : (
          <span style={{ fontSize: TYPE.body, color: t.textMuted }}>{placeholder}</span>
        )}
      </div>
      <ChevronRight size={16} color={t.textMuted} style={{ marginTop: 2, flexShrink: 0 }} />
    </button>
  );
}

export function CreateAgent({
  t,
  backLabel,
  onBack,
  onCreated,
}: {
  t: Tokens;
  backLabel: string;
  onBack: () => void;
  onCreated: (agent: CreatedAgent) => void;
}) {
  const [name, setName] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelOption | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<RepoOption | null>(null);
  const [recentRepoUrl, setRecentRepoUrl] = useState<string | null>(null);
  const [ref, setRef] = useState("");
  const [options, setOptions] = useState<OptionsResponse>({
    models: [],
    repositories: [],
    defaultModelId: null,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showRepoPicker, setShowRepoPicker] = useState(false);

  const slug = seatSlugFromLabel(name);
  const markKey = slug || name.trim() || "agent";

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/integrations/options");
        const data = await readJson<OptionsResponse>(res);
        if (cancelled) return;
        setOptions(data);
        if (data.defaultModelId) {
          const def = data.models.find((m) => m.id === data.defaultModelId) ?? null;
          if (def) setSelectedModel(def);
        }
      } catch {
        // leave empty
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: name,
          model: selectedModel?.id,
          repository: selectedRepo?.url,
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
          <h1 style={{ fontSize: TYPE.title, margin: "12px 0 0", fontWeight: 600 }}>
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
                style={underlineInput(t)}
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
          <SelectionRow
            t={t}
            primary={selectedModel?.id}
            secondary={selectedModel?.variantLabel || selectedModel?.displayName}
            placeholder="Select model"
            onClick={() => setShowModelPicker(true)}
          />

          <p style={fieldLabel(t)}>REPOSITORY</p>
          <SelectionRow
            t={t}
            primary={selectedRepo?.name}
            secondary={selectedRepo?.url}
            placeholder="Select repository"
            onClick={() => setShowRepoPicker(true)}
          />

          <p style={fieldLabel(t)}>STARTING REF</p>
          <input
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="main"
            style={underlineInput(t)}
          />
          <p style={{ margin: "6px 0 0", color: t.textMuted, fontSize: TYPE.meta }}>
            branch, tag, or commit
          </p>

          <p style={{ margin: "28px 0 0", color: t.textMuted, fontSize: TYPE.meta }}>
            Runs are billed to your Cursor account.
          </p>
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

      {showModelPicker ? (
        <ModelPicker
          t={t}
          models={options.models}
          defaultModelId={options.defaultModelId}
          onSelect={(m) => {
            setSelectedModel(m);
            setShowModelPicker(false);
          }}
          onClose={() => setShowModelPicker(false)}
        />
      ) : null}

      {showRepoPicker ? (
        <RepoPicker
          t={t}
          repos={options.repositories}
          recentUrl={recentRepoUrl}
          onSelect={(r) => {
            setSelectedRepo(r);
            setRecentRepoUrl(r.url);
            setShowRepoPicker(false);
          }}
          onClose={() => setShowRepoPicker(false)}
        />
      ) : null}
    </SurfaceBoundary>
  );
}
