"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { defaultLookTurnIds } from "@/lib/look-miss";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import { TYPE } from "@/theme/scale";
import type { Tokens } from "@/theme/tokens";
import { quietLink } from "./shell";

export type LookMissTurn = {
  id: string;
  kind: string;
  text: string;
};

function lookRows(turns: LookMissTurn[]): LookMissTurn[] {
  return turns
    .filter(
      (row) =>
        row.kind === "user" ||
        row.kind === "assistant" ||
        row.kind === "agent_post",
    )
    .slice()
    .reverse();
}

export function LookMissDoor({
  t,
  sessionId,
  turns,
  onClose,
}: {
  t: Tokens;
  sessionId: string;
  turns: LookMissTurn[];
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(defaultLookTurnIds(turns)),
  );
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [miss, setMiss] = useState("");
  const rows = lookRows(turns);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function file() {
    if (busy) return;
    setBusy(true);
    setMiss("");
    try {
      const res = await fetch(`/api/session/${sessionId}/look`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          note,
          turnIds: [...selected],
        }),
      });
      if (res.status >= 200 && res.status < 300) {
        onClose();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (data.error) setMiss(data.error);
    } catch {
      /* keep sheet; no toast */
    } finally {
      setBusy(false);
    }
  }

  const sheet = (
    <SurfaceBoundary
      id="look-miss"
      label="Look"
      order={11}
      style={{
        position: "fixed",
        inset: 0,
        background: `${t.bgPrimary}ee`,
        zIndex: 40,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
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
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 999,
            background: t.border,
            margin: "0 auto",
          }}
        />
        <h2 style={{ margin: 0, fontSize: TYPE.title }}>Look</h2>
        <button type="button" onClick={onClose} style={quietLink(t)}>
          Close
        </button>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          aria-label="Note"
          rows={3}
          style={{
            width: "100%",
            boxSizing: "border-box",
            border: `1px solid ${t.border}`,
            background: t.bgPrimary,
            color: t.textPrimary,
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: TYPE.body,
            fontFamily: "inherit",
            resize: "vertical",
          }}
        />
        {rows.map((row) => {
          const on = selected.has(row.id);
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => toggle(row.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                border: "none",
                borderRadius: 8,
                padding: "10px 12px",
                cursor: "pointer",
                fontFamily: "inherit",
                background: on ? t.selectedWash : "transparent",
                color: t.textPrimary,
                fontWeight: on ? 650 : 400,
                fontSize: TYPE.body,
              }}
            >
              {row.text}
            </button>
          );
        })}
        {miss ? (
          <p style={{ margin: 0, color: t.dangerQuiet, fontSize: TYPE.meta }}>
            {miss}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => void file()}
          disabled={busy}
          style={{
            border: "none",
            background: t.accent,
            color: t.bgPrimary,
            borderRadius: 10,
            padding: "12px 16px",
            fontSize: TYPE.body,
            fontWeight: 650,
            cursor: busy ? "wait" : "pointer",
            fontFamily: "inherit",
          }}
        >
          File
        </button>
      </div>
    </SurfaceBoundary>
  );

  if (typeof document === "undefined") return sheet;
  return createPortal(sheet, document.body);
}
