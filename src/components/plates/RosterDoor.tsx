"use client";

import { SeatMark } from "@/components/QueueChrome";
import { isTravisSeat } from "@/lib/seats";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import { TYPE } from "@/theme/scale";
import type { Tokens } from "@/theme/tokens";
import { quietLink } from "./shell";

export type RosterMember = {
  id?: string;
  seatKey: string | null;
  label: string;
  status?: string;
};

export function RosterDoor({
  t,
  roomTitle,
  members,
  catalog,
  adding,
  costLine,
  onClose,
  onRemove,
  onAdd,
  onCreateAgent,
  onToggleAdd,
  onEnd,
}: {
  t: Tokens;
  roomTitle: string;
  members: RosterMember[];
  catalog: RosterMember[];
  adding: boolean;
  costLine?: string | null;
  onClose: () => void;
  onRemove: (member: RosterMember) => void;
  onAdd: (member: RosterMember) => void;
  onCreateAgent: () => void;
  onToggleAdd: () => void;
  onEnd?: () => void;
}) {
  const inIds = new Set(members.map((m) => m.id).filter(Boolean) as string[]);
  const inKeys = new Set(
    members.map((m) => m.seatKey).filter(Boolean) as string[],
  );
  const addable = catalog.filter((c) => {
    if (c.id && inIds.has(c.id)) return false;
    if (c.seatKey && inKeys.has(c.seatKey)) return false;
    return true;
  });

  return (
    <SurfaceBoundary
      id="room-roster"
      label="Room roster"
      order={8}
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
          padding: "16px 20px 24px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: TYPE.title }}>In this room</h2>
          <span style={{ fontSize: TYPE.meta, color: t.textMuted }}>
            {roomTitle.trim() || "Untitled"}
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

        <div style={{ marginTop: 16 }}>
          {members.map((m) => {
            const locked = isTravisSeat(m.seatKey);
            return (
              <div
                key={`${m.seatKey}-${m.label}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                }}
              >
                <SeatMark
                  seatKey={m.seatKey ?? m.label}
                  label={m.label}
                  t={t}
                  size={28}
                />
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: TYPE.body }}>
                    {m.label}
                  </span>
                  <span style={{ fontSize: TYPE.meta, color: t.textMuted }}>
                    {locked ? "always here" : (m.status ?? "idle")}
                  </span>
                </span>
                {locked ? (
                  <span style={{ color: t.textMuted }}>—</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onRemove(m)}
                    style={{ ...quietLink(t), fontSize: TYPE.meta }}
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {adding ? (
          <div style={{ marginTop: 12 }}>
            {addable.length === 0 ? (
              <p style={{ color: t.textMuted, fontSize: TYPE.meta }}>
                Everyone is already in.
              </p>
            ) : (
              addable.map((m) => (
                <button
                  key={m.id ?? m.seatKey}
                  type="button"
                  onClick={() => onAdd(m)}
                  style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 0",
                    border: "none",
                    background: "transparent",
                    color: t.textPrimary,
                    cursor: "pointer",
                  }}
                >
                  <SeatMark
                    seatKey={m.seatKey ?? m.label}
                    label={m.label}
                    t={t}
                    size={24}
                  />
                  {m.label}
                </button>
              ))
            )}
          </div>
        ) : null}

        <div style={{ marginTop: 16 }}>
          <button type="button" onClick={onToggleAdd} style={quietLink(t)}>
            {adding ? "Done" : "Add an agent"}
          </button>
          <span style={{ margin: "0 12px", color: t.border }}>·</span>
          <button type="button" onClick={onCreateAgent} style={quietLink(t)}>
            Create an agent
          </button>
        </div>

        {costLine ? (
          <p
            style={{
              margin: "24px 0 0",
              color: t.textMuted,
              fontSize: TYPE.meta,
            }}
          >
            {costLine}
          </p>
        ) : null}

        {onEnd ? (
          <div style={{ marginTop: 20 }}>
            <button
              type="button"
              onClick={onEnd}
              style={{ ...quietLink(t), color: t.dangerQuiet, fontSize: TYPE.meta }}
            >
              End room
            </button>
          </div>
        ) : null}
      </div>
    </SurfaceBoundary>
  );
}
