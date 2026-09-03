"use client";

import {
  absorbFinalTranscript,
  absorbText,
  carryDraftAcrossRestart,
  collapseSpeechStutter,
  keepSpeechDraft,
  mergeLiveTranscript,
} from "@/lib/absorb-text";
import { conductorGate, conductorOnEnd, isDuplicateSend } from "@/lib/conductor";
import { speakableAgentPost } from "@/lib/agent-post";
import { flushSpeakBuffer, pullClosedSentences } from "@/lib/speak-sentences";
import { applyMaleVoice } from "@/lib/speak-voice";
import { isPinnedToBottom } from "@/lib/thread-scroll";
import { parseCallByName, parseDeadManResponse, seatKeyToShort } from "@/lib/router";
import {
  modeSwitchEarAction,
  sttOnEndAction,
  sttShouldKeepWaiting,
  whichEar,
  sttAlreadySatisfies,
  STT_ONEND_RETRY_MS,
  type EarState,
} from "@/lib/ear";
import { readJson } from "@/lib/http";
import { isTravisSeat, keepWorkAfterTravisCall } from "@/lib/seats";
import {
  playQueuedCue,
  playSendSwoosh,
  releaseSendSounds,
  resumeSendSounds,
  sendSoundSurfaceFromView,
} from "@/lib/send-sounds";
import { startTravisLive, type TravisLiveSession } from "@/lib/travis-live-client";
import type { QueueSeatDto } from "@/lib/queue-logic";
import { QueueChips, QueueLog, SeatMark } from "@/components/QueueChrome";
import { AgentPostBody } from "@/components/AgentPostBody";
import { LogComposer, type RoomSeat } from "@/components/LogComposer";
import { CreateAgent, type CreatedAgent } from "@/components/plates/CreateAgent";
import { CreateRoom, type CatalogSeat } from "@/components/plates/CreateRoom";
import { InFlightDoor, type RunningNow } from "@/components/plates/InFlightDoor";
import { RoomIndex, type RoomRow } from "@/components/plates/RoomIndex";
import { RosterDoor, type RosterMember } from "@/components/plates/RosterDoor";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import type { Tokens } from "@/theme/tokens";
import { TYPE } from "@/theme/scale";
import type { SeatKey } from "@/server/db/schema";
import { Button } from "antd";
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
  title?: string;
  status: string;
  viewMode: "voice" | "log";
  logSubmode?: "talk" | "type";
  routerState: string;
  activeSeatKey: string;
  activeLabel: string;
  defaultLabel: string;
  seats?: RoomSeat[];
};

type PlateFace = "index" | "create" | "create-agent" | "room";
type Door = null | "roster" | "inflight";

function asRoomSeats(raw: unknown): RoomSeat[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      const s = row as { id?: string; seatKey?: string | null; label?: string };
      return {
        id: typeof s.id === "string" ? s.id : undefined,
        seatKey: String(s.seatKey ?? ""),
        label: String(s.label ?? ""),
      };
    })
    .filter((s) => s.seatKey || s.label);
}

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
  onstart: (() => void) | null;
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

function cancelSpeech() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

function queueUtterance(text: string): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return Promise.resolve();
  }
  const spoken = text.trim();
  if (!spoken) return Promise.resolve();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(spoken);
    applyMaleVoice(u);
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(u);
  });
}

