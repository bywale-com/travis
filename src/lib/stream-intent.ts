/**
 * SCP-035 — classify a phrase: new / change / cancel / talk.
 * Pivots are not dest-gate. No I/O. No embeddings. No speak.
 */

import { parseCallByName, seatMentions } from "@/lib/router";
import type { SeatKey } from "@/server/db/schema";

export type StreamTarget =
  | { kind: "dest"; destJobId: string; bindingId: string }
  | { kind: "travis-thread" }
  | { kind: "seat"; seatKey: "pm" | "sa" | "engineer" };

export type StreamIntent = {
  kind: "new" | "change" | "cancel" | "talk";
  target?: StreamTarget;
};

export type StreamOpenJob = {
  job: { id: string; payload?: { text?: string } | null };
  binding: { id: string; label?: string | null; seatKey?: string | null };
};

const CHANGE_WORD = /\b(actually|wait|instead)\b/i;
const SCRAP_THAT = /\bscrap that\b/i;
const NO_THE = /\bno\s*[—\-]\s*the\b|\bno-the\b|\bno\s+the\b/i;
const CANCEL_PHRASE = /\b(scrap that|cancel that|never mind that)\b/i;
const WALK_BACK =
  /\bwhat did we do\b|\bwhere are we\b|\blast time we\b|\bwhat were we\b/i;
const YESTERDAY = /\byesterday\b/i;

const STOP = new Set([
  "a",
  "an",
  "the",
  "to",
  "that",
  "this",
  "and",
  "or",
  "of",
  "in",
  "on",
  "for",
  "with",
  "as",
  "well",
  "by",
  "way",
  "send",
  "put",
  "please",
  "also",
  "me",
  "my",
  "you",
  "we",
  "i",
  "it",
  "is",
  "was",
  "were",
  "did",
  "do",
  "what",
  "where",
  "last",
  "time",
  "yesterday",
  "actually",
  "wait",
  "instead",
  "scrap",
  "cancel",
  "never",
  "mind",
  "no",
  "use",
]);

function payloadText(job: StreamOpenJob): string {
  const raw = job.job.payload;
  if (raw && typeof raw === "object" && "text" in raw) {
    return String(raw.text ?? "");
  }
  return "";
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[—–]/g, " ")
    .split(/[^a-z0-9]+/)
    .filter((w) => w && !STOP.has(w));
}

function changeMode(phrase: string): boolean {
  return CHANGE_WORD.test(phrase) || SCRAP_THAT.test(phrase) || NO_THE.test(phrase);
}

function cancelMode(phrase: string): boolean {
  return CANCEL_PHRASE.test(phrase);
}

/** Cancel phrase is the whole ask (plus a target match). Longer scrap-that is change. */
function wholeCancelAsk(phrase: string): boolean {
  const rest = phrase
    .replace(CANCEL_PHRASE, " ")
    .replace(/[.?!,;:—-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!rest) return true;
  return !/\b(use|instead|actually|make|change|send|put)\b/i.test(rest);
}

function walkBack(phrase: string): boolean {
  if (WALK_BACK.test(phrase)) return true;
  if (!YESTERDAY.test(phrase)) return false;
  return !/\byesterday's\b/i.test(phrase);
}

function cursorSeats(phrase: string): Array<"pm" | "sa" | "engineer"> {
  const named = seatMentions(phrase);
  const once = parseCallByName(phrase).seatKey;
  const out: Array<"pm" | "sa" | "engineer"> = [...named];
  if (once === "pm" || once === "sa" || once === "engineer") {
    if (!out.includes(once)) out.push(once);
  }
  return out;
}

function destTarget(job: StreamOpenJob): StreamTarget {
  return { kind: "dest", destJobId: job.job.id, bindingId: job.binding.id };
}

function scoreJob(phrase: string, job: StreamOpenJob): number {
  const hay = tokenize(
    `${payloadText(job)} ${job.binding.label ?? ""} ${job.binding.seatKey ?? ""}`,
  );
  const needles = tokenize(phrase);
  if (!needles.length || !hay.length) return 0;
  const bag = new Set(hay);
  return needles.filter((w) => bag.has(w)).length;
}

function matchOpenDest(
  phrase: string,
  openJobs: StreamOpenJob[],
  mode: "change" | "cancel",
): StreamOpenJob | "talk" | null {
  if (!openJobs.length) return null;
  if (openJobs.length === 1) return openJobs[0];
  const scored = openJobs.map((job) => ({ job, n: scoreJob(phrase, job) }));
  scored.sort((a, b) => b.n - a.n);
  const top = scored[0];
  const tie = scored.filter((s) => s.n === top.n && s.n >= 1);
  if (top.n >= 1 && tie.length === 1) return top.job;
  if (mode === "change" || mode === "cancel") return "talk";
  return null;
}

function seatJob(
  openJobs: StreamOpenJob[],
  seatKey: SeatKey,
): StreamOpenJob | undefined {
  return openJobs.find((j) => j.binding.seatKey === seatKey);
}

export function streamIntent(params: {
  phrase: string;
  openJobs: StreamOpenJob[];
}): StreamIntent[] {
  const phrase = params.phrase.trim();
  if (!phrase) return [{ kind: "talk" }];

  const jobs = params.openJobs;
  const seats = cursorSeats(phrase);
  const changing = changeMode(phrase);
  const cancelling = cancelMode(phrase);

  if (cancelling && wholeCancelAsk(phrase)) {
    const hit = matchOpenDest(phrase, jobs, "cancel");
    if (hit === "talk") return [{ kind: "talk" }];
    if (hit) return [{ kind: "cancel", target: destTarget(hit) }];
    if (seats.length === 1) {
      const job = seatJob(jobs, seats[0]);
      if (job) return [{ kind: "cancel", target: destTarget(job) }];
    }
    return [{ kind: "talk" }];
  }

  if (changing) {
    if (seats.length === 1) {
      const job = seatJob(jobs, seats[0]);
      if (job) return [{ kind: "change", target: destTarget(job) }];
    }
    const hit = matchOpenDest(phrase, jobs, "change");
    if (hit === "talk") return [{ kind: "talk" }];
    if (hit) return [{ kind: "change", target: destTarget(hit) }];
    if (!seats.length) {
      return [{ kind: "change", target: { kind: "travis-thread" } }];
    }
    return [{ kind: "talk" }];
  }

  const intents: StreamIntent[] = [];
  if (walkBack(phrase) && !seats.length) {
    intents.push({ kind: "new", target: { kind: "travis-thread" } });
  } else if (walkBack(phrase)) {
    intents.push({ kind: "new", target: { kind: "travis-thread" } });
  }
  for (const seatKey of seats) {
    intents.push({ kind: "new", target: { kind: "seat", seatKey } });
  }
  if (!intents.length) return [{ kind: "talk" }];
  return intents;
}
