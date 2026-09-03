"use client";

import { useMemo, useState } from "react";
import { SeatMark } from "@/components/QueueChrome";
import {
  filterRequests,
  formatStamp,
  requestDestLabel,
  type RequestWhen,
} from "@/lib/request-log";
import { relativeTime } from "@/lib/relative-time";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import { TYPE } from "@/theme/scale";
import type { Tokens } from "@/theme/tokens";
import { quietLink } from "./shell";

export type RequestLogItem = {
  id: string;
  seq: number;
  seatKey: string | null;
  text: string;
  createdAt?: string;
};

export function RequestLogDoor({
  t,
  items,
  onClose,
  onOpenTurn,
}: {
  t: Tokens;
  items: RequestLogItem[];
  onClose: () => void;
  onOpenTurn: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [when, setWhen] = useState<RequestWhen>("all");
  const rows = useMemo(
    () => filterRequests(items, { q, when }),
    [items, q, when],
  );

  return (
    <SurfaceBoundary
      id="request-log"
      label="Request log"
      order={10}
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <h2 style={{ margin: 0, fontSize: TYPE.title }}>Requests</h2>
          <span style={{ fontSize: TYPE.meta, color: t.textMuted }}>
            {items.length ? `${rows.length} of ${items.length}` : "empty"}
          </span>
        </div>
        <button type="button" onClick={onClose} style={quietLink(t)}>
          Close
        </button>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search this room"
          aria-label="Search requests"
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
          }}
        />
        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: TYPE.meta,
          }}
        >
          {([
            ["all", "All"],
            ["today", "Today"],
            ["week", "Week"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setWhen(key)}
              style={{
                border: "none",
                background: "transparent",
                padding: 0,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: TYPE.meta,
                color: when === key ? t.textPrimary : t.textMuted,
                fontWeight: when === key ? 650 : 400,
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {rows.length === 0 ? (
          <p style={{ color: t.textMuted, fontSize: TYPE.meta, margin: 0 }}>
            {items.length === 0
              ? "Nothing sent in this room yet."
              : "Nothing matches."}
          </p>
        ) : (
          rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => onOpenTurn(row.id)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "10px 0",
                border: "none",
                borderBottom: `1px solid ${t.border}`,
                background: "transparent",
                color: t.textPrimary,
                textAlign: "left",
                width: "100%",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <SeatMark
                seatKey={row.seatKey ?? "travis"}
                label={requestDestLabel(row.seatKey)}
                t={t}
                size={28}
              />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: TYPE.meta,
                    color: t.textMuted,
                  }}
                >
                  {requestDestLabel(row.seatKey)}
                  {row.createdAt
                    ? ` · ${formatStamp(row.createdAt)} · ${relativeTime(row.createdAt)}`
                    : null}
                </span>
                <span
                  style={{
                    display: "block",
                    marginTop: 4,
                    fontSize: TYPE.body,
                    lineHeight: 1.4,
                  }}
                >
                  {row.text}
                </span>
              </span>
            </button>
          ))
        )}
      </div>
    </SurfaceBoundary>
  );
}