function facilitatorSpeak(text: string): Promise<void> {
  cancelSpeech();
  return queueUtterance(text);
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

export function Room({
  t,
  onCharacter,
}: {
  t: Tokens;
  onCharacter?: () => void;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("voice");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [presence, setPresence] = useState<Presence>("ended");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const [streamingPosts, setStreamingPosts] = useState<Record<string, string>>(
    {},
  );
  const [streamingSeat, setStreamingSeat] = useState<string | null>(null);
  const [subtitle, setSubtitle] = useState("");
  const [expandedThoughtId, setExpandedThoughtId] = useState<string | null>(null);
  const [liveThoughts, setLiveThoughts] = useState<Record<string, string>>({});
  const [queueSeats, setQueueSeats] = useState<QueueSeatDto[]>([]);
  const [logSubmode, setLogSubmode] = useState<LogSubmode>("talk");
  const [roomSeats, setRoomSeats] = useState<RoomSeat[]>([]);
  const [threadPinned, setThreadPinned] = useState(true);
  const [plate, setPlate] = useState<PlateFace>("index");
  const [door, setDoor] = useState<Door>(null);
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<CatalogSeat[]>([]);
  const [createTitle, setCreateTitle] = useState("");
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [rosterAdding, setRosterAdding] = useState(false);
  const [runningNow, setRunningNow] = useState<RunningNow[]>([]);
  const [agentReturn, setAgentReturn] = useState<"create" | "roster">("create");

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const committedRef = useRef("");
  const heldDraftRef = useRef("");
  const lastHeardRef = useRef("");
  const interimRef = useRef("");
  const listeningWantedRef = useRef(false);
  const sttArmingRef = useRef(false);
  const sttArmStartedRef = useRef(0);
  const sessionIdRef = useRef<string | null>(null);
  const phrasesRef = useRef<string[]>([]);
  const finalizingRef = useRef(false);
  const sendingRef = useRef(false);
  const lastSentRef = useRef<{ text: string; at: number }>({ text: "", at: 0 });
  const threadRef = useRef<HTMLDivElement | null>(null);
  const threadPinnedRef = useRef(true);
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
  const liveRef = useRef<TravisLiveSession | null>(null);
  const drainingRef = useRef(false);
  const consumeAgentStreamRef = useRef<
    (sid: string, res: Response, tempUserId?: string) => Promise<void>
  >(async () => {});

  viewModeRef.current = viewMode;
  logSubmodeRef.current = logSubmode;

  const sendSoundSurface = () =>
    sendSoundSurfaceFromView(viewModeRef.current, logSubmodeRef.current);
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
    if (Array.isArray(data.running)) setRunningNow(data.running);
  }, [applyQueue]);

  const refreshTurns = useCallback(async (sessionId: string) => {
    const res = await fetch(`/api/session/${sessionId}/turns`);
    const data = await res.json();
    const nextTurns = (data.turns ?? []) as Turn[];
    setTurns(nextTurns);
    setLiveThoughts((prev) => {
      const next: Record<string, string> = { ...prev };
      for (const t of nextTurns) {
        if (t.kind !== "agent_thought") continue;
        if (t.thoughtStatus === "streaming") {
          const cur = next[t.id] ?? "";
          next[t.id] = t.text.length >= cur.length ? t.text : cur;
        } else {
          delete next[t.id];
        }
      }
      return next;
    });
    setStreamingPosts((prev) => {
      const next = { ...prev };
      for (const [sk, text] of Object.entries(prev)) {
        const latest = [...nextTurns]
          .reverse()
          .find((t) => t.kind === "agent_post" && (t.seatKey ?? "_") === sk);
        if (latest && latest.text.length >= text.length) delete next[sk];
      }
      return next;
    });
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
      if (Array.isArray(data.session.seats)) {
        setRoomSeats(asRoomSeats(data.session.seats));
      }
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
    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      try {
        const res = await fetch(`/api/session/${sid}/queue`);
        const data = (await res.json()) as {
          queue?: { seats?: QueueSeatDto[] };
          drainable?: string[];
          running?: RunningNow[];
        };
        if (cancelled) return;
        applyQueue(data.queue);
        if (Array.isArray(data.running)) setRunningNow(data.running);
        void refreshTurns(sid);
        const drainable = Array.isArray(data.drainable) ? data.drainable : [];
        if (!drainable.length || drainingRef.current) return;
        drainingRef.current = true;
        try {
          const drainRes = await fetch(`/api/session/${sid}/queue/drain`, {
            method: "POST",
          });
          if (cancelled) return;
          const ct = drainRes.headers.get("content-type") ?? "";
          if (ct.includes("text/event-stream")) {
            await consumeAgentStreamRef.current(sid, drainRes);
          }
          await refreshTurns(sid);
          await refreshQueue(sid);
        } finally {
          drainingRef.current = false;
        }
      } catch {
        /* next tick retries */
      }
    };
    void tick();
    const timer = window.setInterval(() => {
      void tick();
    }, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [session?.id, applyQueue, refreshQueue, refreshTurns]);

  const scrollThreadToLatest = useCallback(() => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    threadPinnedRef.current = true;
    setThreadPinned(true);
  }, []);

  /**
   * Our own jump always lands exactly at the bottom, so any scroll event that
   * reports otherwise came from the founder's thumb.
   */
  const onThreadScroll = useCallback(() => {
    const el = threadRef.current;
    if (!el) return;
    const pinned = isPinnedToBottom(el);
    if (pinned === threadPinnedRef.current) return;
    threadPinnedRef.current = pinned;
    setThreadPinned(pinned);
  }, []);

  useEffect(() => {
    if (!threadPinnedRef.current) return;
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [turns, draft, streamingPosts, liveStatus]);

  useEffect(() => {
    if (viewMode !== "log") return;
    scrollThreadToLatest();
  }, [viewMode, logSubmode, scrollThreadToLatest]);

  useEffect(() => {
    if (!session) return;
    const onVis = () => {
      if (document.visibilityState === "visible") resumeSendSounds();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [session]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.getVoices();
    const warm = () => {
      window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.addEventListener("voiceschanged", warm);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", warm);
  }, []);

  const resetDeadManTimer = useCallback(() => {
    lastSpeechRef.current = Date.now();
    if (deadManTimerRef.current) clearTimeout(deadManTimerRef.current);
    if (!sessionIdRef.current || !listeningWantedRef.current) return;
    if (viewModeRef.current !== "voice") return;
    if (presenceRef.current !== "listening") return;
    if (isTravisSeat(sessionRef.current?.activeSeatKey)) return;
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
    const keep = keepSpeechDraft(lastHeardRef.current, merged);
    if (!keep.trim()) return;
    lastHeardRef.current = keep;
    heldDraftRef.current = keep;
    committedRef.current = keep;
    interimRef.current = "";
    setDraft(keep);
  }, []);

  const clearDraft = useCallback(() => {
    heldDraftRef.current = "";
    lastHeardRef.current = "";
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
      rec.onstart = null;
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

  const liveConnectingRef = useRef(false);
  const armEarGenRef = useRef(0);
  const armEarRef = useRef<() => Promise<void>>(async () => {});

  const stopLive = useCallback(async () => {
    const handle = liveRef.current;
    liveRef.current = null;
    liveConnectingRef.current = false;
    if (handle) await handle.stop();
  }, []);

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
    sttArmingRef.current = false;
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
      const postBySeat: Record<string, string> = {};
      let seatLabel = "PM";
      const speakUnits: Record<string, number> = {};
      let speakChain = Promise.resolve();
      let voiceReadStarted = false;
      let spokenSpeakable = "";
      let heardQueued = false;
      let heardSent = false;
      let sawTerminal = false;

      const enqueueVoice = (raw: string) => {
        if (viewModeRef.current !== "voice") return;
        let said = speakableAgentPost(raw).trim();
        if (!said) return;
        if (spokenSpeakable) {
          if (said === spokenSpeakable || spokenSpeakable.startsWith(said)) {
            return;
          }
          if (said.startsWith(spokenSpeakable)) {
            said = said.slice(spokenSpeakable.length).trim();
            if (!said) return;
          }
        }
        if (!voiceReadStarted) {
          voiceReadStarted = true;
          setPresence("speaking");
          haltRecognition();
          setSubtitle(`${seatLabel} says…`);
          void fetch(`/api/session/${sid}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "speaking" }),
          });
          const intro = `${seatLabel} says.`;
          speakChain = speakChain.then(() => queueUtterance(intro));
        }
        spokenSpeakable = spokenSpeakable ? `${spokenSpeakable} ${said}` : said;
        speakChain = speakChain.then(() => queueUtterance(said));
      };

      const handleEvent = async (event: string, raw: string) => {
        const data = JSON.parse(raw) as Record<string, unknown>;

        if (event === "queued") {
          if (!heardQueued) {
            heardQueued = true;
            playQueuedCue(sendSoundSurface());
          }
          sawTerminal = true;
          if (tempUserId) {
            setTurns((prev) => prev.filter((x) => x.id !== tempUserId));
          }
          applyQueue(data.queue as { seats?: QueueSeatDto[] } | undefined);
          return;
        }

        if (event === "queue") {
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
          if (!heardSent && !heardQueued) {
            heardSent = true;
            playSendSwoosh(sendSoundSurface());
          }
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
        } else if (event === "post") {
          const turn = data.turn as Turn | undefined;
          if (turn) {
            setTurns((prev) => {
              const i = prev.findIndex((x) => x.id === turn.id);
              if (i >= 0) {
                const copy = [...prev];
                copy[i] = { ...copy[i], ...turn };
                return copy;
              }
              return [...prev, turn];
            });
          }
        } else if (event === "post_delta") {
          const chunk = String(data.text ?? "");
          const sk = String(data.seatKey ?? "_");
          if (data.seatLabel) seatLabel = String(data.seatLabel);
          if (data.seatKey) setStreamingSeat(String(data.seatKey));
          if (chunk) {
            postBySeat[sk] = absorbText(postBySeat[sk] ?? "", chunk).acc;
            setStreamingPosts({ ...postBySeat });
            const { closed } = pullClosedSentences(postBySeat[sk]);
            const already = speakUnits[sk] ?? 0;
            for (let i = already; i < closed.length; i++) {
              enqueueVoice(closed[i]);
            }
            speakUnits[sk] = Math.max(already, closed.length);
          }
        } else if (event === "status") {
          setLiveStatus(String(data.text ?? "running"));
        } else if (event === "done") {
          sawTerminal = true;
          const sk = String(data.seatKey ?? "_");
          const acc = postBySeat[sk] ?? "";
          delete postBySeat[sk];
          setStreamingPosts({ ...postBySeat });
          setLiveStatus(null);
          setStreamingSeat(null);
          await refreshTurns(sid);
          await refreshQueue(sid);
          const postTurn = data.postTurn as Turn | undefined;
          const postText = postTurn?.text ?? acc;
          const spoken = speakableAgentPost(postText);
          const label = String(data.seatLabel ?? seatLabel);
          const units = flushSpeakBuffer(postText);
          const already = speakUnits[sk] ?? 0;
          for (let i = already; i < units.length; i++) {
            enqueueVoice(units[i]);
          }
          speakUnits[sk] = Math.max(already, units.length);

          if (voiceReadStarted) {
            const line = `${label} says… ${spoken.slice(0, 120)}${spoken.length > 120 ? "…" : ""}`;
            setSubtitle(line);
            await speakChain;
            await waitForSpeechIdle();
            await delay(500);
            presenceRef.current = "listening";
            setPresence("listening");
            setSubtitle("Listening…");
            if (listeningWantedRef.current) {
              await fetch(`/api/session/${sid}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "listening" }),
              });
              scheduleListenRestart();
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
      if (!sawTerminal) {
        setLiveStatus(null);
        setStreamingSeat(null);
        await refreshTurns(sid);
        await refreshQueue(sid);
      }
    },
    [applyQueue, haltRecognition, refreshQueue, refreshTurns, scheduleListenRestart],
  );
  consumeAgentStreamRef.current = consumeAgentStream;

  const connectLive = useCallback(
    async (sid: string): Promise<boolean> => {
      if (liveRef.current) return true;
      if (liveConnectingRef.current) return false;
      liveConnectingRef.current = true;
      setSubtitle("Talking with Travis…");
      try {
        const handle = await startTravisLive({
          sessionId: sid,
          onUnwired: () => {
            setSubtitle("Travis isn’t wired");
            void refreshTurns(sid);
          },
          onUserText: () => {
            playSendSwoosh("voice");
            void refreshTurns(sid);
          },
          onTravisText: () => {
            void refreshTurns(sid);
          },
          onSeatStream: (res) => {
            void stopLive();
            void consumeAgentStream(sid, res);
            void refreshSession(sid);
          },
          onError: (msg) => setError(msg),
          onClose: () => {
            liveRef.current = null;
            if (
              listeningWantedRef.current &&
              viewModeRef.current === "voice" &&
              isTravisSeat(sessionRef.current?.activeSeatKey)
            ) {
              startRecognitionRef.current();
            }
          },
        });
        if (!handle) {
          liveRef.current = null;
          return false;
        }
        liveRef.current = handle;
        haltRecognition();
        return true;
      } catch (e) {
        liveRef.current = null;
        setError(e instanceof Error ? e.message : String(e));
        return false;
      } finally {
        liveConnectingRef.current = false;
      }
    },
    [
      consumeAgentStream,
      haltRecognition,
      refreshSession,
      refreshTurns,
      stopLive,
    ],
  );

  const finalizeUtterance = useCallback(
    async (utterance: string) => {
      const sid = sessionIdRef.current;
      if (!sid || !utterance.trim()) return;

      // Suppress the same words being gated twice — never a turn for another
      // seat while a run streams. Whether that sends or queues is the
      // server's per-seat call, and it cannot make it if we swallow the turn.
      const text = utterance.trim();
      if (sendingRef.current) return;
      if (
        isDuplicateSend({
          text,
          lastText: lastSentRef.current.text,
          lastAtMs: lastSentRef.current.at,
          nowMs: Date.now(),
        })
      ) {
        return;
      }
      sendingRef.current = true;
      lastSentRef.current = { text, at: Date.now() };

      resumeSendSounds();
      beginInflight();
      finalizingRef.current = true;
      setError(null);
      haltRecognition();
      // The phrase is captured in `utterance`. Leaving it on the accumulator
      // lets a later reply land behind it, where the end-anchored conductor
      // can never match again.
      clearDraft();
      listenSoon();

      try {
        const res = await fetch(`/api/session/${sid}/finalize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ utterance }),
        });
        // The turn is away. Anything said from here on is a new turn and must
        // be allowed to reach the server even while this reply streams.
        sendingRef.current = false;

        const ct = res.headers.get("content-type") ?? "";
        if (!ct.includes("text/event-stream")) {
          const data = await res.json();
          if (data.queued) {
            playQueuedCue(sendSoundSurface());
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
            if (data.destTravis && viewModeRef.current === "voice") {
              void connectLive(sid);
            }
          }
          if (!res.ok && data.error) setError(data.error);
          return;
        }

        clearDraft();
        await consumeAgentStream(sid, res);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        sendingRef.current = false;
        finalizingRef.current = false;
        endInflight();
      }
    },
    [
      applyQueue,
      beginInflight,
      clearDraft,
      consumeAgentStream,
      connectLive,
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
    async (args: { text: string; chipSeatKeys: SeatKey[] }) => {
      const sid = sessionIdRef.current;
      if (!sid) return false;
      const prompt = args.text.trim();
      const tempId = prompt ? `tmp-${crypto.randomUUID()}` : "";
      if (prompt) {
        const seatKey =
          args.chipSeatKeys[0] ?? sessionRef.current?.activeSeatKey ?? "pm";
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
      resumeSendSounds();
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
    if (
      isTravisSeat(sessionRef.current?.activeSeatKey) &&
      viewModeRef.current === "voice" &&
      liveRef.current
    ) {
      return;
    }
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;
    sttArmingRef.current = true;
    sttArmStartedRef.current = Date.now();
    const gen = ++listenRestartGenRef.current;
    haltRecognition();
    listeningWantedRef.current = true;

    const attach = (attempt: number) => {
    if (gen !== listenRestartGenRef.current) {
      return;
    }
    if (!listeningWantedRef.current) {
      sttArmingRef.current = false;
      return;
    }
    if (presenceBlocksListen(presenceRef.current)) {
      sttArmingRef.current = false;
      return;
    }
    if (viewModeRef.current === "log" && logSubmodeRef.current === "type") {
      sttArmingRef.current = false;
      return;
    }
    if (
      isTravisSeat(sessionRef.current?.activeSeatKey) &&
      viewModeRef.current === "voice" &&
      liveRef.current
    ) {
      sttArmingRef.current = false;
      return;
    }
    if (recognitionLiveRef.current && recognitionRef.current) {
      sttArmingRef.current = false;
      return;
    }

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
      const sessionMerged = mergeLiveTranscript(sessionCommitted, interim);
      if (!sessionMerged.trim() && lastHeardRef.current.trim()) return;
      const committed = carryDraftAcrossRestart(
        heldDraftRef.current,
        sessionCommitted,
      );
      const full = keepSpeechDraft(
        lastHeardRef.current,
        mergeLiveTranscript(committed, interim),
      );
      if (!full.trim()) return;
      committedRef.current = committed;
      interimRef.current = interim;
      lastHeardRef.current = full;
      heldDraftRef.current = keepSpeechDraft(heldDraftRef.current, committed);
      setDraft(full);

      const destTravis = isTravisSeat(sessionRef.current?.activeSeatKey);
      if (destTravis && viewModeRef.current === "voice" && liveRef.current) {
        return;
      }

      const called = committed.trim()
        ? parseCallByName(committed)
        : { seatKey: null, remainder: "" };
      if (
        called.seatKey === "travis" &&
        !finalizingRef.current &&
        !destTravis
      ) {
        const sid = sessionIdRef.current;
        const keep = keepWorkAfterTravisCall(committed, called.remainder);
        if (sid) {
          void fetch(`/api/session/${sid}/address`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ utterance: committed }),
          })
            .then((r) => r.json())
            .then((data: { destTravis?: boolean; activeLabel?: string; activeSeatKey?: string }) => {
              if (data.activeLabel) {
                const activeLabel = String(data.activeLabel);
                const activeSeatKey = String(data.activeSeatKey ?? "travis");
                // armEar below reads the ref this same tick, before React
                // re-renders and line ~261 syncs it from state.
                if (sessionRef.current) {
                  sessionRef.current = {
                    ...sessionRef.current,
                    activeLabel,
                    activeSeatKey,
                  };
                }
                setSession((s) =>
                  s ? { ...s, activeLabel, activeSeatKey } : s,
                );
              }
              if (keep) {
                heldDraftRef.current = keep;
                lastHeardRef.current = keep;
                committedRef.current = keep;
                interimRef.current = "";
                setDraft(keep);
              } else {
                clearDraft();
              }
              if (data.destTravis && viewModeRef.current === "voice") {
                void armEarRef.current();
              } else if (liveRef.current) {
                void stopLive().then(() => startRecognitionRef.current());
              }
              void refreshTurns(sid);
            });
        }
        return;
      }

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
      const gate = conductorGate({
        committed: committedRef.current,
        interim,
        full,
        phrases: phrasesRef.current,
      });
      if (gate.send) void finalizeUtterance(collapseSpeechStutter(gate.text));
    };

    rec.onerror = (ev) => {
      recognitionLiveRef.current = false;
      sttArmingRef.current = false;
      persistHeldDraft();
      if (ev.error === "no-speech" || ev.error === "aborted") return;
      setError(`STT: ${ev.error}`);
    };

    rec.onstart = () => {
      recognitionLiveRef.current = true;
      sttArmingRef.current = false;
      setError((prev) => (prev?.startsWith("STT:") ? null : prev));
    };

    rec.onend = () => {
      persistHeldDraft();
      recognitionLiveRef.current = false;

      const settled = conductorOnEnd({
        text: lastHeardRef.current,
        phrases: phrasesRef.current,
      });
      if (settled.send && !finalizingRef.current) {
        void finalizeUtterance(collapseSpeechStutter(settled.text));
        return;
      }

      if (!listeningWantedRef.current) return;
      if (presenceRef.current === "paused" || presenceRef.current === "ended") {
        return;
      }
      let waited = 0;
      const retry = () => {
        const action = sttOnEndAction({
          wanted: listeningWantedRef.current,
          presence: presenceRef.current,
          ttsBusy: speechEngineBusy(),
          recLive: recognitionLiveRef.current,
        });
        if (action === "wait") {
          waited += STT_ONEND_RETRY_MS;
          if (sttShouldKeepWaiting(waited)) {
            window.setTimeout(retry, STT_ONEND_RETRY_MS);
          }
          return;
        }
        if (action === "restart") startRecognitionRef.current();
      };
      window.setTimeout(retry, STT_ONEND_RETRY_MS);
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {
      recognitionLiveRef.current = false;
      recognitionRef.current = null;
      if (attempt < 8) {
        window.setTimeout(() => attach(attempt + 1), 280 * (attempt + 1));
        return;
      }
      sttArmingRef.current = false;
    }
    };

    window.setTimeout(() => attach(0), 400);
    resetDeadManTimer();
  }, [
    clearDraft,
    finalizeUtterance,
    haltRecognition,
    persistHeldDraft,
    refreshTurns,
    resetDeadManTimer,
    stopLive,
  ]);

  startRecognitionRef.current = startRecognition;

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!listeningWantedRef.current) return;
      if (recognitionLiveRef.current) return;
      if (sttArmingRef.current) {
        if (Date.now() - sttArmStartedRef.current < 2500) return;
        sttArmingRef.current = false;
      }
      if (presenceBlocksListen(presenceRef.current)) return;
      if (presenceRef.current === "speaking" || speechEngineBusy()) return;
      if (viewModeRef.current === "log" && logSubmodeRef.current === "type") {
        return;
      }
      if (
        isTravisSeat(sessionRef.current?.activeSeatKey) &&
        viewModeRef.current === "voice" &&
        liveRef.current
      ) {
        return;
      }
      startRecognitionRef.current();
    }, 1600);
    return () => window.clearInterval(id);
  }, []);

  const armEar = useCallback(async () => {
    const gen = ++armEarGenRef.current;
    if (presenceBlocksListen(presenceRef.current)) return;
    if (viewModeRef.current === "log" && logSubmodeRef.current === "type") {
      listeningWantedRef.current = false;
      haltRecognition();
      await stopLive();
      return;
    }
    listeningWantedRef.current = true;
    const destTravis = isTravisSeat(sessionRef.current?.activeSeatKey);
    const voice = viewModeRef.current === "voice";
    const sid = sessionIdRef.current;
    const want = whichEar({
      viewMode: viewModeRef.current,
      logSubmode: logSubmodeRef.current,
      destTravis,
      liveUp: Boolean(liveRef.current),
    });

    if (
      sttAlreadySatisfies({
        viewMode: viewModeRef.current,
        logSubmode: logSubmodeRef.current,
        destTravis,
        recLive: Boolean(recognitionLiveRef.current && recognitionRef.current),
      })
    ) {
      return;
    }

    if (want === "live") return;

    if (liveRef.current && !(voice && destTravis)) {
      await stopLive();
      await delay(400);
      if (gen !== armEarGenRef.current) return;
    }

    if (voice && destTravis && sid) {
      haltRecognition();
      await delay(400);
      if (gen !== armEarGenRef.current) return;
      if (presenceBlocksListen(presenceRef.current)) return;
      if (
        viewModeRef.current !== "voice" ||
        !isTravisSeat(sessionRef.current?.activeSeatKey)
      ) {
        startRecognitionRef.current();
        return;
      }
      const ok = await connectLive(sid);
      if (gen !== armEarGenRef.current) return;
      if (ok) return;
      setSubtitle("Travis Live is down — phone ear. Say “I’m done”.");
    }

    startRecognitionRef.current();
  }, [connectLive, haltRecognition, stopLive]);

  armEarRef.current = armEar;

  const attachSession = useCallback(
    async (s: Session, resume: boolean) => {
      setSession(s);
      sessionIdRef.current = s.id;
      const mode: ViewMode = s.viewMode === "log" ? "log" : "voice";
      setViewMode(mode);
      viewModeRef.current = mode;
      const sub: LogSubmode = s.logSubmode === "type" ? "type" : "talk";
      setLogSubmode(sub);
      logSubmodeRef.current = sub;
      setRoomSeats(asRoomSeats(s.seats));
      setPlate("room");
      setDoor(null);
      clearDraft();
      if (s.status === "ended") {
        setPresence("ended");
        setSubtitle("");
        stopRecognition();
        void stopLive();
        if (resume) {
          await refreshTurns(s.id);
          await refreshQueue(s.id);
        }
        return;
      }
      if (resume) {
        await refreshTurns(s.id);
        await refreshQueue(s.id);
      } else {
        setTurns([]);
        setQueueSeats([]);
      }
      if (s.status === "paused") {
        setPresence("paused");
        setSubtitle("Paused");
        stopRecognition();
        void stopLive();
        return;
      }
      if (mode === "log" && sub === "type") {
        stopRecognition();
        void stopLive();
        setPresence("listening");
        setSubtitle("");
        return;
      }
      setPresence("listening");
      setSubtitle("Listening…");
      void armEar();
    },
    [
      armEar,
      clearDraft,
      refreshQueue,
      refreshTurns,
      stopLive,
      stopRecognition,
    ],
  );

  const loadRooms = useCallback(async () => {
    const res = await fetch("/api/rooms");
    const data = await readJson<{ rooms?: RoomRow[]; error?: string }>(res);
    if (!res.ok) throw new Error(data.error ?? "Could not list rooms");
    setRooms(Array.isArray(data.rooms) ? data.rooms : []);
  }, []);

  const loadCatalog = useCallback(async () => {
    const res = await fetch("/api/bindings");
    const data = await readJson<{ seats?: CatalogSeat[] }>(res);
    setCatalog(Array.isArray(data.seats) ? data.seats : []);
  }, []);

  const teardownLocal = useCallback(() => {
    stopRecognition();
    void stopLive();
    cancelSpeech();
    setPresence("ended");
    setSession(null);
    sessionIdRef.current = null;
    setSubtitle("");
    setQueueSeats([]);
    setRunningNow([]);
    setDoor(null);
    clearDraft();
    releaseSendSounds();
  }, [clearDraft, stopLive, stopRecognition]);

  const leaveRoom = useCallback(() => {
    teardownLocal();
    setPlate("index");
    void loadRooms().catch((e) => {
      setError(e instanceof Error ? e.message : String(e));
    });
  }, [loadRooms, teardownLocal]);

  const closeRoom = async (id: string) => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/session/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ended" }),
      });
      const data = await readJson<{ error?: string }>(res);
      if (!res.ok) throw new Error(data.error ?? "End failed");
      if (sessionIdRef.current === id) teardownLocal();
      setPlate("index");
      setSelectedRoomId(null);
      await loadRooms();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const enterRoom = async (id: string) => {
    setError(null);
    setBusy(true);
    resumeSendSounds();
    try {
      const res = await fetch(`/api/session?id=${id}`);
      const data = await readJson<{ session?: Session; error?: string }>(res);
      if (!res.ok || !data.session) throw new Error(data.error ?? "Enter failed");
      await attachSession(data.session, true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const createRoom = async () => {
    setError(null);
    setBusy(true);
    resumeSendSounds();
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: createTitle,
          bindingIds: [...chosen],
        }),
      });
      const data = await readJson<{ session?: Session; error?: string }>(res);
      if (!res.ok || !data.session) throw new Error(data.error ?? "Create failed");
      setCreateTitle("");
      setChosen(new Set());
      await attachSession(data.session, false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const bindingIdFor = (member: RosterMember): string | undefined => {
    if (member.id) return member.id;
    return catalog.find((c) => c.seatKey === member.seatKey)?.id;
  };

  const addRosterMember = async (member: RosterMember) => {
    const sid = sessionIdRef.current;
    const bindingId = bindingIdFor(member);
    if (!sid || !bindingId) return;
    setError(null);
    const res = await fetch(`/api/session/${sid}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bindingId }),
    });
    const data = await readJson<{ seats?: RoomSeat[]; error?: string }>(res);
    if (!res.ok) {
      setError(data.error ?? "Could not add");
      return;
    }
    if (data.seats) setRoomSeats(asRoomSeats(data.seats));
    await refreshSession(sid);
  };

  const removeRosterMember = async (member: RosterMember) => {
    const sid = sessionIdRef.current;
    const bindingId = bindingIdFor(member);
    if (!sid || !bindingId) return;
    setError(null);
    const res = await fetch(`/api/session/${sid}/members/${bindingId}`, {
      method: "DELETE",
    });
    const data = await readJson<{ seats?: RoomSeat[]; error?: string }>(res);
    if (!res.ok) {
      setError(data.error ?? "Could not remove");
      return;
    }
    if (data.seats) setRoomSeats(asRoomSeats(data.seats));
    await refreshSession(sid);
  };

  const onAgentCreated = async (agent: CreatedAgent) => {
    setCatalog((prev) =>
      prev.some((c) => c.id === agent.id)
        ? prev
        : [...prev, { id: agent.id, seatKey: agent.seatKey, label: agent.label }],
    );
    if (agentReturn === "create") {
      setChosen((prev) => new Set(prev).add(agent.id));
      setPlate("create");
      return;
    }
    const sid = sessionIdRef.current;
    if (sid) {
      await addRosterMember({
        id: agent.id,
        seatKey: agent.seatKey,
        label: agent.label,
      });
    }
    setPlate("room");
    setDoor("roster");
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await Promise.all([loadRooms(), loadCatalog()]);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadCatalog, loadRooms]);

  const togglePause = async () => {
    if (!session || presence === "ended" || presence === "speaking") return;
    resumeSendSounds();
    if (presence === "paused") {
      setPresence("listening");
      setSubtitle("Listening…");
      await fetch(`/api/session/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "listening" }),
      });
      void armEar();
    } else {
      setPresence("paused");
      stopRecognition();
      void stopLive();
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
    const from: EarState = {
      viewMode: viewModeRef.current,
      logSubmode: logSubmodeRef.current,
      destTravis: isTravisSeat(session.activeSeatKey),
      liveUp: Boolean(liveRef.current),
    };
    setViewMode(mode);
    viewModeRef.current = mode;
    await fetch(`/api/session/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ viewMode: mode }),
    });
    setSession((s) => (s ? { ...s, viewMode: mode } : s));
    presenceRef.current = "listening";
    setPresence("listening");
    setSubtitle("Listening…");
    if (deadManTimerRef.current) clearTimeout(deadManTimerRef.current);
    resetDeadManTimer();
    const to = {
      viewMode: mode,
      logSubmode: logSubmodeRef.current,
      destTravis: isTravisSeat(session.activeSeatKey),
      liveUp: Boolean(liveRef.current),
    };
    const switchAction = modeSwitchEarAction({
      from,
      to,
      recLive: Boolean(recognitionLiveRef.current && recognitionRef.current),
    });
    if (switchAction === "keep") {
      listeningWantedRef.current = true;
      return;
    }
    if (switchAction === "release") {
      stopRecognition();
      await stopLive();
      return;
    }
    await armEar();
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
      await stopLive();
    } else {
      listeningWantedRef.current = true;
      setPresence("listening");
      setSubtitle("Listening…");
      await armEar();
    }
  };

  const activeThoughts = turns.filter(
    (t) =>
      t.kind === "agent_thought" &&
      (t.thoughtStatus === "streaming" || liveThoughts[t.id]),
  );

  const viaShort = seatKeyToShort(session?.activeSeatKey, session?.activeLabel);
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

  if (plate === "create") {
    return (
      <CreateRoom
        t={t}
        title={createTitle}
        catalog={catalog}
        chosen={chosen}
        busy={busy}
        error={error}
        onTitle={setCreateTitle}
        onToggle={(id) => {
          setChosen((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          });
        }}
        onCreate={() => void createRoom()}
        onBack={() => {
          setPlate("index");
          setError(null);
        }}
        onCreateAgent={() => {
          setAgentReturn("create");
          setPlate("create-agent");
        }}
      />
    );
  }

  if (plate === "create-agent") {
    return (
      <CreateAgent
        t={t}
        backLabel={
          agentReturn === "roster"
            ? session?.title?.trim() || "Room"
            : "New room"
        }
        onBack={() => {
          setPlate(agentReturn === "roster" && session ? "room" : "create");
          if (agentReturn === "roster") setDoor("roster");
        }}
        onCreated={(agent) => void onAgentCreated(agent)}
      />
    );
  }

  if (!session || plate === "index") {
    return (
      <RoomIndex
        t={t}
        rooms={rooms}
        selectedId={selectedRoomId}
        busy={busy}
        error={error}
        onSelect={setSelectedRoomId}
        onEnter={(id) => void enterRoom(id)}
        onNew={() => {
          setError(null);
          setPlate("create");
        }}
        onLeave={() => {
          if (session) leaveRoom();
          else setSelectedRoomId(null);
        }}
        onEnd={() => {
          const id = selectedRoomId;
          if (id) void closeRoom(id);
        }}
        onCharacter={() => onCharacter?.()}
      />
    );
  }

  return (
    <div style={shellStyle} onPointerDown={() => resumeSendSounds()}>
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
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={() => setDoor("roster")}
            style={{
              border: `1px solid ${t.border}`,
              background: t.bgElevated,
              color: t.textPrimary,
              borderRadius: 999,
              padding: "6px 12px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              maxWidth: "46%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {session.title?.trim() || "Untitled"}
          </button>
          <span style={{ color: t.textMuted, fontSize: TYPE.meta }}>
            via {session.activeLabel || viaShort}
          </span>
          <button
            type="button"
            onClick={() => leaveRoom()}
            style={{
              border: "none",
              background: "transparent",
              color: t.textSecondary,
              fontSize: 13,
              padding: 0,
              cursor: "pointer",
            }}
          >
            Leave
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
              {roomSeats.slice(0, 6).map((seat, i) => {
                const key = seat.seatKey || seat.label;
                const thought = activeThoughts.find((t) => t.seatKey === seat.seatKey);
                const streaming = thought && liveThoughts[thought.id];
                const working = runningNow.some((r) => r.seatKey === seat.seatKey);
                const active =
                  thought?.thoughtStatus === "streaming" || !!streaming || working;
                const expanded = thought && expandedThoughtId === thought.id;
                return (
                  <button
                    key={`${seat.id ?? key}-${i}`}
                    type="button"
                    onClick={() => {
                      if (thought) {
                        setExpandedThoughtId(expanded ? null : thought.id);
                        return;
                      }
                      setDoor("roster");
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      marginLeft: i > 0 ? -10 : 0,
                      zIndex: 6 - i,
                      cursor: "pointer",
                      opacity:
                        thought || working || session.activeSeatKey === seat.seatKey
                          ? 1
                          : 0.45,
                    }}
                    aria-label={`${seatKeyToShort(seat.seatKey, seat.label)} thought`}
                  >
                    <SeatMark
                      seatKey={key}
                      label={seat.label}
                      t={t}
                      size={38}
                      glow={!!active}
                    />
                  </button>
                );
              })}
              {roomSeats.length > 6 ? (
                <button
                  type="button"
                  onClick={() => setDoor("roster")}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: t.textMuted,
                    fontSize: TYPE.meta,
                    marginLeft: 8,
                    cursor: "pointer",
                  }}
                >
                  +{roomSeats.length - 6}
                </button>
              ) : null}
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
              onOpen={() => setDoor("inflight")}
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
            ref={threadRef}
            onScroll={onThreadScroll}
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
              .filter((turn) => {
                // A run that errored is the one status worth showing.
                if (turn.kind === "status") return /error/i.test(turn.text);
                if (
                  turn.kind !== "user" &&
                  turn.kind !== "agent_post" &&
                  turn.kind !== "travis_prompt"
                ) {
                  return false;
                }
                if (turn.kind !== "agent_post") return true;
                const live = streamingPosts[turn.seatKey ?? "_"];
                if (!live) return true;
                const lastUser = [...turns]
                  .reverse()
                  .find((t) => t.kind === "user");
                if (lastUser && turn.referenceTurnId === lastUser.id) {
                  return false;
                }
                return true;
              })
              .map((turn) => {
                // 041 narration: a tool acting, not Travis talking. Quiet
                // line, no bubble, no seat mark.
                if (
                  turn.kind === "agent_post" &&
                  turn.seatKey === "travis" &&
                  turn.speakable === false
                ) {
                  return (
                    <div
                      key={turn.id}
                      style={{
                        alignSelf: "flex-start",
                        maxWidth: "92%",
                        color: t.receiptText,
                        fontSize: TYPE.meta,
                        fontStyle: "italic",
                        lineHeight: 1.5,
                      }}
                    >
                      {turn.text}
                    </div>
                  );
                }

                if (turn.kind === "status") {
                  return (
                    <div
                      key={turn.id}
                      style={{
                        alignSelf: "center",
                        color: t.dangerQuiet,
                        fontSize: TYPE.meta,
                        letterSpacing: 0.2,
                      }}
                    >
                      {`${seatKeyToShort(turn.seatKey)} · run error`}
                    </div>
                  );
                }

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
                        label={
                          roomSeats.find(
                            (s) =>
                              s.seatKey === (isPrompt ? "travis" : seat || "pm"),
                          )?.label
                        }
                        t={t}
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
                        {turn.kind === "agent_post" ? (
                          <AgentPostBody text={turn.text} t={t} />
                        ) : (
                          turn.text
                        )}
                        {!isUser && turn.kind === "agent_post" && (
                          <button
                            type="button"
                            onClick={() => {
                              haltRecognition();
                              void (async () => {
                                await facilitatorSpeak(
                                  speakableAgentPost(turn.text),
                                );
                                await waitForSpeechIdle();
                                await delay(500);
                                if (logSubmodeRef.current === "type") return;
                                if (presenceBlocksListen(presenceRef.current)) {
                                  return;
                                }
                                listeningWantedRef.current = true;
                                presenceRef.current = "listening";
                                setPresence("listening");
                                startRecognitionRef.current();
                              })();
                            }}
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
            {Object.entries(streamingPosts).map(([sk, liveText]) => (
              <div
                key={sk}
                style={{
                  alignSelf: "flex-start",
                  maxWidth: "92%",
                  display: "flex",
                  gap: 8,
                }}
              >
                <SeatMark
                  seatKey={sk === "_" ? (streamingSeat ?? session.activeSeatKey) : sk}
                  label={
                    roomSeats.find(
                      (s) =>
                        s.seatKey ===
                        (sk === "_"
                          ? (streamingSeat ?? session.activeSeatKey)
                          : sk),
                    )?.label
                  }
                  t={t}
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
                  <AgentPostBody text={liveText} t={t} />
                </div>
              </div>
            ))}
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
          </SurfaceBoundary>
          {!threadPinned && (
            <div
              style={{
                flexShrink: 0,
                display: "flex",
                justifyContent: "center",
                padding: "0 16px 6px",
              }}
            >
              <QuietTextButton
                t={t}
                label="Jump to latest"
                onClick={scrollThreadToLatest}
              />
            </div>
          )}
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

      {door === "roster" ? (
        <RosterDoor
          t={t}
          roomTitle={session.title ?? ""}
          members={roomSeats}
          catalog={catalog}
          adding={rosterAdding}
          onClose={() => {
            setDoor(null);
            setRosterAdding(false);
          }}
          onRemove={(m) => void removeRosterMember(m)}
          onAdd={(m) => void addRosterMember(m)}
          onCreateAgent={() => {
            setAgentReturn("roster");
            setDoor(null);
            setPlate("create-agent");
          }}
          onToggleAdd={() => setRosterAdding((v) => !v)}
          onEnd={() => void closeRoom(session.id)}
        />
      ) : null}

      {door === "inflight" ? (
        <InFlightDoor
          t={t}
          running={runningNow}
          waiting={queueSeats}
          onClose={() => setDoor(null)}
          onSendItem={(id) =>
            void postQueueJson(`/api/session/${session.id}/queue/${id}`, {
              action: "send",
            })
          }
          onDeleteItem={(id) =>
            void postQueueJson(`/api/session/${session.id}/queue/${id}`, {
              action: "delete",
            })
          }
          onSendNext={() => {
            const head = queueSeats[0]?.items[0];
            if (!head) return;
            void postQueueJson(`/api/session/${session.id}/queue/${head.id}`, {
              action: "send",
            });
          }}
        />
      ) : null}
    </div>
  );
}
