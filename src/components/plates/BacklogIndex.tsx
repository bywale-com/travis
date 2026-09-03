"use client";

import { SeatMark } from "@/components/QueueChrome";
import {
  backlogAge,
  backlogNextWord,
  backlogStageKeys,
} from "@/lib/backlog-face";
import type { BacklogView } from "@/lib/motion";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import { TYPE } from "@/theme/scale";
import type { Tokens } from "@/theme/tokens";
import { plateShell, quietLink } from "./shell";

export type BacklogInitiativeRow = {
  kind: "initiative";
  id: string;
  title: string;
  foundingText: string;
  status: string;
  createdAt: string | Date;
  litSeatKeys: string[];
  next: "travis" | "pm" | "sa" | "engineer" | null;
};

export type BacklogMotionRow = {
  kind: "motion";
  id: string;
  title: string;
  status: string;
  stepN: number;
  stepM: number;
  under: string;
  updatedAt?: string | Date;
};

export type BacklogItem = BacklogInitiativeRow | BacklogMotionRow;

/** @deprecated use BacklogInitiativeRow — kept for ticket open path */
export type BacklogRow = BacklogInitiativeRow;

const VIEWS: { id: BacklogView; label: string }[] = [
  { id: "all", label: "All" },
  { id: "in_motion", label: "In motion" },
  { id: "initiatives", label: "Initiatives" },
];

function emptyCopy(view: BacklogView, loading?: boolean): string {
  if (loading) return "Loading…";
  if (view === "in_motion") return "Nothing in motion.";
  if (view === "initiatives") return "No tickets yet.";
  return "Nothing Travis is orchestrating yet.";
}

export function BacklogIndex({
  t,
  rows,
  view,
  selectedId,
  loading,
  onView,
  onSelect,
  onOpen,
  onClose,
  onRequests,
}: {
  t: Tokens;
  rows: BacklogItem[];
  view: BacklogView;
  selectedId: string | null;
  loading?: boolean;
  onView: (view: BacklogView) => void;
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
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 10,
            }}
          >
            {VIEWS.map((v) => {
              const on = v.id === view;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onView(v.id)}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    cursor: "pointer",
                    fontSize: TYPE.meta,
                    fontWeight: on ? 600 : 400,
                    color: on ? t.textPrimary : t.textMuted,
                  }}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
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
              {emptyCopy(view, loading)}
            </p>
          ) : (
            rows.map((row) =>
              row.kind === "motion" ? (
                <MotionRow
                  key={`motion:${row.id}`}
                  row={row}
                  t={t}
                  selected={row.id === selectedId}
                  onSelect={() => onSelect(row.id)}
                />
              ) : (
                <InitiativeRow
                  key={`initiative:${row.id}`}
                  row={row}
                  t={t}
                  selected={row.id === selectedId}
                  onSelect={() => {
                    onSelect(row.id);
                    onOpen(row.id);
                  }}
                />
              ),
            )
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

function MotionRow({
  row,
  t,
  selected,
  onSelect,
}: {
  row: BacklogMotionRow;
  t: Tokens;
  selected: boolean;
  onSelect: () => void;
}) {
  const failed = row.status === "failed";
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        border: "none",
        borderBottom: `1px solid ${t.border}`,
        background: selected ? t.selectedWash : "transparent",
        padding: "14px 20px",
        cursor: "pointer",
        color: failed ? t.textMuted : t.textPrimary,
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
          {row.title.trim() || "Untitled"}
        </div>
        <span
          style={{
            fontSize: TYPE.meta,
            color: failed ? t.dangerQuiet : t.textSecondary,
            fontWeight: 600,
          }}
        >
          step {row.stepN} of {row.stepM}
        </span>
      </div>
      <div
        style={{
          fontSize: TYPE.meta,
          color: t.textMuted,
        }}
      >
        {failed ? "failed" : row.under}
      </div>
    </button>
  );
}

function InitiativeRow({
  row,
  t,
  selected,
  onSelect,
}: {
  row: BacklogInitiativeRow;
  t: Tokens;
  selected: boolean;
  onSelect: () => void;
}) {
  const done = row.status === "done";
  const title = row.title.trim() || row.foundingText.trim() || "Untitled";
  const stage = backlogStageKeys(row.litSeatKeys, row.next);
  const nextWord = backlogNextWord(row.next, row.status);
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        border: "none",
        borderBottom: `1px solid ${t.border}`,
        background: selected ? t.selectedWash : "transparent",
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
}
