"use client";

import { TYPE } from "@/theme/scale";
import type { Tokens } from "@/theme/tokens";
import type { ModelOption } from "@/server/create-agent";
import { quietLink } from "./shell";

export function ModelPicker({
  t,
  models,
  defaultModelId,
  onSelect,
  onClose,
}: {
  t: Tokens;
  models: ModelOption[];
  defaultModelId: string | null;
  onSelect: (model: ModelOption) => void;
  onClose: () => void;
}) {
  const defaultModel = models.find((m) => m.id === defaultModelId) ?? null;
  const rest = models.filter((m) => m.id !== defaultModelId);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: `${t.bgPrimary}ee`,
        zIndex: 50,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "86dvh",
          background: t.bgElevated,
          borderRadius: "16px 16px 0 0",
          padding: "12px 20px 24px",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: 36, height: 4, borderRadius: 999, background: t.border, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 style={{ margin: 0, fontSize: TYPE.title }}>Model</h2>
          <span style={{ fontSize: TYPE.meta, color: t.textMuted }}>Cursor</span>
        </div>
        <button type="button" onClick={onClose} style={{ ...quietLink(t), color: t.textMuted, fontSize: TYPE.meta, marginTop: 4 }}>
          Close
        </button>

        {models.length === 0 ? (
          <p style={{ marginTop: 24, color: t.textMuted, fontSize: TYPE.meta }}>
            No models available — check the Cursor connection.
          </p>
        ) : (
          <>
            {defaultModel ? (
              <>
                <p style={{ fontSize: TYPE.meta, letterSpacing: "0.08em", color: t.textMuted, margin: "20px 0 8px" }}>
                  RECOMMENDED FOR NEW AGENTS
                </p>
                <ModelRow model={defaultModel} t={t} onSelect={onSelect} badge="default" />
              </>
            ) : null}

            <p style={{ fontSize: TYPE.meta, letterSpacing: "0.08em", color: t.textMuted, margin: "20px 0 8px" }}>
              AVAILABLE
            </p>
            {rest.map((m) => (
              <ModelRow key={m.id} model={m} t={t} onSelect={onSelect} />
            ))}
          </>
        )}

        <p style={{ marginTop: 20, fontSize: TYPE.meta, color: t.textMuted }}>
          Models fetched from Cursor · your key
        </p>
      </div>
    </div>
  );
}

function ModelRow({
  model,
  t,
  onSelect,
  badge,
}: {
  model: ModelOption;
  t: Tokens;
  onSelect: (m: ModelOption) => void;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(model)}
      style={{
        display: "flex",
        width: "100%",
        alignItems: "flex-start",
        textAlign: "left",
        border: "none",
        borderBottom: `1px solid ${t.border}`,
        background: "transparent",
        color: t.textPrimary,
        padding: "10px 0",
        cursor: "pointer",
        fontFamily: "inherit",
        gap: 8,
      }}
    >
      <div style={{ flex: 1 }}>
        <span style={{ display: "block", fontSize: TYPE.body, fontWeight: 600 }}>
          {model.id}
          {model.variantLabel ? (
            <span style={{ fontWeight: 400, color: t.textMuted }}> · {model.variantLabel}</span>
          ) : null}
        </span>
        <span style={{ display: "block", fontSize: TYPE.meta, color: t.textMuted }}>
          {model.displayName}
        </span>
      </div>
      {badge ? (
        <span
          style={{
            fontSize: TYPE.meta,
            color: t.textMuted,
            border: `1px solid ${t.border}`,
            borderRadius: 4,
            padding: "1px 5px",
            flexShrink: 0,
          }}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}
