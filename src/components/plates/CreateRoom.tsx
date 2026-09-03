"use client";

import { SeatMark } from "@/components/QueueChrome";
import { isTravisSeat } from "@/lib/seats";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import { TYPE } from "@/theme/scale";
import type { Tokens } from "@/theme/tokens";
import { plateShell, quietLink } from "./shell";

export type CatalogSeat = {
  id: string;
  seatKey: string | null;
  label: string;
};

export function CreateRoom({
  t,
  title,
  catalog,
  chosen,
  busy,
  error,
  onTitle,
  onToggle,
  onCreate,
  onBack,
  onCreateAgent,
}: {
  t: Tokens;
  title: string;
  catalog: CatalogSeat[];
  chosen: Set<string>;
  busy?: boolean;
  error?: string | null;
  onTitle: (v: string) => void;
  onToggle: (id: string) => void;
  onCreate: () => void;
  onBack: () => void;
  onCreateAgent: () => void;
}) {
  return (
    <SurfaceBoundary id="create-room" label="Create a room" order={2}>
      <div style={plateShell(t)}>
        <header style={{ padding: "16px 20px 8px" }}>
          <button
            type="button"
            onClick={onBack}
            style={{ ...quietLink(t), color: t.textSecondary, fontSize: TYPE.meta }}
          >
            ← Rooms
          </button>
          <h1
            style={{
              fontSize: TYPE.title,
              margin: "12px 0 0",
              fontWeight: 600,
            }}
          >
            New room
          </h1>
        </header>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "8px 20px 16px" }}>
          <p
            style={{
              fontSize: TYPE.meta,
              letterSpacing: "0.08em",
              color: t.textMuted,
              margin: "16px 0 8px",
            }}
          >
            NAME
          </p>
          <input
            value={title}
            onChange={(e) => onTitle(e.target.value)}
            placeholder="Room name"
            style={{
              width: "100%",
              border: "none",
              borderBottom: `1px solid ${t.border}`,
              background: "transparent",
              color: t.textPrimary,
              fontSize: TYPE.body,
              padding: "8px 0",
              outline: "none",
              fontFamily: "inherit",
            }}
          />

          <p
            style={{
              fontSize: TYPE.meta,
              letterSpacing: "0.08em",
              color: t.textMuted,
              margin: "28px 0 8px",
            }}
          >
            WHO IS IN AT BIRTH
          </p>
          {catalog.map((seat) => {
            const travis = isTravisSeat(seat.seatKey);
            const on = travis || chosen.has(seat.id);
            return (
              <button
                key={seat.id}
                type="button"
                onClick={() => !travis && onToggle(seat.id)}
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  border: "none",
                  background: "transparent",
                  color: t.textPrimary,
                  cursor: travis ? "default" : "pointer",
                }}
              >
                <SeatMark
                  seatKey={seat.seatKey ?? seat.label}
                  label={seat.label}
                  t={t}
                  size={28}
                />
                <span style={{ flex: 1, textAlign: "left" }}>
                  <span style={{ display: "block", fontSize: TYPE.body }}>
                    {seat.label}
                  </span>
                  {travis ? (
                    <span style={{ fontSize: TYPE.meta, color: t.textMuted }}>
                      always in room
                    </span>
                  ) : null}
                </span>
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    border: `2px solid ${on ? t.accent : t.border}`,
                    background: on ? t.accent : "transparent",
                  }}
                />
              </button>
            );
          })}

          <div style={{ marginTop: 16 }}>
            <button type="button" onClick={onCreateAgent} style={quietLink(t)}>
              Create an agent instead
            </button>
          </div>
        </div>

        {error ? (
          <p style={{ color: t.dangerQuiet, padding: "0 20px" }}>{error}</p>
        ) : null}

        <div style={{ padding: "12px 20px 24px" }}>
          <button
            type="button"
            disabled={busy}
            onClick={onCreate}
            style={{
              width: "100%",
              height: 48,
              border: "none",
              borderRadius: 8,
              background: t.accent,
              color: t.bgPrimary,
              fontSize: TYPE.body,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {busy ? "Creating…" : "Create room"}
          </button>
          <p
            style={{
              textAlign: "center",
              color: t.textMuted,
              fontSize: TYPE.meta,
              margin: "12px 0 0",
            }}
          >
            You can add or remove anyone later.
          </p>
        </div>
      </div>
    </SurfaceBoundary>
  );
}
