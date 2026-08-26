"use client";

import { matchConductorPhrase } from "@/lib/conductor";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import type { Tokens } from "@/theme/tokens";
import { useCallback, useEffect, useRef, useState } from "react";

type Turn = {
  id: string;
  seq: number;
  role: string;
  text: string;
};

type Session = {
  id: string;
  status: string;
  bindingLabel: string;
};

type Presence = "listening" | "paused" | "speaking" | "ended";

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

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function VoiceSession({ t }: { t: Tokens }) {
  const [session, setSession] = useState<Session | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [presence, setPresence] = useState<Presence>("ended");
  const [draft, setDraft] = useState("");
  const [phrases, setPhrases] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sttSupported, setSttSupported] = useState(true);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const [streamingAssistant, setStreamingAssistant] = useState("");

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const committedRef = useRef("");
  const interimRef = useRef("");
  const listeningWantedRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const phrasesRef = useRef<string[]>([]);
  const finalizingRef = useRef(false);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  const refreshTurns = useCallback(async (sessionId: string) => {
    const res = await fetch(`/api/session/${sessionId}/turns`);
    const data = await res.json();
    setTurns(data.turns ?? []);
  }, []);

  useEffect(() => {
    fetch("/api/conductor-phrases")
      .then((r) => r.json())
      .then((d) => {
        const list = (d.phrases as string[]) ?? [];
        setPhrases(list);
        phrasesRef.current = list;
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, draft, streamingAssistant, liveStatus]);

  const stopRecognition = useCallback(() => {
    listeningWantedRef.current = false;
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.onend = null;
        rec.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    }
  }, []);

  const finalizeUtterance = useCallback(
    async (utterance: string) => {
      const sid = sessionIdRef.current;
      if (!sid || finalizingRef.current) return;
      finalizingRef.current = true;
      setBusy(true);
      setError(null);
      setLiveStatus(null);
      setStreamingAssistant("");
      try {
        const res = await fetch(`/api/session/${sid}/finalize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ utterance }),
        });

        const ct = res.headers.get("content-type") ?? "";
        if (!ct.includes("text/event-stream")) {
          const data = await res.json();
          if (!res.ok) {
            setError(data.error ?? "Finalize failed");
          } else if (!data.matched) {
            // Phrase not matched — keep listening / draft
          } else if (data.error) {
            setError(data.error);
          }
          return;
        }

        committedRef.current = "";
        interimRef.current = "";
        setDraft("");

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";
        let finalAssistantText = "";

        const handleEvent = async (event: string, raw: string) => {
          const data = JSON.parse(raw) as Record<string, unknown>;
          if (event === "matched") {
            const userTurn = data.userTurn as Turn | undefined;
            if (userTurn) {
              setTurns((prev) =>
                prev.some((t) => t.id === userTurn.id) ? prev : [...prev, userTurn],
              );
            }
            setLiveStatus("running");
          } else if (event === "status") {
            setLiveStatus(String(data.text ?? "running"));
          } else if (event === "delta") {
            const chunk = String(data.text ?? "");
            if (chunk) {
              finalAssistantText += chunk;
              setStreamingAssistant((prev) => prev + chunk);
            }
          } else if (event === "done") {
            setLiveStatus(null);
            setStreamingAssistant("");
            await refreshTurns(sid);
            const turns = data.turns as Turn[] | undefined;
            const assistant =
              turns?.find((x) => x.role === "assistant") ??
              (finalAssistantText
                ? ({ text: finalAssistantText } as Turn)
                : undefined);
            if (assistant?.text && typeof window !== "undefined" && window.speechSynthesis) {
              setPresence("speaking");
              await fetch(`/api/session/${sid}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "speaking" }),
              });
              const u = new SpeechSynthesisUtterance(assistant.text);
              await new Promise<void>((resolve) => {
                u.onend = () => resolve();
                u.onerror = () => resolve();
                window.speechSynthesis.speak(u);
              });
              if (listeningWantedRef.current) {
                setPresence("listening");
                await fetch(`/api/session/${sid}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "listening" }),
                });
              }
            }
          } else if (event === "error") {
            setError(String(data.error ?? "Stream error"));
            setLiveStatus(null);
            setStreamingAssistant("");
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
        setLiveStatus(null);
        setStreamingAssistant("");
      } finally {
        finalizingRef.current = false;
        setBusy(false);
      }
    },
    [refreshTurns],
  );

  const startRecognition = useCallback(() => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      setSttSupported(false);
      return;
    }
    setSttSupported(true);
    stopRecognition();
    listeningWantedRef.current = true;

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (ev) => {
      let interim = "";
      let newlyFinal = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const piece = ev.results[i][0]?.transcript ?? "";
        if (ev.results[i].isFinal) newlyFinal += piece;
        else interim += piece;
      }
      if (newlyFinal) {
        committedRef.current = `${committedRef.current} ${newlyFinal}`.trim();
      }
      interimRef.current = interim;
      const full = `${committedRef.current} ${interim}`.trim();
      setDraft(full);

      const match = matchConductorPhrase(full, phrasesRef.current);
      if (match.matched && !finalizingRef.current) {
        // Prefer match on committed finals when possible
        const committedMatch = matchConductorPhrase(
          committedRef.current,
          phrasesRef.current,
        );
        if (committedMatch.matched || !interim) {
          void finalizeUtterance(committedMatch.matched ? committedRef.current : full);
        }
      }
    };

    rec.onerror = (ev) => {
      if (ev.error === "no-speech" || ev.error === "aborted") return;
      setError(`STT: ${ev.error}`);
    };

    rec.onend = () => {
      // Survive long utterances: Web Speech often ends; restart while wanted
      if (listeningWantedRef.current && !finalizingRef.current) {
        try {
          rec.start();
        } catch {
          /* already started */
        }
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {
      /* ignore */
    }
  }, [finalizeUtterance, stopRecognition]);

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
      setTurns([]);
      committedRef.current = "";
      interimRef.current = "";
      setDraft("");
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
      await fetch(`/api/session/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "listening" }),
      });
      startRecognition();
    } else {
      setPresence("paused");
      stopRecognition();
      await fetch(`/api/session/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paused" }),
      });
    }
  };

  const endSession = async () => {
    if (!session) return;
    stopRecognition();
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    await fetch(`/api/session/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ended" }),
    });
    setPresence("ended");
    setSession(null);
    sessionIdRef.current = null;
  };

  const statusLine =
    presence === "listening"
      ? "Listening… tap once to pause"
      : presence === "paused"
        ? "Paused — tap to resume"
        : presence === "speaking"
          ? "Travis speaking…"
          : "Session ended";

  // Cold open
  if (!session) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: t.bgPrimary,
          color: t.textPrimary,
          fontFamily: "var(--travis-font)",
        }}
      >
        <h1 style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.03em", margin: 0 }}>
          Travis
        </h1>
        <p style={{ color: t.textSecondary, marginTop: 8, textAlign: "center", maxWidth: 280 }}>
          One open — keep talking. Say your done phrase when the turn is yours to hand off.
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
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Open session
        </button>
        {error && (
          <p style={{ color: t.dangerQuiet, marginTop: 16, fontSize: 14 }}>{error}</p>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: t.bgPrimary,
        color: t.textPrimary,
        fontFamily: "var(--travis-font)",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <SurfaceBoundary id="session-header" label="Session header" order={2}>
        <header
          style={{
            padding: "20px 20px 12px",
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", margin: 0 }}>
            Travis
          </h1>
          <span
            style={{
              fontSize: 13,
              color: t.accent,
              fontWeight: 500,
            }}
          >
            {session.bindingLabel} · live
          </span>
        </header>
      </SurfaceBoundary>

      <SurfaceBoundary id="voice-presence" label="Voice presence" order={3}>
        <button
          type="button"
          onClick={() => void togglePause()}
          disabled={presence === "speaking" || busy}
          aria-label={statusLine}
          style={{
            margin: "8px auto 0",
            width: 120,
            height: 120,
            borderRadius: "50%",
            border: `2px solid ${presence === "paused" ? t.border : t.presenceRing}`,
            background:
              presence === "listening"
                ? t.accentSoft
                : presence === "speaking"
                  ? t.accentSoft
                  : t.bgElevated,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: presence === "speaking" ? "default" : "pointer",
            opacity: presence === "paused" ? 0.7 : 1,
          }}
        >
          <span
            style={{
              width: presence === "listening" ? 28 : 18,
              height: presence === "listening" ? 28 : 18,
              borderRadius: presence === "paused" ? 4 : "50%",
              background: t.accent,
              display: "block",
            }}
          />
        </button>
        <p
          style={{
            textAlign: "center",
            color: t.textMuted,
            fontSize: 14,
            margin: "12px 20px 0",
          }}
        >
          {statusLine}
        </p>
        {!sttSupported && (
          <p style={{ textAlign: "center", color: t.dangerQuiet, fontSize: 13, margin: "8px 20px" }}>
            Browser STT unavailable — use Chrome/Edge on phone, or type below.
          </p>
        )}
      </SurfaceBoundary>

      <SurfaceBoundary
        id="thread"
        label="Thread"
        order={4}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {turns.map((turn) => {
          if (turn.role === "status") {
            return (
              <p
                key={turn.id}
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: t.statusText,
                  margin: 0,
                }}
              >
                {turn.text}
              </p>
            );
          }
          const isUser = turn.role === "user";
          return (
            <div
              key={turn.id}
              style={{
                alignSelf: isUser ? "flex-end" : "flex-start",
                maxWidth: "88%",
                background: isUser ? t.userBubble : t.assistantBubble,
                border: isUser ? "none" : `1px solid ${t.border}`,
                borderRadius: 16,
                padding: "10px 14px",
                fontSize: 15,
                lineHeight: 1.45,
              }}
            >
              {turn.text}
              {!isUser && (
                <button
                  type="button"
                  aria-label="Play readback"
                  onClick={() => {
                    if (!window.speechSynthesis) return;
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(
                      new SpeechSynthesisUtterance(turn.text),
                    );
                  }}
                  style={{
                    display: "block",
                    marginTop: 8,
                    border: "none",
                    background: "transparent",
                    color: t.accent,
                    fontSize: 12,
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  Play
                </button>
              )}
            </div>
          );
        })}
        {draft && presence !== "ended" && (
          <div
            style={{
              alignSelf: "flex-end",
              maxWidth: "88%",
              opacity: 0.55,
              background: t.userBubble,
              borderRadius: 16,
              padding: "10px 14px",
              fontSize: 15,
              lineHeight: 1.45,
            }}
          >
            {draft}
          </div>
        )}
        {liveStatus && (
          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              color: t.statusText,
              margin: 0,
            }}
          >
            {liveStatus}
          </p>
        )}
        {streamingAssistant && (
          <div
            style={{
              alignSelf: "flex-start",
              maxWidth: "88%",
              background: t.assistantBubble,
              border: `1px solid ${t.border}`,
              borderRadius: 16,
              padding: "10px 14px",
              fontSize: 15,
              lineHeight: 1.45,
            }}
          >
            {streamingAssistant}
          </div>
        )}
        <div ref={threadEndRef} />
      </SurfaceBoundary>

      {/* Fallback text path when STT missing — still phrase-conductor via finalize */}
      {!sttSupported && presence === "listening" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const text = String(fd.get("text") ?? "");
            if (text.trim()) void finalizeUtterance(text.trim());
            e.currentTarget.reset();
          }}
          style={{ padding: "0 16px 8px", display: "flex", gap: 8 }}
        >
          <input
            name="text"
            placeholder="Type + end with done phrase"
            style={{
              flex: 1,
              border: `1px solid ${t.border}`,
              borderRadius: 10,
              padding: "10px 12px",
              background: t.bgElevated,
              color: t.textPrimary,
            }}
          />
        </form>
      )}

      {error && (
        <p style={{ color: t.dangerQuiet, fontSize: 13, padding: "0 16px", margin: 0 }}>
          {error}
        </p>
      )}

      <SurfaceBoundary id="session-door" label="Session door" order={5}>
        <div style={{ padding: "16px 20px 28px", textAlign: "center" }}>
          <button
            type="button"
            onClick={() => void endSession()}
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
            End session
          </button>
          {phrases.length > 0 && (
            <p style={{ color: t.textMuted, fontSize: 11, marginTop: 10 }}>
              Done phrases loaded from store ({phrases.length})
            </p>
          )}
        </div>
      </SurfaceBoundary>
    </div>
  );
}
