import type { ReactNode } from "react";
import {
  queuedBlockLabel,
  waitingChipLabel,
  type QueueSeatDto,
} from "@/lib/queue-logic";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import type { Tokens } from "@/theme/tokens";

function IconSend({ color }: { color: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

function IconDelete({ color }: { color: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function IconBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        border: "none",
        background: "transparent",
        padding: 4,
        cursor: "pointer",
        display: "inline-flex",
        lineHeight: 0,
      }}
    >
      {children}
    </button>
  );
}

export function QueueChips({
  t,
  seats,
  onSendHead,
  onDeleteHead,
}: {
  t: Tokens;
  seats: QueueSeatDto[];
  onSendHead: (seatKey: string) => void;
  onDeleteHead: (seatKey: string) => void;
}) {
  if (!seats.length) return null;
  return (
    <SurfaceBoundary id="queue-glance" label="Waiting chip" order={5}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          padding: "4px 20px 8px",
        }}
      >
        {seats.map((seat) => (
          <div
            key={seat.seatKey}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 8px 4px 12px",
              borderRadius: 999,
              background: t.bgElevated,
              border: `1px solid ${t.border}`,
              color: t.textSecondary,
              fontSize: 12,
            }}
          >
            <span>
              {waitingChipLabel(seat.items.length, seat.seatKey)}
            </span>
            <IconBtn
              label={`Force send ${seat.short}`}
              onClick={() => onSendHead(seat.seatKey)}
            >
              <IconSend color={t.accent} />
            </IconBtn>
            <IconBtn
              label={`Delete waiting ${seat.short}`}
              onClick={() => onDeleteHead(seat.seatKey)}
            >
              <IconDelete color={t.textMuted} />
            </IconBtn>
          </div>
        ))}
      </div>
    </SurfaceBoundary>
  );
}

export function QueueLog({
  t,
  seats,
  onSendItem,
  onDeleteItem,
}: {
  t: Tokens;
  seats: QueueSeatDto[];
  onSendItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
}) {
  if (!seats.length) return null;
  return (
    <SurfaceBoundary id="queue-log" label="Queued lines" order={6}>
      {seats.map((seat) => (
        <div key={seat.seatKey} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 12,
              color: t.textMuted,
              textAlign: "right",
            }}
          >
            {queuedBlockLabel(seat.seatKey)}
          </p>
          {seat.items.map((item) => (
            <div
              key={item.id}
              data-surface-id="queue-row"
              style={{
                alignSelf: "flex-end",
                width: "92%",
                marginLeft: "auto",
                border: `1px dashed ${t.border}`,
                borderRadius: "16px 16px 4px 16px",
                padding: "10px 12px",
                background: "transparent",
                color: t.textPrimary,
                fontSize: 15,
                lineHeight: 1.45,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <span style={{ flex: 1, minWidth: 0 }}>{item.text}</span>
                <span style={{ display: "inline-flex", flexShrink: 0 }}>
                  <IconBtn
                    label="Force send"
                    onClick={() => onSendItem(item.id)}
                  >
                    <IconSend color={t.accent} />
                  </IconBtn>
                  <IconBtn
                    label="Delete queued line"
                    onClick={() => onDeleteItem(item.id)}
                  >
                    <IconDelete color={t.textMuted} />
                  </IconBtn>
                </span>
              </div>
              <span
                style={{
                  display: "block",
                  marginTop: 4,
                  fontSize: 11,
                  color: t.textMuted,
                  textAlign: "right",
                }}
              >
                · {seat.short}
              </span>
            </div>
          ))}
        </div>
      ))}
    </SurfaceBoundary>
  );
}
