/**
 * Mission + Carbon. Two characters, not two brightnesses.
 *
 * The law the plates are drawn under: across modes nothing moves but `page`,
 * `type` and `accent`. Geometry, spacing, icon shapes and type sizes are the
 * same in both — those live in `scale.ts` and take no mode.
 *
 * Mission — bone page · carbon text · oxblood accent
 * Carbon  — black page · bone text · orange accent
 */

export type Tokens = {
  bgPrimary: string;
  bgElevated: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  accent: string;
  accentSoft: string;
  hoverBg: string;
  userBubble: string;
  assistantBubble: string;
  statusText: string;
  presenceRing: string;
  dangerQuiet: string;
  /** Narration receipts — a tool acting, not Travis talking. */
  receiptText: string;
  /** Quiet wash behind a selected row. No ring, no heavy border. */
  selectedWash: string;
  /** Seat marks for an unbounded cast. Indexed, never assigned by hand. */
  seatTints: readonly string[];
  /** Ink on a seat mark. */
  seatInk: string;
};

export const mission: Tokens = {
  bgPrimary: "#F3EFE7",
  bgElevated: "#FAF7F1",
  textPrimary: "#1C1917",
  textSecondary: "#5C534B",
  textMuted: "#9A8F84",
  border: "#E0D8CB",
  accent: "#7B2233",
  accentSoft: "#EFE0E1",
  hoverBg: "#EAE4D9",
  userBubble: "#E6DED0",
  assistantBubble: "#FAF7F1",
  statusText: "#9A8F84",
  presenceRing: "#7B2233",
  dangerQuiet: "#8C3A3A",
  receiptText: "#8A8076",
  selectedWash: "#EAE2D4",
  seatTints: ["#7B2233", "#4F6B57", "#3F5B79", "#7A5B34", "#5A4A6B", "#2F6B6B"],
  seatInk: "#FAF7F1",
};

export const carbon: Tokens = {
  bgPrimary: "#0B0B0B",
  bgElevated: "#161513",
  textPrimary: "#F3EFE7",
  textSecondary: "#B9B0A5",
  textMuted: "#7E756B",
  border: "#2A2724",
  accent: "#E07A3D",
  accentSoft: "#33231A",
  hoverBg: "#1E1C19",
  userBubble: "#2B2723",
  assistantBubble: "#161513",
  statusText: "#7E756B",
  presenceRing: "#E07A3D",
  dangerQuiet: "#D08A6A",
  receiptText: "#8A8076",
  selectedWash: "#1E1A16",
  seatTints: ["#E07A3D", "#6E9A7A", "#5E86AE", "#C2954F", "#8A76A8", "#4E9A9A"],
  seatInk: "#0B0B0B",
};

/** Mission is the light character, Carbon the dark one. */
export function getTokens(isDark: boolean): Tokens {
  return isDark ? carbon : mission;
}

/** Kept so existing imports keep reading; Mission and Carbon are the names. */
export const light = mission;
export const dark = carbon;
