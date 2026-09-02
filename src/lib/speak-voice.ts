/** Prefer a male browser voice when the engine names one. Else leave default. */

export type NamedVoice = { name: string; lang: string };

const MALE =
  /\b(male|david|daniel|alex|fred|tom|james|george|arthur|mark|rishi)\b|uk english male/i;
const FEMALE =
  /\b(female|samantha|karen|moira|zira|susan|victoria|fiona|tessa|veena)\b/i;

export function pickMaleVoice<T extends NamedVoice>(voices: T[]): T | null {
  const en = voices.filter((v) => !v.lang || /^en\b/i.test(v.lang));
  const pool = en.length ? en : voices;
  return (
    pool.find((v) => MALE.test(v.name) && !FEMALE.test(v.name)) ?? null
  );
}

export function applyMaleVoice(utterance: SpeechSynthesisUtterance): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const chosen = pickMaleVoice(window.speechSynthesis.getVoices());
  if (chosen) utterance.voice = chosen;
}
