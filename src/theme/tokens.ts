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
};

export const light: Tokens = {
  bgPrimary: "#f6f4f1",
  bgElevated: "#ffffff",
  textPrimary: "#1a1a1a",
  textSecondary: "#4a4a4a",
  textMuted: "#8a8680",
  border: "#e4e0d8",
  accent: "#2f5d50",
  accentSoft: "#d8ebe4",
  hoverBg: "#efece6",
  userBubble: "#e8f0ed",
  assistantBubble: "#ffffff",
  statusText: "#8a8680",
  presenceRing: "#2f5d50",
  dangerQuiet: "#6b4f4f",
};

export const dark: Tokens = {
  bgPrimary: "#121414",
  bgElevated: "#1c1f1e",
  textPrimary: "#f2f0ec",
  textSecondary: "#b8b4ac",
  textMuted: "#7a7670",
  border: "#2a2e2c",
  accent: "#7eb8a4",
  accentSoft: "#1e2e28",
  hoverBg: "#252928",
  userBubble: "#1e2e28",
  assistantBubble: "#1c1f1e",
  statusText: "#7a7670",
  presenceRing: "#7eb8a4",
  dangerQuiet: "#c4a0a0",
};

export function getTokens(isDark: boolean): Tokens {
  return isDark ? dark : light;
}
