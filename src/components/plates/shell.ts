import type { CSSProperties } from "react";
import type { Tokens } from "@/theme/tokens";

export function plateShell(t: Tokens): CSSProperties {
  return {
    minHeight: "100dvh",
    height: "100dvh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    background: t.bgPrimary,
    color: t.textPrimary,
    fontFamily: "var(--travis-font)",
    maxWidth: 480,
    margin: "0 auto",
  };
}

export function quietLink(t: Tokens): CSSProperties {
  return {
    background: "none",
    border: "none",
    padding: 0,
    color: t.accent,
    textDecoration: "underline",
    textUnderlineOffset: 4,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 16,
  };
}
