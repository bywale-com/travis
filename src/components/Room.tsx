"use client";

import {
  absorbFinalTranscript,
  absorbText,
  collapseSpeechStutter,
  mergeLiveTranscript,
} from "@/lib/absorb-text";
import { matchConductorPhrase } from "@/lib/conductor";
import { parseDeadManResponse, seatKeyToShort } from "@/lib/router";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import type { Tokens } from "@/theme/tokens";
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
  routerState: string;
  activeSeatKey: string;
  activeLabel: string;
  defaultLabel: string;
};

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

const SEAT_COLORS: Record<string, string> = {
  pm: "#6b7a70",
  sa: "#c45c28",
  engineer: "#6a7380",
};

function SeatMark({
  seatKey,
  size = 28,
  glow = false,
}: {
  seatKey: string;
  size?: number;
  glow?: boolean;
}) {
  const isTravis = seatKey === "travis" || !seatKey;
  const color = isTravis ? "#5c534b" : (SEAT_COLORS[seatKey] ?? "#9a8f84");
  const mark = isTravis ? "T" : seatKeyToShort(seatKey);
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        color: "#faf7f2",
  fontSize: size < 32 ? 10 : 11,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: glow ? `0 0 0 3px ${color}44` : "none",
      }}
    >
      {mark}
    </span>
  );
}

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

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const committedRef = useRef("");
  const interimRef = useRef("");
  const listeningWantedRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const phrasesRef = useRef<string[]>([]);
  const finalizingRef = useRef(false);
  const logEndRef = useRef<HTMLDivElement | null>(null);
  const deadManTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSpeechRef = useRef<number>(Date.now());
  const viewModeRef = useRef<ViewMode>("voice");
  const busyRef = useRef(false);
  const presenceRef = useRef<Presence>("ended");
  const sessionRef = useRef<Session | null>(null);
  const startRecognitionRef = useRef<() => void>(() => {});
  const recognitionLiveRef = useRef(false);
  const listenRestartGenRef = useRef(0);

  viewModeRef.current = viewMode;
  busyRef.current = busy;
  presenceRef.current = presence;
  sessionRef.current = session;

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

  const haltRecognition = useCallback(() => {
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

  const finalizeUtterance = useCallback(
    async (utterance: string) => {
      const sid = sessionIdRef.current;
      if (!sid || finalizingRef.current) return;
      finalizingRef.current = true;
      busyRef.current = true;
      setBusy(true);
      setError(null);
      setLiveStatus(null);
      setStreamingPost("");
      setStreamingSeat(null);
      haltRecognition();

      try {
        const res = await fetch(`/api/session/${sid}/finalize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ utterance }),
        });

        const ct = res.headers.get("content-type") ?? "";
        if (!ct.includes("text/event-stream")) {
          const data = await res.json();
          if (data.routerHandled) {
            await refreshSession(sid);
            setSubtitle("");
            committedRef.current = "";
            interimRef.current = "";
            setDraft("");
          }
          if (!res.ok && data.error) setError(data.error);
          return;
        }

        committedRef.current = "";
        interimRef.current = "";
        setDraft("");

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";
        let postAcc = "";
        let seatLabel = "PM";

        const handleEvent = async (event: string, raw: string) => {
          const data = JSON.parse(raw) as Record<string, unknown>;

          if (event === "matched") {
            const userTurn = data.userTurn as Turn | undefined;
            if (userTurn) {
              setTurns((prev) =>
                prev.some((x) => x.id === userTurn.id) ? prev : [...prev, userTurn],
              );
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
            const postTurn = data.postTurn as Turn | undefined;
            const postText = postTurn?.text ?? postAcc;
            const label = String(data.seatLabel ?? seatLabel);

            if (postText && viewModeRef.current === "voice") {
              const line = `${label} says… ${postText.slice(0, 120)}${postText.length > 120 ? "…" : ""}`;
              setSubtitle(line);
              setPresence("speaking");
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
            setError(String(data.error ?? "Stream error"));
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
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        finalizingRef.current = false;
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
    },
    [haltRecognition, refreshSession, refreshTurns, resetDeadManTimer, scheduleListenRestart],
  );

  const startRecognition = useCallback(() => {
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
      let committed = "";
      let interim = "";
      for (let i = 0; i < ev.results.length; i++) {
        const piece = ev.results[i][0]?.transcript ?? "";
        if (ev.results[i].isFinal) {
          committed = absorbFinalTranscript(committed, piece);
        } else {
          interim += piece;
        }
      }
      committed = collapseSpeechStutter(committed);
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
      if (match.matched && !finalizingRef.current) {
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
      recognitionLiveRef.current = false;
      if (!listeningWantedRef.current) return;
      if (presenceRef.current === "paused" || presenceRef.current === "ended") {
        return;
      }
      if (presenceRef.current === "speaking" || finalizingRef.current) return;
      if (speechEngineBusy()) return;
      window.setTimeout(() => {
        if (!listeningWantedRef.current) return;
        if (recognitionLiveRef.current) return;
        if (presenceRef.current === "paused" || presenceRef.current === "ended") {
          return;
        }
        if (presenceRef.current === "speaking" || finalizingRef.current) return;
        if (speechEngineBusy()) return;
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
  }, [finalizeUtterance, haltRecognition, resetDeadManTimer]);

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
    if (!session || presence === "ended") return;
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
    } else {
      resetDeadManTimer();
      if (listeningWantedRef.current) startRecognitionRef.current();
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
  };

  const activeThoughts = turns.filter(
    (t) =>
      t.kind === "agent_thought" &&
      (t.thoughtStatus === "streaming" || liveThoughts[t.id]),
  );

  const viaShort = seatKeyToShort(session?.activeSeatKey);
  const statusLine =
    presence === "listening"
      ? `Listening to ${viaShort}…`
      : presence === "paused"
        ? "Paused — tap to resume"
        : presence === "speaking"
          ? "Travis speaking…"
          : "Session ended";
  const statusHint =
    presence === "listening"
      ? "tap once to pause"
      : presence === "paused"
        ? "tap to resume"
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
        <h1 style={{ fontSize: 40, fontWeight: 600, fontFamily: "Georgia, serif", margin: 0 }}>
          Travis
        </h1>
        <p style={{ color: t.textSecondary, marginTop: 8, textAlign: "center", maxWidth: 280 }}>
          One room — talk with Travis. Agents post in the log; Travis reads.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => void openSession()}
          style={{
            marginTop: 28,
            border: "none",
            background: t.accent,
            color: "#fff",
            padding: "14px 28px",
            borderRadius: 999,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Open session
        </button>
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
              fontFamily: "Georgia, serif",
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            Travis
          </span>
          <button
            type="button"
            onClick={() => void endSession()}
            style={{
              border: "none",
              background: "transparent",
              color: t.accent,
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            End session
          </button>
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
          <span
            style={{
              padding: "5px 12px",
              borderRadius: 999,
              background: t.bgElevated,
              border: `1px solid ${t.border}`,
              color: t.textSecondary,
            }}
          >
            Room · via {viaShort}
          </span>
          <span
            style={{
              padding: "5px 12px",
              borderRadius: 999,
              background: t.accentSoft,
              color: t.accent,
            }}
          >
            {viaShort} · live
          </span>
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
            <div style={{ textAlign: "center", padding: "4px 20px 8px" }}>
              <button
                type="button"
                onClick={() => void switchViewMode("voice")}
                style={{
                  border: "none",
                  background: "transparent",
                  color: t.accent,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                ← Back to voice
              </button>
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
            <p
              style={{
                textAlign: "center",
                color: t.textPrimary,
                fontSize: 22,
                fontWeight: 600,
                margin: "28px 20px 18px",
                letterSpacing: "-0.02em",
              }}
            >
              {statusLine}
            </p>
            <button
              type="button"
              onClick={() => void togglePause()}
              disabled={presence === "speaking" || busy}
              aria-label={statusHint || statusLine}
              style={{
                margin: "0 auto",
                width: 148,
                height: 148,
                borderRadius: "50%",
                border: "none",
                background:
                  presence === "paused"
                    ? t.hoverBg
                    : `radial-gradient(circle at 50% 45%, #f8c9a8 0%, ${t.accentSoft} 55%, #ead3c2 100%)`,
                boxShadow:
                  presence === "listening" || presence === "speaking"
                    ? `0 0 0 12px ${t.accent}14, 0 0 40px ${t.accent}33`
                    : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: presence === "speaking" ? "default" : "pointer",
              }}
            >
              <span
                style={{
                  width: presence === "paused" ? 18 : 22,
                  height: presence === "paused" ? 18 : 22,
                  borderRadius: presence === "paused" ? 4 : "50%",
                  background: t.accent,
                  opacity: 0.85,
                }}
              />
            </button>
            {statusHint && (
              <p style={{ textAlign: "center", color: t.textMuted, fontSize: 13, margin: "14px 20px 0" }}>
                {statusHint}
              </p>
            )}
            <p style={{ textAlign: "center", color: t.textMuted, fontSize: 12, margin: "8px 28px 0", lineHeight: 1.4 }}>
              Start with PM, SA, or Engineer. End with I&apos;m done.
            </p>
            {liveStatus && (
              <p style={{ textAlign: "center", fontSize: 12, color: t.statusText, margin: "8px 0 0" }}>
                {liveStatus}
              </p>
            )}
          </SurfaceBoundary>

          <div style={{ flex: 1 }} />

          {subtitle && (
            <p
              style={{
                textAlign: "center",
                color: t.textSecondary,
                fontSize: 13,
                margin: "0 28px 8px",
                lineHeight: 1.4,
                maxHeight: 48,
                overflow: "hidden",
              }}
            >
              {subtitle}
            </p>
          )}

          <div style={{ padding: "8px 20px 28px", textAlign: "center" }}>
            <button
              type="button"
              onClick={() => void switchViewMode("log")}
              style={{
                border: "none",
                background: "transparent",
                color: t.textMuted,
                fontSize: 14,
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              View log
            </button>
          </div>
        </div>
      ) : (
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
            {draft && (
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
      )}

      {error && (
        <p style={{ color: t.dangerQuiet, fontSize: 13, padding: "0 16px", margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
}
