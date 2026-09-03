"use client";

import { useEffect, useState } from "react";
import { SeatMark } from "@/components/QueueChrome";
import { relativeTime } from "@/lib/relative-time";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import { TYPE } from "@/theme/scale";
import type { Tokens } from "@/theme/tokens";
import { plateShell, quietLink } from "./shell";

export type RoomRow = {
  id: string;
  title: string;
  status: string;
  createdAt: string | Date;
  endedAt: string | Date | null;
  members: Array<{ seatKey: string | null; label: string }>;
};

export function RoomIndex({
  t,
  rooms,
  selectedId,
  busy,
  loading,
  error,
  onSelect,
  onEnter,
  onNew,
  onLeave,
  onEnd,
  onRename,
  onCharacter,
  onIntegrations,
}: {
  t: Tokens;
  rooms: RoomRow[];
  selectedId: string | null;
  busy?: boolean;
  loading?: boolean;
  error?: string | null;
  onSelect: (id: string) => void;
  onEnter: (id: string) => void;
  onNew: () => void;
  onLeave: () => void;
  onEnd: () => void;
  onRename: (id: string, title: string) => void;
  onCharacter: () => void;
  onIntegrations?: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState("");
  const selected = rooms.find((r) => r.id === selectedId) ?? null;

  useEffect(() => {
    setRenaming(false);
    setDraft(selected?.title ?? "");
  }, [selectedId, selected?.title]);

  const commitRename = () => {
    if (!selectedId) return;
    onRename(selectedId, draft);
    setRenaming(false);
  };

  return (
    <SurfaceBoundary id="room-index" label="Room index" order={1}>
      <div style={plateShell(t)}>
        <header style={{ padding: "20px 20px 8px" }}>
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
          <p
            style={{
              margin: "8px 0 0",
              fontSize: TYPE.title,
              color: t.textPrimary,
            }}
          >
            Rooms
          </p>
        </header>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "8px 0" }}>
          {rooms.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: t.textMuted,
                fontStyle: "italic",
                marginTop: 48,
              }}
            >
              {loading ? "Loading rooms…" : "No rooms yet."}
            </p>
          ) : (
            rooms.map((room) => {
              const on = room.id === selectedId;
              const live = room.status !== "ended";
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => onSelect(room.id)}
                  onDoubleClick={() => onEnter(room.id)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    border: "none",
                    borderLeft: on ? `2px solid ${t.accent}` : "2px solid transparent",
                    background: on ? t.selectedWash : "transparent",
                    padding: "12px 20px",
                    cursor: "pointer",
                    color: t.textPrimary,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    {renaming && on ? (
                      <input
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            commitRename();
                          }
                          if (e.key === "Escape") setRenaming(false);
                        }}
                        onBlur={commitRename}
                        placeholder="Untitled"
                        style={{
                          flex: 1,
                          minWidth: 0,
                          border: "none",
                          borderBottom: `1px solid ${t.border}`,
                          background: "transparent",
                          color: t.textPrimary,
                          fontSize: TYPE.body,
                          fontWeight: 600,
                          fontFamily: "inherit",
                          outline: "none",
                          padding: "0 0 2px",
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: TYPE.body, fontWeight: 600 }}>
                        {room.title.trim() || "Untitled"}
                      </span>
                    )}
                    <span style={{ fontSize: TYPE.meta, color: t.textMuted }}>
                      {relativeTime(room.createdAt)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 8,
                    }}
                  >
                    {room.members.slice(0, 6).map((m) => (
                      <SeatMark
                        key={`${m.seatKey}-${m.label}`}
                        seatKey={m.seatKey ?? m.label}
                        label={m.label}
                        t={t}
                        size={22}
                      />
                    ))}
                    {room.members.length > 6 ? (
                      <span style={{ fontSize: TYPE.meta, color: t.textMuted }}>
                        +{room.members.length - 6}
                      </span>
                    ) : null}
                    <span style={{ flex: 1 }} />
                    {live ? (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: t.accent,
                        }}
                      />
                    ) : null}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div style={{ padding: "16px 20px 12px", textAlign: "center" }}>
          <button type="button" onClick={onNew} disabled={busy} style={quietLink(t)}>
            New room
          </button>
        </div>

        {error ? (
          <p style={{ color: t.dangerQuiet, textAlign: "center", margin: 0 }}>
            {error}
          </p>
        ) : null}

        <footer
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 20px 24px",
            color: t.textSecondary,
            fontSize: TYPE.body,
          }}
        >
          <button
            type="button"
            onClick={onLeave}
            style={{ ...quietLink(t), color: t.textSecondary, textDecoration: "none" }}
          >
            Leave
          </button>
          <button
            type="button"
            onClick={() => {
              if (!selected) return;
              setDraft(selected.title);
              setRenaming(true);
            }}
            disabled={!selectedId || busy}
            style={{
              ...quietLink(t),
              color: selectedId ? t.textSecondary : t.textMuted,
              textDecoration: "none",
            }}
          >
            Rename
          </button>
          <button
            type="button"
            onClick={() => selectedId && onEnter(selectedId)}
            disabled={!selectedId || busy}
            style={{
              ...quietLink(t),
              color: selectedId ? t.textPrimary : t.textMuted,
              textDecoration: "none",
            }}
          >
            {busy && selectedId ? "Entering…" : "Enter"}
          </button>
          <button
            type="button"
            onClick={onEnd}
            disabled={!selectedId || busy}
            style={{
              ...quietLink(t),
              color: t.dangerQuiet,
              textDecoration: "none",
            }}
          >
            End room
          </button>
        </footer>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0 20px 16px",
          }}
        >
          <button
            type="button"
            onClick={onCharacter}
            style={{
              ...quietLink(t),
              color: t.textMuted,
              fontSize: TYPE.meta,
              textDecoration: "none",
            }}
          >
            Mission · Carbon
          </button>
          {onIntegrations ? (
            <button
              type="button"
              onClick={onIntegrations}
              style={{
                ...quietLink(t),
                color: t.textMuted,
                fontSize: TYPE.meta,
                textDecoration: "none",
              }}
            >
              Cursor
            </button>
          ) : null}
        </div>
      </div>
    </SurfaceBoundary>
  );
}
