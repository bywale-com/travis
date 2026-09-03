"use client";

import { SeatMark } from "@/components/QueueChrome";
import {
  backlogAge,
  backlogNextWord,
  backlogStageKeys,
} from "@/lib/backlog-face";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import { TYPE } from "@/theme/scale";
import type { Tokens } from "@/theme/tokens";
import { plateShell, quietLink } from "./shell";

export type BacklogRow = {
  id: string;
  title: string;
  foundingText: string;
  status: string;
  createdAt: string | Date;
  litSeatKeys: string[];
  next: "travis" | "pm" | "sa" | "engineer" | null;
};

export function BacklogIndex({
  t,
  rows,
  selectedId,
  loading,
  onSelect,
  onOpen,
  onClose,
  onRequests,
}: {
  t: Tokens;
  rows: BacklogRow[];
  selectedId: string | null;
  loading?: boolean;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
  onClose: () => void;
  onRequests: () => void;
}) {
  return (
    <SurfaceBoundary
      id="backlog-index"
      label="Backlog"
      order={8}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 42,
        background: t.bgPrimary,
      }}
    >
      <div style={plateShell(t)}>
        <header style={{ padding: "20px 20px 8px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <h1
              style={{
                fontFamily: "var(--travis-logo)",
                fontSize: TYPE.display,
                fontWeight: 800,
                letterSpacing: "0.14em",
                margin: 0,
              }}
            >
              TRAVIS
            </h1>
            <button type="button" onClick={onClose} style={quietLink(t)}>
              Close
            </button>
          </div>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: TYPE.title,
              color: t.textPrimary,
            }}
          >
            Backlog
          </p>
        </header>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "8px 0" }}>
          {rows.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: t.textMuted,
                fontStyle: "italic",
                marginTop: 48,
              }}
            >
              {loading
                ? "Loading…"
                : "Nothing Travis is orchestrating yet."}
            </p>
          ) : (
            rows.map((row) => {
              const on = row.id === selectedId;
              const done = row.status === "done";
              const title = row.title.trim() || row.foundingText.trim() || "Untitled";
              const stage = backlogStageKeys(row.litSeatKeys, row.next);
              const nextWord = backlogNextWord(row.next, row.status);
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => {
                    onSelect(row.id);
                    onOpen(row.id);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    border: "none",
                    borderBottom: `1px solid ${t.border}`,
                    background: on ? t.selectedWash : "transparent",
                    padding: "14px 20px",
                    cursor: "pointer",
                    color: done ? t.textMuted : t.textPrimary,
                    opacity: done ? 0.55 : 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        fontSize: TYPE.body,
                        fontWeight: 600,
                      }}
                    >
                      {title}
                    </div>
                    <span
                      style={{
                        fontSize: TYPE.meta,
                        color: done ? t.textMuted : t.textSecondary,
                        fontWeight: 600,
                      }}
                    >
                      {nextWord}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {stage.map((key) => (
                      <SeatMark
                        key={key}
                        seatKey={key}
                        t={t}
                        size={26}
                        glow={key === row.next && !done}
                      />
                    ))}
                    <span style={{ flex: 1 }} />
                    <span style={{ fontSize: TYPE.meta, color: t.textMuted }}>
                      {backlogAge(row.createdAt)}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <footer style={{ padding: "16px 20px 28px", textAlign: "center" }}>
          <button type="button" onClick={onRequests} style={quietLink(t)}>
            Not the request log
          </button>
          <p
            style={{
              margin: "10px 0 0",
              color: t.textMuted,
              fontSize: TYPE.meta,
              fontStyle: "italic",
            }}
          >
            Only what you gave Travis. Direct-to-seat stays personal.
          </p>
        </footer>
      </div>
    </SurfaceBoundary>
  );
}
