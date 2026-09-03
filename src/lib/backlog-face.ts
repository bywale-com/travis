/** B1 / B6 / B7 words. No store. */

import { relativeTime } from "./relative-time";

export function backlogNextWord(
  next: string | null | undefined,
  status: string,
): string {
  if (status === "done") return "Done";
  if (!next) return "";
  if (next === "engineer") return "Eng";
  if (next === "travis") return "Travis";
  if (next === "pm") return "PM";
  if (next === "sa") return "SA";
  return next;
}

export function backlogWithLine(
  next: string | null | undefined,
  status: string,
): string {
  const word = backlogNextWord(next, status);
  if (!word) return "";
  if (status === "done") return "Done";
  return `With ${word}`;
}

export function backlogStageKeys(lit: string[], next: string | null | undefined): string[] {
  const out: string[] = [];
  for (const key of [...lit, next ?? ""]) {
    if (!key || out.includes(key)) continue;
    out.push(key);
  }
  return out;
}

/** B1 right-rail age — `2m`, `1h`, `yesterday`. */
export function backlogAge(at: Date | string, nowMs = Date.now()): string {
  const raw = relativeTime(at, nowMs);
  if (raw === "just now") return "now";
  if (raw.endsWith(" ago")) return raw.slice(0, -4);
  return raw;
}
