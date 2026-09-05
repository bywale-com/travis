"use client";

import { useState } from "react";
import {
  motionCardCollapsed,
  type MotionCard as MotionCardData,
} from "@/lib/motion";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import { TYPE } from "@/theme/scale";
import type { Tokens } from "@/theme/tokens";

export function MotionCard({
  card,
  t,
}: {
  card: MotionCardData;
  t: Tokens;
}) {
  const [open, setOpen] = useState(false);
  return (
    <SurfaceBoundary
      id="motion-card"
      label="In motion"
      order={5}
      style={{
        alignSelf: "flex-start",
        maxWidth: "92%",
        marginLeft: 36,
        marginTop: 2,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "block",
          width: "100%",
          textAlign: "left",
          border: "none",
          background: "transparent",
          color: t.textMuted,
          fontSize: TYPE.meta,
          padding: "2px 0",
          cursor: "pointer",
        }}
      >
        {motionCardCollapsed(card)}
      </button>
      {open
        ? card.steps.map((step) => (
            <div
              key={`${card.id}-${step.seq}`}
              style={{
                marginTop: 6,
                color: t.textSecondary,
                fontSize: TYPE.meta,
                lineHeight: 1.45,
              }}
            >
              <div>
                {step.seq}. {step.tool} · {step.status}
              </div>
              {Object.keys(step.args).length ? (
                <div style={{ color: t.textMuted }}>
                  {JSON.stringify(step.args)}
                </div>
              ) : null}
              {step.resultText.trim() ? (
                <div style={{ color: t.receiptText, marginTop: 2 }}>
                  {step.resultText}
                </div>
              ) : null}
            </div>
          ))
        : null}
    </SurfaceBoundary>
  );
}
