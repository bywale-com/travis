"use client";

import type { CSSProperties } from "react";
import { Send, X } from "lucide-react";
import { SeatMark } from "@/components/QueueChrome";
import type { QueueSeatDto } from "@/lib/queue-logic";
import { elapsedLabel } from "@/lib/relative-time";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import { TYPE } from "@/theme/scale";
import type { Tokens } from "@/theme/tokens";
import { quietLink } from "./shell";

export type RunningNow = {
  seatKey: string;
  label: string;
  elapsedMs: number;
};

function ordinal(n: number): string {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
}

function sectionLabel(t: Tokens): CSSProperties {
  return {
    fontSize: TYPE.meta,
    letterSpacing: "0.08em",
    color: t.textMuted,
    margin: "20px 0 8px",
  };
}

export function InFlightDoor({
  t,
  running,
  waiting,
  onClose,
  onSendItem,
  onDeleteItem,
  onSendNext,
}: {
  t: Tokens;
  running: RunningNow[];
  waiting: QueueSeatDto[];
  onClose: () => void;
  onSendItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onSendNext: () => void;
}) {
  const waitingRows = waiting.flatMap((seat) =>
    seat.items.map((item) => ({ seat, item })),
  );

  return (
    <SurfaceBoundary
      id="in-flight"
      label="In flight"
      order={9}
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
        }}
      >
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 999,
            background: t.border,
            margin: "0 auto 16px",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <h2 style={{ margin: 0, fontSize: TYPE.title }}>In flight</h2>
          <span style={{ fontSize: TYPE.meta, color: t.textMuted }}>
            you can leave this open
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            ...quietLink(t),
            color: t.textMuted,
            fontSize: TYPE.meta,
            marginTop: 4,
          }}
        >
          Close
        </button>

        <p style={sectionLabel(t)}>RUNNING NOW</p>
        {running.length === 0 ? (
          <p style={{ color: t.textMuted, fontSize: TYPE.meta, margin: 0 }}>
            Nothing running.
          </p>
        ) : (
          running.map((row) => (
            <div
              key={`${row.seatKey}-${row.elapsedMs}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom: `1px solid ${t.border}`,
              }}
            >
              <SeatMark
                seatKey={row.seatKey}
                label={row.label}
                t={t}
                size={32}
                glow
              />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: TYPE.body, fontWeight: 600 }}>
                  {row.label}
                </span>
              </span>
              <span style={{ color: t.accent, fontSize: TYPE.meta }}>
                {elapsedLabel(row.elapsedMs)}
              </span>
            </div>
          ))
        )}

        <p style={sectionLabel(t)}>WAITING</p>
        {waitingRows.length === 0 ? (
          <p style={{ color: t.textMuted, fontSize: TYPE.meta, margin: 0 }}>
            Nothing waiting.
          </p>
        ) : (
          waitingRows.map(({ seat, item }, i) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom: `1px solid ${t.border}`,
              }}
            >
              <SeatMark seatKey={seat.seatKey} label={seat.label} t={t} size={32} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: TYPE.body }}>
                  {seat.label}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: TYPE.meta,
                    color: t.textMuted,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.text}
                </span>
              </span>
              <span style={{ color: t.textMuted, fontSize: TYPE.meta }}>
                {ordinal(i + 1)}
              </span>
              <button
                type="button"
                aria-label="Send now"
                onClick={() => onSendItem(item.id)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: t.accent,
                  padding: 4,
                  cursor: "pointer",
                }}
              >
                <Send size={16} />
              </button>
              <button
                type="button"
                aria-label="Delete waiting line"
                onClick={() => onDeleteItem(item.id)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: t.textMuted,
                  padding: 4,
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>
          ))
        )}

        <div style={{ marginTop: 24 }}>
          <button
            type="button"
            onClick={onSendNext}
            disabled={waitingRows.length === 0}
            style={{
              ...quietLink(t),
              color: waitingRows.length ? t.accent : t.textMuted,
            }}
          >
            Send next without waiting
          </button>
          <p
            style={{
              margin: "6px 0 0",
              color: t.textMuted,
              fontSize: TYPE.meta,
            }}
          >
            Travis does this too.
          </p>
        </div>

        <p
          style={{
            textAlign: "center",
            color: t.textMuted,
            fontSize: TYPE.meta,
            margin: "28px 0 0",
          }}
        >
          Nothing is read aloud from here.
        </p>
      </div>
    </SurfaceBoundary>
  );
}
