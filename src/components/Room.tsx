"use client";

import {
  absorbFinalTranscript,
  absorbText,
  carryDraftAcrossRestart,
  collapseSpeechStutter,
  mergeLiveTranscript,
} from "@/lib/absorb-text";
import { matchConductorPhrase } from "@/lib/conductor";
import { parseDeadManResponse, seatKeyToShort } from "@/lib/router";
import type { QueueSeatDto } from "@/lib/queue-logic";
import { QueueChips, QueueLog, SeatMark } from "@/components/QueueChrome";
import { LogComposer, type RoomSeat } from "@/components/LogComposer";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import type { Tokens } from "@/theme/tokens";
import type { SeatKey } from "@/server/db/schema";
import { Button, Tag } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";

type Turn = {
  id: string;
  seq: number;
  role: string;
  kind: string;
  seatKey?: string | null;
  referenceTurnId?: string | null;
  speakable?: boolean;
  thoughtStatus?: string | null;
  text: string;
  createdAt?: string;
};

type Session = {
  id: string;
  status: string;
  viewMode: "voice" | "log";
  logSubmode?: "talk" | "type";
  routerState: string;
  activeSeatKey: string;
  activeLabel: string;
  defaultLabel: string;
  seats?: RoomSeat[];
};

type LogSubmode = "talk" | "type";

type Presence = "listening" | "paused" | "speaking" | "ended";
type ViewMode = "voice" | "log";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [i: number]: {
      isFinal: boolean;
      [j: number]: { transcript: string };
    };
  };
};

const DEAD_MAN_MS = 180_000;

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function formatTime(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function facilitatorSpeak(text: string): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function speechEngineBusy(): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  return window.speechSynthesis.speaking || window.speechSynthesis.pending;
}

function waitForSpeechIdle(timeoutMs = 8000): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return Promise.resolve();
  }
  const started = Date.now();
  return new Promise((resolve) => {
    const tick = () => {
      if (!speechEngineBusy() || Date.now() - started > timeoutMs) {
        resolve();
        return;
      }
      window.setTimeout(tick, 80);
    };
    tick();
  });
}

function presenceBlocksListen(presence: Presence): boolean {
  return presence === "ended" || presence === "paused";
}

function QuietTextButton({
  t,
  label,
  onClick,
  loud,
  disabled,
}: {
  t: Tokens;
  label: string;
  onClick: () => void;
  loud?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        border: "none",
        background: "transparent",
        color: disabled ? t.textMuted : loud ? t.accent : t.textMuted,
        fontSize: 13,
        padding: 0,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {label}
    </button>
  );
}

