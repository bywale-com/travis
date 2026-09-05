"use client";

import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import { TYPE } from "@/theme/scale";
import type { Tokens } from "@/theme/tokens";
import type { StreamEventGrain, StreamGrain } from "@/lib/stream";
import { quietLink } from "./shell";

export function StreamDoor({
  t,
  stream,
  onClose,
}: {
  t: Tokens;
  stream: StreamGrain;
  onClose: () => void;
}) {
  return (
    <SurfaceBoundary
      id="stream-compartment"
      label="Stream"
      order={9}
      style={{
        position: "fixed",
        inset: 0,
        background: `${t.bgPrimary}ee`,
        zIndex: 42,
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
            alignItems: "baseline",
          }}
        >
          <h2 style={{ margin: 0, fontSize: TYPE.title }}>Stream</h2>
          <button
            type="button"
            onClick={onClose}
            style={{ ...quietLink(t), color: t.textMuted, fontSize: TYPE.meta }}
          >
            Close
          </button>
        </div>
        <p
          style={{
            margin: "16px 0 0",
            fontSize: TYPE.body,
            color: t.textPrimary,
            lineHeight: 1.45,
          }}
        >
          {stream.triggerText}
        </p>
        <div style={{ marginTop: 16 }}>
          {stream.events.map((event) => (
            <StreamEventRow key={event.id} event={event} t={t} />
          ))}
        </div>
      </div>
    </SurfaceBoundary>
  );
}

export function StreamCard({
  t,
  stream,
  onOpen,
}: {
  t: Tokens;
  stream: StreamGrain;
  onOpen: (id: string) => void;
}) {
  return (
    <SurfaceBoundary
      id="stream-card"
      label="Stream"
      order={6}
      style={{
        alignSelf: "flex-start",
        maxWidth: "92%",
        marginLeft: 36,
        marginBottom: 4,
      }}
    >
      <button
        type="button"
        onClick={() => onOpen(stream.id)}
        style={{
          display: "block",
          width: "100%",
          textAlign: "left",
          border: `1px solid ${t.border}`,
          background: t.selectedWash,
          color: t.textPrimary,
          borderRadius: 8,
          padding: "8px 12px",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <div style={{ fontSize: TYPE.meta, color: t.textMuted }}>Stream</div>
        <div
          style={{
            marginTop: 4,
            fontSize: TYPE.body,
            lineHeight: 1.4,
          }}
        >
          {stream.triggerText}
        </div>
      </button>
    </SurfaceBoundary>
  );
}

function StreamEventRow({
  event,
  t,
}: {
  event: StreamEventGrain;
  t: Tokens;
}) {
  if (event.kind === "thought") {
    return (
      <p
        style={{
          margin: "8px 0 0",
          fontSize: TYPE.meta,
          color: t.textMuted,
          lineHeight: 1.45,
        }}
      >
        {event.body}
      </p>
    );
  }
  if (event.kind === "process") {
    return (
      <div
        style={{
          margin: "10px 0 0",
          fontSize: TYPE.meta,
          color: t.textSecondary,
          lineHeight: 1.45,
        }}
      >
        <div>{event.tool}</div>
        {event.body.trim() ? (
          <div
            style={{
              marginTop: 2,
              color: t.receiptText,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {event.body}
          </div>
        ) : null}
      </div>
    );
  }
  return (
    <p
      style={{
        margin: "10px 0 0",
        fontSize: TYPE.body,
        color: t.textPrimary,
        lineHeight: 1.45,
        whiteSpace: "pre-wrap",
      }}
    >
      {event.body}
    </p>
  );
}
