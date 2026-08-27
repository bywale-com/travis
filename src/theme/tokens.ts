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
  bgPrimary: "#f3eee7",
  bgElevated: "#faf7f2",
  textPrimary: "#2a221c",
  textSecondary: "#5c534b",
  textMuted: "#9a8f84",
  border: "#e6ddd3",
  accent: "#c45c28",
  accentSoft: "#f4e0d2",
  hoverBg: "#efe8df",
  userBubble: "#f0d9c6",
  assistantBubble: "#f7f3ee",
  statusText: "#9a8f84",
  presenceRing: "#c45c28",
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
