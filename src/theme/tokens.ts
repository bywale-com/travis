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
  bgPrimary: "#FDF8F3",
  bgElevated: "#FFFCF8",
  textPrimary: "#2C241C",
  textSecondary: "#6B5E52",
  textMuted: "#A39486",
  border: "#E8D9CC",
  accent: "#E07A3D",
  accentSoft: "#F6E4D4",
  hoverBg: "#F3E8DC",
  userBubble: "#F3D5BB",
  assistantBubble: "#FFFCF8",
  statusText: "#A39486",
  presenceRing: "#E07A3D",
  dangerQuiet: "#8C5A52",
};

export const dark: Tokens = {
  bgPrimary: "#1A1512",
  bgElevated: "#241E19",
  textPrimary: "#F5EDE4",
  textSecondary: "#C4B5A5",
  textMuted: "#8A7B6E",
  border: "#3A3028",
  accent: "#E07A3D",
  accentSoft: "#3A2A20",
  hoverBg: "#2C241C",
  userBubble: "#4A3228",
  assistantBubble: "#241E19",
  statusText: "#8A7B6E",
  presenceRing: "#E07A3D",
  dangerQuiet: "#D4A09A",
};

export function getTokens(isDark: boolean): Tokens {
  return isDark ? dark : light;
}
