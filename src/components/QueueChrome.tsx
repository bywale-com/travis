import { Send, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "antd";
import {
  queuedBlockLabel,
  waitingChipLabel,
  type QueueSeatDto,
} from "@/lib/queue-logic";
import { seatKeyToShort } from "@/lib/router";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import type { Tokens } from "@/theme/tokens";

const SEAT_COLORS: Record<string, string> = {
  pm: "#8A9A8E",
  sa: "#E07A3D",
  engineer: "#7E96B5",
};

export function SeatMark({
  seatKey,
  size = 28,
  glow = false,
}: {
  seatKey: string;
  size?: number;
  glow?: boolean;
}) {
  const isTravis = seatKey === "travis" || !seatKey;
  const color = isTravis ? "#6B5E52" : (SEAT_COLORS[seatKey] ?? "#A39486");
  const mark = isTravis ? "T" : seatKeyToShort(seatKey);
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        color: "#FFFCF8",
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
      onClick={onClick}
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
          gap: 8,
          padding: "4px 16px 12px",
        }}
      >
        {seats.map((seat) => (
          <div
            key={seat.seatKey}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px 10px 14px",
              borderRadius: 16,
              background: t.bgElevated,
              border: `1px solid ${t.border}`,
              boxShadow: "0 6px 20px rgba(44,36,28,0.06)",
              color: t.textPrimary,
              fontSize: 14,
            }}
          >
            <SeatMark seatKey={seat.seatKey} size={28} />
            <span style={{ flex: 1, minWidth: 0 }}>
              {waitingChipLabel(seat.items.length, seat.seatKey)}
            </span>
            <IconBtn
              label={`Force send ${seat.short}`}
              onClick={() => onSendHead(seat.seatKey)}
            >
              <Send size={16} color={t.accent} />
            </IconBtn>
            <IconBtn
              label={`Delete waiting ${seat.short}`}
              onClick={() => onDeleteHead(seat.seatKey)}
            >
              <Trash2 size={16} color={t.textMuted} />
            </IconBtn>
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
            {queuedBlockLabel(seat.seatKey)}
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
