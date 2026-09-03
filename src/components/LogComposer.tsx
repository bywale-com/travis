"use client";

import {
  absorbFinalTranscript,
  carryDraftAcrossRestart,
  keepSpeechDraft,
  mergeLiveTranscript,
} from "@/lib/absorb-text";
import { wrapSelection } from "@/lib/composer-format";
import { resumeSendSounds } from "@/lib/send-sounds";
import type { SeatKey } from "@/server/db/schema";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import type { Tokens } from "@/theme/tokens";
import { SeatMark } from "@/components/QueueChrome";
import { AtSign, Bold, Code, Italic, Mic, Send } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

export type RoomSeat = { id?: string; seatKey: string; label: string };

/** Grow with wrap up to 12 lines / 36vh, then scroll inside (005). */
const COMPOSER_LINE_PX = 21;
const COMPOSER_MAX_LINES = 12;

type SpeechRec = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((ev: { results: ArrayLike<{ isFinal: boolean; 0?: { transcript?: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function getSpeechRecognition(): (new () => SpeechRec) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function composerCapPx(): number {
  if (typeof window === "undefined") return COMPOSER_LINE_PX * COMPOSER_MAX_LINES;
  return Math.min(
    COMPOSER_LINE_PX * COMPOSER_MAX_LINES,
    Math.round(window.innerHeight * 0.36),
  );
}

export function LogComposer({
  t,
  seats,
  disabled,
  onSend,
}: {
  t: Tokens;
  seats: RoomSeat[];
  disabled?: boolean;
  onSend: (args: {
    text: string;
    chipSeatKeys: SeatKey[];
  }) => Promise<void | boolean>;
}) {
  const [text, setText] = useState("");
  const [chips, setChips] = useState<RoomSeat[]>([]);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [menuBox, setMenuBox] = useState<DOMRect | null>(null);
  const fieldRef = useRef<HTMLTextAreaElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const recRef = useRef<SpeechRec | null>(null);
  const heldRef = useRef("");
  const lastHeardRef = useRef("");
  const committedRef = useRef("");
  const wantedRef = useRef(false);
  const recognitionLiveRef = useRef(false);
  const sttArmingRef = useRef(false);
  const sttArmStartedRef = useRef(0);
  const genRef = useRef(0);

  const fitField = useCallback(() => {
    const el = fieldRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, composerCapPx())}px`;
  }, []);

  const closeMention = useCallback(() => {
    setMentionOpen(false);
    setMenuBox(null);
  }, []);

  const openMention = useCallback(() => {
    const el = wrapRef.current;
    if (el) setMenuBox(el.getBoundingClientRect());
    setMentionOpen(true);
  }, []);

  const pickSeat = useCallback(
    (seat: RoomSeat) => {
      setChips((prev) =>
        prev.some((c) => c.seatKey === seat.seatKey) ? prev : [...prev, seat],
      );
      setText((prev) => prev.replace(/@\s*$/, "").trimStart());
      closeMention();
      fieldRef.current?.focus();
    },
    [closeMention],
  );

  const dropChip = useCallback((seatKey: string) => {
    setChips((prev) => prev.filter((c) => c.seatKey !== seatKey));
    fieldRef.current?.focus();
  }, []);

  const persistHeldDraft = useCallback(() => {
    const fromField = fieldRef.current?.value ?? "";
    const fromRefs = mergeLiveTranscript(committedRef.current, "");
    const merged = keepSpeechDraft(
      lastHeardRef.current,
      keepSpeechDraft(fromRefs, fromField),
    );
    if (!merged.trim()) return;
    lastHeardRef.current = merged;
    heldRef.current = merged;
    committedRef.current = merged;
    setText(merged);
  }, []);

  const haltMic = useCallback(() => {
    persistHeldDraft();
    wantedRef.current = false;
    recognitionLiveRef.current = false;
    sttArmingRef.current = false;
    genRef.current += 1;
    const rec = recRef.current;
    recRef.current = null;
    if (!rec) {
      setMicOn(false);
      return;
    }
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
    setMicOn(false);
  }, [persistHeldDraft]);

  const startMic = useCallback(() => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;
    persistHeldDraft();
    haltMic();
    wantedRef.current = true;
    sttArmingRef.current = true;
    sttArmStartedRef.current = Date.now();
    const gen = genRef.current;
    let attempts = 0;
    const attach = () => {
    if (gen !== genRef.current) return;
    if (!wantedRef.current) {
      sttArmingRef.current = false;
      return;
    }
    if (recognitionLiveRef.current && recRef.current) {
      sttArmingRef.current = false;
      return;
    }
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (ev) => {
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
      const committed = keepSpeechDraft(
        lastHeardRef.current,
        carryDraftAcrossRestart(heldRef.current, sessionCommitted),
      );
      const next = keepSpeechDraft(
        lastHeardRef.current,
        mergeLiveTranscript(committed, interim),
      );
      if (!next.trim()) return;
      committedRef.current = committed;
      lastHeardRef.current = next;
      heldRef.current = keepSpeechDraft(heldRef.current, committed);
      setText(next);
    };
    rec.onstart = () => {
      recognitionLiveRef.current = true;
      sttArmingRef.current = false;
      setMicOn(true);
    };
    rec.onend = () => {
      persistHeldDraft();
      recognitionLiveRef.current = false;
      if (!wantedRef.current) return;
      window.setTimeout(() => {
        if (wantedRef.current) startMic();
      }, 400);
    };
    rec.onerror = () => {
      recognitionLiveRef.current = false;
      sttArmingRef.current = false;
      persistHeldDraft();
    };
    recRef.current = rec;
    try {
      rec.start();
    } catch {
      recRef.current = null;
      recognitionLiveRef.current = false;
      if (attempts++ < 8) window.setTimeout(attach, 280 * attempts);
      else sttArmingRef.current = false;
    }
    };
    window.setTimeout(attach, 400);
  }, [haltMic, persistHeldDraft]);

  useEffect(() => {
    const id = window.setTimeout(() => startMic(), 400);
    return () => {
      window.clearTimeout(id);
      haltMic();
    };
  }, [haltMic, startMic]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!wantedRef.current) return;
      if (recognitionLiveRef.current) return;
      if (sttArmingRef.current) {
        if (Date.now() - sttArmStartedRef.current < 2500) return;
        sttArmingRef.current = false;
      }
      startMic();
    }, 1600);
    return () => window.clearInterval(id);
  }, [startMic]);

  useLayoutEffect(() => {
    fitField();
  }, [text, fitField]);

  useEffect(() => {
    if (!mentionOpen) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") closeMention();
    };
    const onScroll = () => {
      if (wrapRef.current) setMenuBox(wrapRef.current.getBoundingClientRect());
    };
    const onDown = (ev: MouseEvent) => {
      const target = ev.target as Element | null;
      if (target?.closest("[data-at-mention]")) return;
      closeMention();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [mentionOpen, closeMention]);

  const submit = async () => {
    haltMic();
    resumeSendSounds();
    const chipSeatKeys = chips.map((c) => c.seatKey as SeatKey);
    const keptText = text;
    const keptChips = chips;
    setText("");
    setChips([]);
    heldRef.current = "";
    lastHeardRef.current = "";
    committedRef.current = "";
    const ok = await onSend({ text: keptText, chipSeatKeys });
    if (ok === false) {
      setText(keptText);
      setChips(keptChips);
      heldRef.current = keptText;
      lastHeardRef.current = keptText;
      committedRef.current = keptText;
    }
    fieldRef.current?.focus();
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
      return;
    }
    if (e.key === "Backspace" && !text && chips.length) {
      e.preventDefault();
      setChips((prev) => prev.slice(0, -1));
    }
    if (e.key === "@" || (e.key === "2" && e.shiftKey)) {
      window.setTimeout(openMention, 0);
    }
  };

  const onChange = (value: string) => {
    setText(value);
    lastHeardRef.current = value;
    heldRef.current = value;
    committedRef.current = value;
    if (value.endsWith("@")) openMention();
  };

  const applyMark = (mark: "**" | "*" | "`") => {
    const el = fieldRef.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    const next = wrapSelection(text, start, end, mark);
    setText(next.text);
    lastHeardRef.current = next.text;
    heldRef.current = next.text;
    committedRef.current = next.text;
    window.requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(next.start, next.end);
    });
  };

  const untagged = seats.filter(
    (seat) => !chips.some((c) => c.seatKey === seat.seatKey),
  );

  const list =
    mentionOpen && menuBox
      ? createPortal(
          <div data-at-mention="list">
          <SurfaceBoundary
            id="at-mention-list"
            label="Address list"
            order={6}
            style={{
              position: "fixed",
              left: menuBox.left,
              width: Math.min(280, menuBox.width),
              bottom: window.innerHeight - menuBox.top + 8,
              background: t.bgElevated,
              border: `1px solid ${t.border}`,
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(44,36,28,0.12)",
              zIndex: 80,
              overflowY: "auto",
              maxHeight: 280,
            }}
          >
            {untagged.length === 0 ? (
              <p
                style={{
                  margin: 0,
                  padding: "10px 12px",
                  color: t.textMuted,
                  fontSize: 13,
                }}
              >
                All tagged
              </p>
            ) : (
              untagged.map((seat) => (
                <button
                  key={seat.seatKey}
                  type="button"
                  onClick={() => pickSeat(seat)}
                  style={{
                    display: "flex",
                    width: "100%",
                    gap: 10,
                    alignItems: "center",
                    padding: "10px 12px",
                    border: "none",
                    background: "transparent",
                    color: t.textPrimary,
                    fontSize: 14,
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <SeatMark
                    seatKey={seat.seatKey}
                    label={seat.label}
                    t={t}
                    size={24}
                  />
                  <span>{seat.label}</span>
                </button>
              ))
            )}
          </SurfaceBoundary>
          </div>,
          document.body,
        )
      : null;

  return (
    <SurfaceBoundary
      id="log-composer"
      label="Log composer"
      order={5}
      style={{
        flexShrink: 0,
        padding: "8px 12px 16px",
        background: t.bgPrimary,
      }}
    >
      {list}
      <div
        ref={wrapRef}
        data-at-mention="field"
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          background: t.bgElevated,
          border: `1px solid ${t.border}`,
          borderRadius: 22,
          padding: "6px 10px",
        }}
      >
        <button
          type="button"
          aria-label={micOn ? "Stop mic" : "Mic into field"}
          onClick={() => (micOn ? haltMic() : startMic())}
          disabled={disabled}
          style={{
            border: "none",
            background: "transparent",
            color: micOn ? t.accent : t.textMuted,
            padding: 4,
            display: "flex",
            cursor: "pointer",
          }}
        >
          <Mic size={18} />
        </button>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {chips.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {chips.map((chip) => (
                <button
                  key={chip.seatKey}
                  type="button"
                  aria-label={`Remove @${chip.label}`}
                  onClick={() => dropChip(chip.seatKey)}
                  style={{
                    background: t.accentSoft,
                    color: t.accent,
                    borderRadius: 999,
                    padding: "2px 8px",
                    fontSize: 13,
                    fontWeight: 600,
                    flexShrink: 0,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  @{chip.label}
                </button>
              ))}
            </div>
          )}
          <textarea
            ref={fieldRef}
            value={text}
            disabled={disabled}
            rows={1}
            placeholder={chips.length ? "Keep writing…" : "Message the room"}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              color: t.textPrimary,
              fontSize: 15,
              lineHeight: `${COMPOSER_LINE_PX}px`,
              minHeight: COMPOSER_LINE_PX,
              maxHeight: "min(36vh, 252px)",
              resize: "none",
              overflowY: "auto",
              padding: "2px 0",
              fontFamily: "inherit",
            }}
          />
        </div>
        <button
          type="button"
          aria-label="Address"
          onClick={() => (mentionOpen ? closeMention() : openMention())}
          disabled={disabled}
          style={{
            border: "none",
            background: "transparent",
            color: mentionOpen ? t.accent : t.textMuted,
            padding: 4,
            display: "flex",
            cursor: "pointer",
          }}
        >
          <AtSign size={18} />
        </button>
        <button
          type="button"
          aria-label="Send"
          onClick={() => void submit()}
          disabled={disabled}
          style={{
            border: "none",
            background: t.accent,
            color: t.bgPrimary,
            width: 36,
            height: 36,
            borderRadius: "50%",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Send size={16} />
        </button>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "8px 8px 0",
        }}
      >
        <button
          type="button"
          aria-label="Bold"
          onClick={() => applyMark("**")}
          disabled={disabled}
          style={{
            border: "none",
            background: "transparent",
            color: t.textMuted,
            padding: 2,
            cursor: "pointer",
          }}
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          aria-label="Italic"
          onClick={() => applyMark("*")}
          disabled={disabled}
          style={{
            border: "none",
            background: "transparent",
            color: t.textMuted,
            padding: 2,
            cursor: "pointer",
          }}
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          aria-label="Code"
          onClick={() => applyMark("`")}
          disabled={disabled}
          style={{
            border: "none",
            background: "transparent",
            color: t.textMuted,
            padding: 2,
            cursor: "pointer",
          }}
        >
          <Code size={16} />
        </button>
      </div>
    </SurfaceBoundary>
  );
}
