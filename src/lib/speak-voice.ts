/**
 * Facilitator readback voice. Browser speechSynthesis (Google on Chrome /
 * Android). We cannot do SSML or Studio/Neural2 here — those are Cloud TTS.
 * We pick the least-flat English voice the engine lists, and lift rate a notch.
 */

export type NamedVoice = {
  name: string;
  lang: string;
  localService?: boolean;
};

const MALE =
  /\b(male|david|daniel|alex|fred|tom|james|george|arthur|mark|rishi)\b|uk english male/i;
const FEMALE =
  /\b(female|samantha|karen|moira|zira|susan|victoria|fiona|tessa|veena)\b/i;
const NATURAL =
  /\b(natural|enhanced|neural|wavenet|studio|premium|network)\b/i;

/** Slightly above 1 — Google’s default contour is slow and flat. */
export const READBACK_RATE = 1.08;

export function englishVoicePool<T extends NamedVoice>(voices: T[]): T[] {
  const en = voices.filter((v) => !v.lang || /^en\b/i.test(v.lang));
  return en.length ? en : voices;
}

export function scoreReadbackVoice(voice: NamedVoice): number {
  const name = voice.name ?? "";
  let score = 0;
  if (MALE.test(name) && !FEMALE.test(name)) score += 100;
  if (NATURAL.test(name)) score += 40;
  if (voice.localService === false) score += 30;
  if (FEMALE.test(name) && !MALE.test(name)) score -= 20;
  if (/^en-US\b/i.test(voice.lang)) score += 5;
  return score;
}

export function pickReadbackVoice<T extends NamedVoice>(voices: T[]): T | null {
  const pool = englishVoicePool(voices);
  if (!pool.length) return null;
  return [...pool].sort((a, b) => scoreReadbackVoice(b) - scoreReadbackVoice(a))[0] ?? null;
}

/** 034 name — same pick, kept so older imports still compile. */
export function pickMaleVoice<T extends NamedVoice>(voices: T[]): T | null {
  const pool = englishVoicePool(voices);
  return pool.find((v) => MALE.test(v.name) && !FEMALE.test(v.name)) ?? null;
}

export function applyReadbackVoice(utterance: SpeechSynthesisUtterance): void {
  utterance.rate = READBACK_RATE;
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const chosen = pickReadbackVoice(
    window.speechSynthesis.getVoices() as NamedVoice[],
  );
  if (chosen && "voice" in utterance) {
    utterance.voice = chosen as SpeechSynthesisVoice;
  }
}

export function applyMaleVoice(utterance: SpeechSynthesisUtterance): void {
  applyReadbackVoice(utterance);
}
