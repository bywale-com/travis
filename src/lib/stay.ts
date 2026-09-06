/**
 * SCP-027 — device stay. Same family as travis-character. Not a table.
 */

export const STAY_KEY = "travis-stay";

export type TravisStay = {
  sessionId: string;
  plate: "index" | "room";
  scrollTurnId?: string | null;
  scrollOffsetPx?: number;
};

export function parseStay(raw: string | null | undefined): TravisStay | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as Partial<TravisStay>;
    if (o.plate !== "index" && o.plate !== "room") return null;
    if (typeof o.sessionId !== "string" || !o.sessionId.trim()) {
      if (o.plate === "room") return null;
      return { sessionId: "", plate: "index" };
    }
    return {
      sessionId: o.sessionId,
      plate: o.plate,
      scrollTurnId:
        typeof o.scrollTurnId === "string" ? o.scrollTurnId : null,
      scrollOffsetPx:
        typeof o.scrollOffsetPx === "number" && Number.isFinite(o.scrollOffsetPx)
          ? o.scrollOffsetPx
          : 0,
    };
  } catch {
    return null;
  }
}

export function readStay(): TravisStay | null {
  if (typeof window === "undefined") return null;
  return parseStay(window.localStorage.getItem(STAY_KEY));
}

export function writeStay(next: TravisStay): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STAY_KEY, JSON.stringify(next));
}

export function stayOnEnter(sessionId: string, prev?: TravisStay | null): TravisStay {
  const stay: TravisStay = {
    sessionId,
    plate: "room",
    scrollTurnId: prev?.sessionId === sessionId ? prev.scrollTurnId : null,
    scrollOffsetPx: prev?.sessionId === sessionId ? prev.scrollOffsetPx : 0,
  };
  writeStay(stay);
  return stay;
}

export function stayOnLeave(sessionId?: string | null): TravisStay {
  const stay: TravisStay = {
    sessionId: sessionId ?? "",
    plate: "index",
  };
  writeStay(stay);
  return stay;
}

export function stayOnScroll(
  sessionId: string,
  scrollTurnId: string | null,
  scrollOffsetPx: number,
): TravisStay {
  const stay: TravisStay = {
    sessionId,
    plate: "room",
    scrollTurnId,
    scrollOffsetPx,
  };
  writeStay(stay);
  return stay;
}

/** Turn id at the top of the thread viewport, plus pixel offset. */
export function scrollStayFromThread(root: HTMLElement): {
  scrollTurnId: string | null;
  scrollOffsetPx: number;
} {
  const nodes = [...root.querySelectorAll<HTMLElement>("[id^='turn-']")];
  const top = root.getBoundingClientRect().top;
  let best: { id: string; offset: number } | null = null;
  for (const node of nodes) {
    const r = node.getBoundingClientRect();
    const offset = r.top - top;
    if (r.bottom <= top) continue;
    if (!best || offset < best.offset) {
      best = { id: node.id.replace(/^turn-/, ""), offset };
    }
    if (r.top >= top) break;
  }
  return {
    scrollTurnId: best?.id ?? null,
    scrollOffsetPx: best?.offset ?? 0,
  };
}

export function applyScrollStay(
  root: HTMLElement,
  turnId: string,
  offsetPx: number,
): boolean {
  const node = root.querySelector<HTMLElement>(`#turn-${CSS.escape(turnId)}`);
  if (!node) return false;
  const rootTop = root.getBoundingClientRect().top;
  const nodeTop = node.getBoundingClientRect().top;
  root.scrollTop += nodeTop - rootTop - offsetPx;
  return true;
}