export function Room({ t }: { t: Tokens }) {
  const [session, setSession] = useState<Session | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("voice");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [presence, setPresence] = useState<Presence>("ended");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const [streamingPost, setStreamingPost] = useState("");
  const [streamingSeat, setStreamingSeat] = useState<string | null>(null);
  const [subtitle, setSubtitle] = useState("");
  const [expandedThoughtId, setExpandedThoughtId] = useState<string | null>(null);
  const [liveThoughts, setLiveThoughts] = useState<Record<string, string>>({});
  const [queueSeats, setQueueSeats] = useState<QueueSeatDto[]>([]);
  const [logSubmode, setLogSubmode] = useState<LogSubmode>("talk");
  const [roomSeats, setRoomSeats] = useState<RoomSeat[]>([]);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const committedRef = useRef("");
  const heldDraftRef = useRef("");
  const interimRef = useRef("");
  const listeningWantedRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const phrasesRef = useRef<string[]>([]);
  const finalizingRef = useRef(false);
  const logEndRef = useRef<HTMLDivElement | null>(null);
  const deadManTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSpeechRef = useRef<number>(Date.now());
  const viewModeRef = useRef<ViewMode>("voice");
  const logSubmodeRef = useRef<LogSubmode>("talk");
  const busyRef = useRef(false);
  const presenceRef = useRef<Presence>("ended");
  const sessionRef = useRef<Session | null>(null);
  const startRecognitionRef = useRef<() => void>(() => {});
  const recognitionLiveRef = useRef(false);
  const listenRestartGenRef = useRef(0);
  const inflightRef = useRef(0);

  viewModeRef.current = viewMode;
  logSubmodeRef.current = logSubmode;
  busyRef.current = busy;
  presenceRef.current = presence;
  sessionRef.current = session;

  const applyQueue = useCallback((queue: { seats?: QueueSeatDto[] } | undefined) => {
    if (queue?.seats) setQueueSeats(queue.seats);
  }, []);

  const refreshQueue = useCallback(async (sessionId: string) => {
    const res = await fetch(`/api/session/${sessionId}/queue`);
    const data = await res.json();
    applyQueue(data.queue);
  }, [applyQueue]);

  const refreshTurns = useCallback(async (sessionId: string) => {
    const res = await fetch(`/api/session/${sessionId}/turns`);
    const data = await res.json();
    setTurns(data.turns ?? []);
    setLiveThoughts({});
  }, []);

  const refreshSession = useCallback(async (sessionId: string) => {
    const res = await fetch(`/api/session?id=${sessionId}`);
    const data = await res.json();
    if (data.session) {
      setSession(data.session);
      setViewMode(data.session.viewMode ?? "voice");
      const sub =
        data.session.logSubmode === "type" ? "type" : "talk";
      setLogSubmode(sub);
      logSubmodeRef.current = sub;
      if (Array.isArray(data.session.seats)) setRoomSeats(data.session.seats);
    }
  }, []);

  useEffect(() => {
    fetch("/api/conductor-phrases")
      .then((r) => r.json())
      .then((d) => {
        const list = (d.phrases as string[]) ?? [];
        phrasesRef.current = list;
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const sid = session?.id;
    if (!sid) return;
    void refreshQueue(sid);
    const timer = window.setInterval(() => {
      void refreshQueue(sid);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [session?.id, refreshQueue]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, draft, streamingPost, liveStatus]);

  const resetDeadManTimer = useCallback(() => {
    lastSpeechRef.current = Date.now();
    if (deadManTimerRef.current) clearTimeout(deadManTimerRef.current);
    if (!sessionIdRef.current || !listeningWantedRef.current) return;
    if (viewModeRef.current !== "voice") return;
    if (presenceRef.current !== "listening") return;
    deadManTimerRef.current = setTimeout(async () => {
      const sid = sessionIdRef.current;
      if (!sid || !listeningWantedRef.current) return;
      if (viewModeRef.current !== "voice") return;
      if (presenceRef.current !== "listening") return;
      if (finalizingRef.current || busyRef.current) return;
      if (Date.now() - lastSpeechRef.current < DEAD_MAN_MS - 1000) return;
      const res = await fetch(`/api/session/${sid}/dead-man`, { method: "POST" });
      if (res.ok) {
        await refreshTurns(sid);
        await refreshSession(sid);
        if (viewModeRef.current === "voice") {
          setSubtitle("Are you talking with me?");
          await facilitatorSpeak("Are you talking with me?");
          startRecognitionRef.current();
        }
      }
    }, DEAD_MAN_MS);
  }, [refreshSession, refreshTurns]);

  const persistHeldDraft = useCallback(() => {
    const merged = mergeLiveTranscript(
      carryDraftAcrossRestart(heldDraftRef.current, committedRef.current),
      interimRef.current,
    );
    if (!merged.trim()) return;
    heldDraftRef.current = merged;
    committedRef.current = merged;
    interimRef.current = "";
    setDraft(merged);
  }, []);

  const clearDraft = useCallback(() => {
    heldDraftRef.current = "";
    committedRef.current = "";
    interimRef.current = "";
    setDraft("");
  }, []);

  const haltRecognition = useCallback(
    (opts?: { persist?: boolean }) => {
      if (opts?.persist !== false) persistHeldDraft();
      recognitionLiveRef.current = false;
      const rec = recognitionRef.current;
      if (!rec) return;
      rec.onend = null;
      rec.onresult = null;
      rec.onerror = null;
      try {
        rec.abort();
      } catch {
        try {
          rec.stop();
        } catch {
          /* ignore */
        }
      }
      recognitionRef.current = null;
    },
    [persistHeldDraft],
  );

  const clearAccumulated = useCallback(() => {
    haltRecognition({ persist: false });
    clearDraft();
    if (presenceRef.current === "paused" || presenceRef.current === "ended") {
      return;
    }
    if (viewModeRef.current === "log" && logSubmodeRef.current === "type") {
      return;
    }
    if (listeningWantedRef.current) startRecognitionRef.current();
  }, [clearDraft, haltRecognition]);

  const listenSoon = useCallback(() => {
    window.setTimeout(() => {
      if (!listeningWantedRef.current) return;
      if (presenceBlocksListen(presenceRef.current)) return;
      if (presenceRef.current === "speaking" || speechEngineBusy()) return;
      startRecognitionRef.current();
    }, 300);
  }, []);

  const stopRecognition = useCallback(() => {
    listeningWantedRef.current = false;
    listenRestartGenRef.current += 1;
    if (deadManTimerRef.current) clearTimeout(deadManTimerRef.current);
    haltRecognition();
  }, [haltRecognition]);

  const scheduleListenRestart = useCallback(() => {
    const gen = ++listenRestartGenRef.current;
    void (async () => {
      await waitForSpeechIdle();
      await delay(350);
      if (gen !== listenRestartGenRef.current) return;
      if (!listeningWantedRef.current) return;
      if (presenceBlocksListen(presenceRef.current)) return;
      if (speechEngineBusy()) return;
      startRecognitionRef.current();
      for (let i = 0; i < 3; i++) {
        await delay(400 * (i + 1));
        if (gen !== listenRestartGenRef.current) return;
        if (!listeningWantedRef.current) return;
        if (recognitionLiveRef.current) return;
        if (presenceBlocksListen(presenceRef.current)) return;
        if (speechEngineBusy()) return;
        startRecognitionRef.current();
      }
    })();
  }, []);

  const beginInflight = useCallback(() => {
    inflightRef.current += 1;
    busyRef.current = true;
    setBusy(true);
  }, []);

  const endInflight = useCallback(() => {
    inflightRef.current = Math.max(0, inflightRef.current - 1);
    if (inflightRef.current === 0) {
      busyRef.current = false;
      setBusy(false);
      if (
        listeningWantedRef.current &&
        !presenceBlocksListen(presenceRef.current)
      ) {
        if (presenceRef.current === "speaking") {
          setPresence("listening");
          setSubtitle("Listening…");
        }
        scheduleListenRestart();
      }
      resetDeadManTimer();
    }
  }, [resetDeadManTimer, scheduleListenRestart]);

  const consumeAgentStream = useCallback(
    async (sid: string, res: Response, tempUserId?: string) => {
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";
      let postAcc = "";
      let seatLabel = "PM";

      const handleEvent = async (event: string, raw: string) => {
        const data = JSON.parse(raw) as Record<string, unknown>;

        if (event === "queued" || event === "queue") {
          if (tempUserId) {
            setTurns((prev) => prev.filter((x) => x.id !== tempUserId));
          }
          applyQueue(data.queue as { seats?: QueueSeatDto[] } | undefined);
          return;
        }

        if (event === "retract") {
          const id = String(data.id ?? "");
          if (id) {
            setTurns((prev) => prev.filter((x) => x.id !== id && x.id !== tempUserId));
          }
          return;
        }

        if (event === "matched") {
          const userTurn = data.userTurn as Turn | undefined;
          if (userTurn) {
            setTurns((prev) => {
              const withoutTemp = tempUserId
                ? prev.filter((x) => x.id !== tempUserId)
                : prev;
              return withoutTemp.some((x) => x.id === userTurn.id)
                ? withoutTemp
                : [...withoutTemp, userTurn];
            });
          }
          if (data.activeLabel) {
            seatLabel = String(data.activeLabel);
            setSession((s) =>
              s
                ? {
                    ...s,
                    activeLabel: String(data.activeLabel),
                    activeSeatKey: String(data.activeSeatKey ?? s.activeSeatKey),
                  }
                : s,
            );
          }
          setLiveStatus("running");
        } else if (event === "thought") {
          const turn = data.turn as Turn;
          setTurns((prev) =>
            prev.some((x) => x.id === turn.id) ? prev : [...prev, turn],
          );
          setLiveThoughts((prev) => ({ ...prev, [turn.id]: turn.text }));
        } else if (event === "thought_delta") {
          const id = String(data.id);
          const text = String(data.text);
          setLiveThoughts((prev) => ({ ...prev, [id]: text }));
        } else if (event === "post_delta") {
          const chunk = String(data.text ?? "");
          if (data.seatLabel) seatLabel = String(data.seatLabel);
          if (data.seatKey) setStreamingSeat(String(data.seatKey));
          if (chunk) {
            postAcc = absorbText(postAcc, chunk).acc;
            setStreamingPost(postAcc);
          }
        } else if (event === "status") {
          setLiveStatus(String(data.text ?? "running"));
        } else if (event === "done") {
          setLiveStatus(null);
          setStreamingPost("");
          setStreamingSeat(null);
          await refreshTurns(sid);
          await refreshQueue(sid);
          const postTurn = data.postTurn as Turn | undefined;
          const postText = postTurn?.text ?? postAcc;
          const label = String(data.seatLabel ?? seatLabel);

          if (postText && viewModeRef.current === "voice") {
            const line = `${label} says… ${postText.slice(0, 120)}${postText.length > 120 ? "…" : ""}`;
            setSubtitle(line);
            setPresence("speaking");
            haltRecognition();
            await fetch(`/api/session/${sid}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "speaking" }),
            });
            await facilitatorSpeak(`${label} says. ${postText}`);
            if (listeningWantedRef.current) {
              setPresence("listening");
              setSubtitle("Listening…");
              await fetch(`/api/session/${sid}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "listening" }),
              });
            }
          }
        } else if (event === "error") {
          const msg = String(data.error ?? "Stream error");
          if (!/agent_busy/i.test(msg)) setError(msg);
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          if (!part.trim()) continue;
          let eventName = "message";
          const dataLines: string[] = [];
          for (const line of part.split("\n")) {
            if (line.startsWith("event:")) eventName = line.slice(6).trim();
            else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
          }
          if (dataLines.length) await handleEvent(eventName, dataLines.join("\n"));
        }
      }
    },
    [applyQueue, haltRecognition, refreshQueue, refreshTurns],
  );

  const finalizeUtterance = useCallback(
    async (utterance: string) => {
      const sid = sessionIdRef.current;
      if (!sid || !utterance.trim()) return;

      beginInflight();
      finalizingRef.current = true;
      setError(null);
      haltRecognition();
      listenSoon();

      try {
        const res = await fetch(`/api/session/${sid}/finalize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ utterance }),
        });

        const ct = res.headers.get("content-type") ?? "";
        if (!ct.includes("text/event-stream")) {
          const data = await res.json();
          if (data.queued) {
            applyQueue(data.queue as { seats?: QueueSeatDto[] } | undefined);
            clearDraft();
            if (data.activeLabel) {
              setSession((s) =>
                s
                  ? {
                      ...s,
                      activeLabel: String(data.activeLabel),
                      activeSeatKey: String(
                        data.activeSeatKey ?? s.activeSeatKey,
                      ),
                    }
                  : s,
              );
            }
            return;
          }
          if (data.routerHandled) {
            await refreshSession(sid);
            setSubtitle("");
            clearDraft();
          }
          if (!res.ok && data.error) setError(data.error);
          return;
        }

        clearDraft();
        await consumeAgentStream(sid, res);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        finalizingRef.current = false;
        endInflight();
      }
    },
    [
      applyQueue,
      beginInflight,
      clearDraft,
      consumeAgentStream,
      endInflight,
      haltRecognition,
      listenSoon,
      refreshSession,
    ],
  );

  const postQueueJson = useCallback(
    async (url: string, body: unknown) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      beginInflight();
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const ct = res.headers.get("content-type") ?? "";
        if (!ct.includes("text/event-stream")) {
          const data = await res.json();
          applyQueue(data.queue as { seats?: QueueSeatDto[] } | undefined);
          if (!res.ok && data.error) setError(String(data.error));
          return;
        }
        await consumeAgentStream(sid, res);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        endInflight();
      }
    },
    [applyQueue, beginInflight, consumeAgentStream, endInflight],
  );

  const sendTyped = useCallback(
    async (args: { text: string; chipSeatKey: SeatKey | null }) => {
      const sid = sessionIdRef.current;
      if (!sid) return false;
      const prompt = args.text.trim();
      const tempId = prompt ? `tmp-${crypto.randomUUID()}` : "";
      if (prompt) {
        const seatKey = args.chipSeatKey ?? sessionRef.current?.activeSeatKey ?? "pm";
        setTurns((prev) => [
          ...prev,
          {
            id: tempId,
            seq: (prev[prev.length - 1]?.seq ?? 0) + 1,
            role: "user",
            kind: "user",
            seatKey,
            text: prompt,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
      setError(null);
      try {
        const res = await fetch(`/api/session/${sid}/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(args),
        });
        const ct = res.headers.get("content-type") ?? "";
        if (!ct.includes("text/event-stream")) {
          if (tempId) {
            setTurns((prev) => prev.filter((x) => x.id !== tempId));
          }
          const data = await res.json();
          if (data.routerHandled) await refreshSession(sid);
          applyQueue(data.queue as { seats?: QueueSeatDto[] } | undefined);
          if (!res.ok && data.error) {
            setError(String(data.error));
            return false;
          }
          return true;
        }
        void consumeAgentStream(sid, res, tempId || undefined).catch((e) => {
          setError(e instanceof Error ? e.message : String(e));
          if (tempId) {
            setTurns((prev) => prev.filter((x) => x.id !== tempId));
          }
        });
        return true;
      } catch (e) {
        if (tempId) {
          setTurns((prev) => prev.filter((x) => x.id !== tempId));
        }
        setError(e instanceof Error ? e.message : String(e));
        return false;
      }
    },
    [applyQueue, consumeAgentStream, refreshSession],
  );

  const startRecognition = useCallback(() => {
    if (viewModeRef.current === "log" && logSubmodeRef.current === "type") {
      return;
    }
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;
    haltRecognition();
    listeningWantedRef.current = true;

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (ev) => {
      lastSpeechRef.current = Date.now();
      resetDeadManTimer();
      let sessionCommitted = "";
      let interim = "";
      for (let i = 0; i < ev.results.length; i++) {
        const piece = ev.results[i][0]?.transcript ?? "";
        if (ev.results[i].isFinal) {
          sessionCommitted = absorbFinalTranscript(sessionCommitted, piece);
        } else {
          interim += piece;
        }
      }
      const committed = carryDraftAcrossRestart(
        heldDraftRef.current,
        sessionCommitted,
      );
      committedRef.current = committed;
      interimRef.current = interim;
      const full = mergeLiveTranscript(committed, interim);
      setDraft(full);

      const match = matchConductorPhrase(full, phrasesRef.current);
      const deadMan = parseDeadManResponse(full);
      const awaitingDeadMan =
        sessionRef.current?.routerState === "awaiting_dead_man";
      if (
        awaitingDeadMan &&
        deadMan.action !== "ignore" &&
        !finalizingRef.current
      ) {
        void finalizeUtterance(full);
        return;
      }
      if (match.matched) {
        const committedMatch = matchConductorPhrase(
          committedRef.current,
          phrasesRef.current,
        );
        if (committedMatch.matched || !interim) {
          const raw = committedMatch.matched ? committedRef.current : full;
          void finalizeUtterance(collapseSpeechStutter(raw));
        }
      }
    };

    rec.onerror = (ev) => {
      if (ev.error === "no-speech" || ev.error === "aborted") return;
      setError(`STT: ${ev.error}`);
    };

    rec.onend = () => {
      persistHeldDraft();
      recognitionLiveRef.current = false;
      if (!listeningWantedRef.current) return;
      if (presenceRef.current === "paused" || presenceRef.current === "ended") {
        return;
      }
      if (presenceRef.current === "speaking") return;
      if (speechEngineBusy()) return;
      window.setTimeout(() => {
        if (!listeningWantedRef.current) return;
        if (recognitionLiveRef.current) return;
        if (presenceRef.current === "paused" || presenceRef.current === "ended") {
          return;
        }
        if (presenceRef.current === "speaking" || speechEngineBusy()) return;
        startRecognitionRef.current();
      }, 250);
    };

    recognitionRef.current = rec;
    try {
      rec.start();
      recognitionLiveRef.current = true;
    } catch {
      recognitionLiveRef.current = false;
    }
    resetDeadManTimer();
  }, [finalizeUtterance, haltRecognition, persistHeldDraft, resetDeadManTimer]);

  startRecognitionRef.current = startRecognition;

  const openSession = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/session", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Open failed");
      const s = data.session as Session;
      setSession(s);
      sessionIdRef.current = s.id;
      setViewMode(s.viewMode ?? "voice");
      setTurns([]);
      setQueueSeats([]);
      setLogSubmode("talk");
      logSubmodeRef.current = "talk";
      setRoomSeats(s.seats ?? []);
      if (!s.seats?.length) {
        const bindRes = await fetch("/api/bindings");
        const bindData = await bindRes.json();
        if (Array.isArray(bindData.seats)) setRoomSeats(bindData.seats);
      }
      clearDraft();
      setSubtitle("Listening…");
      setPresence("listening");
      startRecognition();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const togglePause = async () => {
    if (!session || presence === "ended" || presence === "speaking") return;
    if (presence === "paused") {
      setPresence("listening");
      setSubtitle("Listening…");
      await fetch(`/api/session/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "listening" }),
      });
      startRecognition();
    } else {
      setPresence("paused");
      stopRecognition();
      setSubtitle("Paused");
      await fetch(`/api/session/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paused" }),
      });
    }
  };

  const switchViewMode = async (mode: ViewMode) => {
    if (!session) return;
    setViewMode(mode);
    viewModeRef.current = mode;
    await fetch(`/api/session/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ viewMode: mode }),
    });
    setSession((s) => (s ? { ...s, viewMode: mode } : s));
    if (mode === "log") {
      if (deadManTimerRef.current) clearTimeout(deadManTimerRef.current);
      if (logSubmodeRef.current === "type") {
        stopRecognition();
      } else {
        resetDeadManTimer();
        if (listeningWantedRef.current) startRecognitionRef.current();
      }
    } else {
      resetDeadManTimer();
      listeningWantedRef.current = true;
      startRecognitionRef.current();
    }
  };

  const setLogInput = async (mode: LogSubmode) => {
    if (!session) return;
    setLogSubmode(mode);
    logSubmodeRef.current = mode;
    setSession((s) => (s ? { ...s, logSubmode: mode } : s));
    await fetch(`/api/session/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logSubmode: mode }),
    });
    if (mode === "type") {
      stopRecognition();
    } else {
      listeningWantedRef.current = true;
      setPresence("listening");
      setSubtitle("Listening…");
      startRecognitionRef.current();
    }
  };

  const endSession = async () => {
    if (!session) return;
    stopRecognition();
    window.speechSynthesis?.cancel();
    await fetch(`/api/session/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ended" }),
    });
    setPresence("ended");
    setSession(null);
    sessionIdRef.current = null;
    setSubtitle("");
    setQueueSeats([]);
    clearDraft();
  };

  const activeThoughts = turns.filter(
    (t) =>
      t.kind === "agent_thought" &&
      (t.thoughtStatus === "streaming" || liveThoughts[t.id]),
  );

  const viaShort = seatKeyToShort(session?.activeSeatKey);
  const listenLine =
    presence === "paused"
      ? "Paused — tap to resume"
      : presence === "speaking"
        ? "Travis speaking…"
        : "Listening... tap once to pause";
  const statusHint =
    presence === "listening"
      ? "tap once to pause"
      : presence === "paused"
        ? "tap to resume"
        : "";
  const runningLabel =
    liveStatus && liveStatus !== "stand-in"
      ? `${session?.activeLabel ?? viaShort} is still running.`
      : subtitle && presence !== "speaking"
        ? subtitle
        : "";

  const shellStyle = {
    minHeight: "100dvh",
    height: "100dvh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column" as const,
    background: t.bgPrimary,
    color: t.textPrimary,
    fontFamily: "var(--travis-font)",
    maxWidth: 480,
    margin: "0 auto",
  };

  if (!session) {
    return (
      <div style={{ ...shellStyle, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <h1
          style={{
            fontSize: 44,
            fontWeight: 400,
            fontFamily: "var(--travis-serif), Georgia, serif",
            margin: 0,
            color: t.textPrimary,
          }}
        >
          Travis
        </h1>
        <p style={{ color: t.textSecondary, marginTop: 8, textAlign: "center", maxWidth: 280 }}>
          One room — talk with Travis. Agents post in the log; Travis reads.
        </p>
        <Button
          type="primary"
          disabled={busy}
          onClick={() => void openSession()}
          style={{
            marginTop: 28,
            height: 48,
            padding: "0 28px",
            borderRadius: 999,
            fontSize: 16,
          }}
        >
          Open session
        </Button>
        {error && <p style={{ color: t.dangerQuiet, marginTop: 16 }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <div
        style={{
          flexShrink: 0,
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: t.bgPrimary,
        }}
      >
      <SurfaceBoundary id="session-header" label="Session header" order={1}>
        <header
          style={{
            padding: "16px 20px 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "var(--travis-serif), Georgia, serif",
              fontSize: 28,
              fontWeight: 400,
              letterSpacing: "-0.02em",
            }}
          >
            Travis
          </span>
          <Button type="link" onClick={() => void endSession()} style={{ padding: 0 }}>
            End session
          </Button>
        </header>
        <div
          style={{
            padding: "0 20px 8px",
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            fontSize: 12,
            color: t.textSecondary,
          }}
        >
          <Tag
            style={{
              margin: 0,
              padding: "4px 12px",
              background: t.bgElevated,
              borderColor: t.border,
              color: t.textSecondary,
            }}
          >
            <span style={{ color: t.accent, marginRight: 6 }}>●</span>
            Room · via {viaShort}
          </Tag>
          <Tag
            style={{
              margin: 0,
              padding: "4px 12px",
              background: t.accentSoft,
              borderColor: "transparent",
              color: t.accent,
            }}
          >
            {viaShort} · live
          </Tag>
          {viewMode === "log" && (
            <SurfaceBoundary
              id="log-submode-toggle"
              label="Talk or Type"
              order={2}
              style={{ display: "inline-flex", gap: 0 }}
            >
              {(["talk", "type"] as const).map((mode) => {
                const on = logSubmode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={on}
                    onClick={() => void setLogInput(mode)}
                    style={{
                      margin: 0,
                      padding: "4px 12px",
                      borderRadius: mode === "talk" ? "999px 0 0 999px" : "0 999px 999px 0",
                      border: `1px solid ${on ? t.accent : t.border}`,
                      background: on ? t.accent : t.bgElevated,
                      color: on ? t.bgPrimary : t.textSecondary,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    {mode === "talk" ? "Talk" : "Type"}
                  </button>
                );
              })}
            </SurfaceBoundary>
          )}
        </div>
      </SurfaceBoundary>

      {viewMode === "log" && (
          <SurfaceBoundary id="thought-strip" label="Thought circles" order={3}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "10px 20px 4px",
                minHeight: 52,
              }}
            >
              {(["pm", "sa", "engineer"] as const).map((key, i) => {
                const thought = activeThoughts.find((t) => t.seatKey === key);
                const streaming = thought && liveThoughts[thought.id];
                const active = thought?.thoughtStatus === "streaming" || !!streaming;
                const expanded = thought && expandedThoughtId === thought.id;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      thought && setExpandedThoughtId(expanded ? null : thought.id)
                    }
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      marginLeft: i > 0 ? -10 : 0,
                      zIndex: 3 - i,
                      cursor: thought ? "pointer" : "default",
                      opacity: thought || session.activeSeatKey === key ? 1 : 0.45,
                    }}
                    aria-label={`${seatKeyToShort(key)} thought`}
                  >
                    <SeatMark seatKey={key} size={38} glow={!!active} />
                  </button>
                );
              })}
            </div>
            {expandedThoughtId && (
              <div
                style={{
                  margin: "8px 16px",
                  padding: "10px 12px",
                  background: t.bgElevated,
                  borderRadius: 12,
                  fontSize: 13,
                  fontStyle: "italic",
                  color: t.textSecondary,
                  maxHeight: 120,
                  overflowY: "auto",
                }}
              >
                {liveThoughts[expandedThoughtId] ||
                  turns.find((x) => x.id === expandedThoughtId)?.text}
              </div>
            )}
            <div style={{ textAlign: "left", padding: "4px 20px 8px" }}>
              <Button
                type="link"
                onClick={() => void switchViewMode("voice")}
                style={{ padding: 0 }}
              >
                ← Back to voice
              </Button>
            </div>
          </SurfaceBoundary>
      )}
      </div>

      {viewMode === "voice" ? (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <SurfaceBoundary id="voice-presence" label="Voice presence" order={2}>
            <div style={{ flex: 1, minHeight: 24 }} />
            <button
              type="button"
              onClick={() => void togglePause()}
              disabled={presence === "speaking"}
              aria-label={statusHint || listenLine}
              style={{
                margin: "0 auto",
                width: 176,
                height: 176,
                borderRadius: "50%",
                border: "none",
                padding: 0,
                background:
                  presence === "paused"
                    ? t.hoverBg
                    : `radial-gradient(circle at 50% 48%, ${t.accent} 0%, ${t.accent}cc 32%, ${t.accentSoft} 62%, transparent 78%)`,
                boxShadow:
                  presence === "listening" || presence === "speaking"
                    ? `0 0 0 18px ${t.accent}14, 0 0 56px ${t.accent}40, 0 0 120px ${t.accent}22`
                    : "none",
                cursor: presence === "speaking" ? "default" : "pointer",
              }}
            />
            <p
              style={{
                textAlign: "center",
                color: presence === "listening" ? t.accent : t.textPrimary,
                fontSize: 20,
                fontWeight: 400,
                fontFamily: "var(--travis-serif), Georgia, serif",
                margin: "22px 24px 0",
                letterSpacing: "-0.02em",
              }}
            >
              {listenLine}
            </p>
            {runningLabel ? (
              <p
                style={{
                  textAlign: "center",
                  color: t.textMuted,
                  fontSize: 13,
                  margin: "8px 28px 0",
                  lineHeight: 1.4,
                }}
              >
                {runningLabel}
              </p>
            ) : null}
            {draft ? (
              <div
                style={{
                  margin: "16px 28px 0",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: t.textSecondary,
                    fontSize: 15,
                    lineHeight: 1.4,
                    maxHeight: "4.2em",
                    overflow: "hidden",
                  }}
                >
                  {draft}
                </p>
                <div style={{ marginTop: 8 }}>
                  <QuietTextButton
                    t={t}
                    label="Clear"
                    onClick={clearAccumulated}
                  />
                </div>
              </div>
            ) : null}
          </SurfaceBoundary>

          <div style={{ flex: 1 }} />

          {session && (
            <QueueChips
              t={t}
              seats={queueSeats}
              onSendHead={(seatKey) =>
                void postQueueJson(`/api/session/${session.id}/queue/head`, {
                  seatKey,
                  action: "send",
                })
              }
              onDeleteHead={(seatKey) =>
                void postQueueJson(`/api/session/${session.id}/queue/head`, {
                  seatKey,
                  action: "delete",
                })
              }
            />
          )}

          <div style={{ padding: "8px 20px 28px", textAlign: "center" }}>
            <Button
              type="link"
              onClick={() => void switchViewMode("log")}
              style={{
                padding: 0,
                color: t.accent,
                textDecoration: "underline",
                textUnderlineOffset: 4,
                textDecorationStyle: "dashed",
              }}
            >
              View log
            </Button>
          </div>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <SurfaceBoundary
            id="thread"
            label="Thread"
            order={4}
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              padding: "8px 16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {turns
              .filter(
                (turn) =>
                  turn.kind === "user" ||
                  turn.kind === "agent_post" ||
                  turn.kind === "travis_prompt",
              )
              .map((turn) => {
                const isUser = turn.kind === "user";
                const isPrompt = turn.kind === "travis_prompt";
                const seat = turn.seatKey ?? (isPrompt ? "" : "pm");

                const refTurn = turn.referenceTurnId
                  ? turns.find((x) => x.id === turn.referenceTurnId)
                  : null;

                return (
                  <div
                    key={turn.id}
                    style={{
                      alignSelf: isUser ? "flex-end" : "flex-start",
                      maxWidth: "92%",
                      display: "flex",
                      flexDirection: isUser ? "column" : "row",
                      alignItems: isUser ? "flex-end" : "flex-start",
                      gap: 8,
                    }}
                  >
                    {!isUser && (
                      <SeatMark
                        seatKey={isPrompt ? "travis" : seat || "pm"}
                        size={28}
                      />
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: 11,
                          color: t.textMuted,
                          alignSelf: isUser ? "flex-end" : "flex-start",
                          marginLeft: isUser ? 0 : 2,
                        }}
                      >
                        {isUser
                          ? formatTime(turn.createdAt)
                          : `${isPrompt ? "Travis" : seatKeyToShort(seat)} · ${formatTime(turn.createdAt)}`}
                      </span>
                      <div
                        style={{
                          background: isUser
                            ? t.userBubble
                            : isPrompt
                              ? t.hoverBg
                              : t.assistantBubble,
                          border: isUser ? "none" : `1px solid ${t.border}`,
                          boxShadow: "0 2px 10px rgba(44,36,28,0.05)",
                          borderLeft: refTurn ? `3px solid ${t.accent}` : undefined,
                          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                          padding: "10px 14px",
                          fontSize: 15,
                          lineHeight: 1.45,
                          color: t.textPrimary,
                        }}
                      >
                        {refTurn && (
                          <p
                            style={{
                              margin: "0 0 8px",
                              fontSize: 12,
                              fontStyle: "italic",
                              color: t.textMuted,
                              borderLeft: `2px solid ${t.accent}`,
                              paddingLeft: 8,
                            }}
                          >
                            {refTurn.text.slice(0, 120)}
                            {refTurn.text.length > 120 ? "…" : ""}
                          </p>
                        )}
                        {turn.text}
                        {!isUser && turn.kind === "agent_post" && (
                          <button
                            type="button"
                            onClick={() => void facilitatorSpeak(turn.text)}
                            style={{
                              display: "block",
                              marginTop: 8,
                              border: "none",
                              background: "transparent",
                              color: t.accent,
                              fontSize: 12,
                              cursor: "pointer",
                              padding: 0,
                            }}
                          >
                            Play reply
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            {session && (
              <QueueLog
                t={t}
                seats={queueSeats}
                onSendItem={(id) =>
                  void postQueueJson(
                    `/api/session/${session.id}/queue/${id}`,
                    { action: "send" },
                  )
                }
                onDeleteItem={(id) =>
                  void postQueueJson(
                    `/api/session/${session.id}/queue/${id}`,
                    { action: "delete" },
                  )
                }
              />
            )}
            {streamingPost && (
              <div
                style={{
                  alignSelf: "flex-start",
                  maxWidth: "92%",
                  display: "flex",
                  gap: 8,
                }}
              >
                <SeatMark
                  seatKey={streamingSeat ?? session.activeSeatKey}
                  size={28}
                  glow
                />
                <div
                  style={{
                    background: t.assistantBubble,
                    border: `1px solid ${t.border}`,
                    borderRadius: "16px 16px 16px 4px",
                    padding: "10px 14px",
                    fontSize: 15,
                  }}
                >
                  {streamingPost}
                </div>
              </div>
            )}
            {draft && logSubmode !== "type" && (
              <div
                style={{
                  alignSelf: "flex-end",
                  maxWidth: "88%",
                  opacity: 0.7,
                  background: t.userBubble,
                  borderRadius: "16px 16px 4px 16px",
                  padding: "10px 14px",
                  fontSize: 15,
                }}
              >
                {draft}
              </div>
            )}
            <div ref={logEndRef} />
          </SurfaceBoundary>
          {logSubmode === "talk" && (
            <SurfaceBoundary
              id="talk-listen"
              label="Talk listen"
              order={5}
              style={{
                flexShrink: 0,
                padding: "10px 16px 16px",
                background: t.bgPrimary,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                borderTop: `1px solid ${t.border}`,
              }}
            >
              <span style={{ color: t.textMuted, fontSize: 13 }}>
                {presence === "paused"
                  ? "Paused"
                  : presence === "speaking"
                    ? "Travis speaking…"
                    : "Listening"}
              </span>
              <span style={{ display: "flex", gap: 16 }}>
                {draft ? (
                  <QuietTextButton
                    t={t}
                    label="Clear"
                    onClick={clearAccumulated}
                  />
                ) : null}
                <QuietTextButton
                  t={t}
                  label={presence === "paused" ? "Resume" : "Pause"}
                  loud
                  disabled={presence === "speaking"}
                  onClick={() => void togglePause()}
                />
              </span>
            </SurfaceBoundary>
          )}
          {logSubmode === "type" && (
            <LogComposer
              t={t}
              seats={roomSeats}
              onSend={sendTyped}
            />
          )}
        </div>
      )}

      {error && (
        <p style={{ color: t.dangerQuiet, fontSize: 13, padding: "0 16px", margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
}
