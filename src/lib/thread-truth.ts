/**
 * SCP-023 — thread truth. Travis speech is never a user line.
 * If the ear cannot tell his voice from the founder, drop it.
 */

export function normalizeForEcho(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isHisVoiceEcho(heard: string, hisLast: string): boolean {
  const a = normalizeForEcho(heard);
  const b = normalizeForEcho(hisLast);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length >= 8 && b.includes(a)) return true;
  if (b.length >= 8 && a.includes(b)) return true;
  const aw = a.split(" ").filter(Boolean);
  const bw = b.split(" ").filter(Boolean);
  if (aw.length < 3 || bw.length < 3) return false;
  const set = new Set(bw);
  const hit = aw.filter((w) => set.has(w)).length;
  return hit / aw.length >= 0.72 && hit >= 3;
}

/**
 * Live STT that might be him. Drop when it matches his last speech,
 * or when he is speaking and we cannot tell. Do not guess founder.
 */
export function shouldDropHeardAsUser(params: {
  heard: string;
  hisLast: string;
  heIsSpeaking: boolean;
}): boolean {
  const heard = params.heard.trim();
  if (!heard) return true;
  if (isHisVoiceEcho(heard, params.hisLast)) return true;
  if (params.heIsSpeaking && !normalizeForEcho(params.hisLast)) {
    return heard.split(/\s+/).filter(Boolean).length < 5;
  }
  return false;
}
