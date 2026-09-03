import { Send, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "antd";
import {
  queuedBlockLabel,
  waitingChipLabel,
  type QueueSeatDto,
} from "@/lib/queue-logic";
import { seatInitials, seatTintIndex } from "@/lib/seat-mark";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import type { Tokens } from "@/theme/tokens";

export function SeatMark({
  seatKey,
  label,
  t,
  size = 28,
  glow = false,
}: {
  seatKey: string;
  label?: string | null;
  t: Tokens;
  size?: number;
  glow?: boolean;
}) {
  // No hardcoded cast. A fifth agent gets a stable mark and tint for free.
  const color = t.seatTints[seatTintIndex(seatKey, t.seatTints.length)];
  const mark = seatInitials(seatKey, label);
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        color: t.seatInk,
        fontSize: size < 32 ? 10 : 11,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: glow ? `0 0 0 3px ${color}55, 0 0 14px ${color}66` : "none",
      }}
    >
      {mark}
    </span>
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
    <Button
      type="text"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{ padding: 4, height: 28, width: 28 }}
    >
      {children}
    </Button>
  );
}

/** C4: floating glance bar, not a tiny centered pill. */
export function QueueChips({
  t,
  seats,
  onOpen,
  onSendHead,
  onDeleteHead,
}: {
  t: Tokens;
  seats: QueueSeatDto[];
  onOpen?: () => void;
  onSendHead?: (seatKey: string) => void;
  onDeleteHead?: (seatKey: string) => void;
}) {
  if (!seats.length) return null;
  return (
    <SurfaceBoundary id="queue-glance" label="Waiting chip" order={5}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: "4px 16px 12px",
        }}
      >
        {seats.map((seat) => (
          <div
            key={seat.seatKey}
            role={onOpen ? "button" : undefined}
            tabIndex={onOpen ? 0 : undefined}
            onClick={onOpen}
            onKeyDown={(e) => {
              if (!onOpen) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpen();
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px 10px 14px",
              borderRadius: 16,
              background: t.bgElevated,
              border: `1px solid ${t.accent}`,
              color: t.accent,
              fontSize: 14,
              cursor: onOpen ? "pointer" : "default",
            }}
          >
            <SeatMark seatKey={seat.seatKey} label={seat.label} t={t} size={28} />
            <span style={{ flex: 1, minWidth: 0 }}>
              {waitingChipLabel(seat.items.length, seat.seatKey, seat.label)}
            </span>
            {onSendHead ? (
              <IconBtn
                label={`Force send ${seat.short}`}
                onClick={() => onSendHead(seat.seatKey)}
              >
                <Send size={16} color={t.accent} />
              </IconBtn>
            ) : null}
            {onDeleteHead ? (
              <IconBtn
                label={`Delete waiting ${seat.short}`}
                onClick={() => onDeleteHead(seat.seatKey)}
              >
                <Trash2 size={16} color={t.textMuted} />
              </IconBtn>
            ) : null}
          </div>
        ))}
      </div>
    </SurfaceBoundary>
  );
}

/** C3: dashed peach user-right rows under Queued · {seat}. */
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
              fontSize: 11,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: t.textMuted,
              textAlign: "right",
            }}
          >
            {queuedBlockLabel(seat.seatKey, seat.label)}
          </p>
          {seat.items.map((item) => (
            <div
              key={item.id}
              data-surface-id="queue-row"
              style={{
                alignSelf: "flex-end",
                width: "88%",
                marginLeft: "auto",
                border: `1px dashed ${t.accent}99`,
                background: t.userBubble,
                borderRadius: "16px 16px 4px 16px",
                padding: "10px 12px",
                color: t.textPrimary,
                fontSize: 15,
                lineHeight: 1.45,
              }}
            >
              <span style={{ display: "block" }}>{item.text}</span>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 2,
                  marginTop: 6,
                }}
              >
                <span style={{ fontSize: 11, color: t.textMuted, marginRight: "auto" }}>
                  · {seat.short}
                </span>
                <IconBtn label="Force send" onClick={() => onSendItem(item.id)}>
                  <Send size={16} color={t.accent} />
                </IconBtn>
                <IconBtn label="Delete queued line" onClick={() => onDeleteItem(item.id)}>
                  <Trash2 size={16} color={t.textMuted} />
                </IconBtn>
              </div>
            </div>
          ))}
        </div>
      ))}
    </SurfaceBoundary>
  );
}
