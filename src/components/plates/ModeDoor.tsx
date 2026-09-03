"use client";

import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import { TYPE } from "@/theme/scale";
import { useCharacter } from "@/theme/character";
import { carbon, mission } from "@/theme/tokens";
import { plateShell, quietLink } from "./shell";

export function ModeDoor() {
  const { character, t, matchSystem, setCharacter, setMatchSystem, confirmPick } =
    useCharacter();

  return (
    <SurfaceBoundary id="mode-door" label="Mode door" order={0}>
      <div style={{ ...plateShell(t), padding: 24, overflowY: "auto" }}>
        <h1
          style={{
            fontFamily: "var(--travis-logo)",
            fontSize: TYPE.display,
            fontWeight: 800,
            letterSpacing: "0.14em",
            margin: "24px 0 8px",
            textAlign: "center",
          }}
        >
          TRAVIS
        </h1>
        <p
          style={{
            textAlign: "center",
            color: t.textSecondary,
            margin: "0 0 24px",
            fontSize: TYPE.body,
          }}
        >
          Pick a character, not a brightness.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {(
            [
              { id: "mission" as const, label: "Mission", tokens: mission },
              { id: "carbon" as const, label: "Carbon", tokens: carbon },
            ] as const
          ).map((opt) => {
            const on = character === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setCharacter(opt.id)}
                style={{
                  flex: 1,
                  maxWidth: 180,
                  padding: 0,
                  border: `2px solid ${on ? t.accent : t.border}`,
                  borderRadius: 12,
                  background: opt.tokens.bgPrimary,
                  cursor: "pointer",
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "16px 12px 20px" }}>
                  <div
                    style={{
                      fontFamily: "var(--travis-logo)",
                      fontSize: 11,
                      letterSpacing: "0.12em",
                      color: opt.tokens.textPrimary,
                      marginBottom: 16,
                    }}
                  >
                    TRAVIS
                  </div>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 4,
                      background: opt.tokens.assistantBubble,
                      marginBottom: 8,
                      width: "70%",
                    }}
                  />
                  <div
                    style={{
                      height: 8,
                      borderRadius: 4,
                      background: opt.tokens.userBubble,
                      marginLeft: "auto",
                      width: "55%",
                    }}
                  />
                  <div
                    style={{
                      marginTop: 16,
                      height: 22,
                      borderRadius: 11,
                      background: opt.tokens.accent,
                    }}
                  />
                </div>
                <div
                  style={{
                    padding: "8px 0 12px",
                    color: t.textPrimary,
                    fontSize: TYPE.meta,
                    fontWeight: 600,
                    background: t.bgPrimary,
                  }}
                >
                  {opt.label}
                </div>
              </button>
            );
          })}
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 32,
            color: t.textSecondary,
            fontSize: TYPE.body,
          }}
        >
          Match system
          <input
            type="checkbox"
            checked={matchSystem}
            onChange={(e) => setMatchSystem(e.target.checked)}
          />
        </label>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <button type="button" onClick={confirmPick} style={quietLink(t)}>
            Continue
          </button>
        </div>
      </div>
    </SurfaceBoundary>
  );
}
