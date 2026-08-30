"use client";

import {
  absorbFinalTranscript,
  carryDraftAcrossRestart,
  mergeLiveTranscript,
} from "@/lib/absorb-text";
import { seatKeyToShort } from "@/lib/router";
import type { SeatKey } from "@/server/db/schema";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import type { Tokens } from "@/theme/tokens";
import { AtSign, Mic, Send } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

export type RoomSeat = { seatKey: string; label: string };

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
  const committedRef = useRef("");
  const wantedRef = useRef(false);

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

  const haltMic = useCallback(() => {
    wantedRef.current = false;
    const rec = recRef.current;
    recRef.current = null;
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
    setMicOn(false);
  }, []);

  const startMic = useCallback(() => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;
    haltMic();
    wantedRef.current = true;
    let attempts = 0;
    const attach = () => {
    if (!wantedRef.current) return;
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
      const committed = carryDraftAcrossRestart(heldRef.current, sessionCommitted);
      committedRef.current = committed;
      setText(mergeLiveTranscript(committed, interim));
    };
    rec.onend = () => {
      const merged = mergeLiveTranscript(committedRef.current, "");
      if (merged) {
        heldRef.current = merged;
        committedRef.current = merged;
        setText(merged);
      }
      if (!wantedRef.current) return;
      window.setTimeout(() => {
        if (wantedRef.current) startMic();
      }, 250);
    };
    recRef.current = rec;
    try {
      rec.start();
      setMicOn(true);
    } catch {
      setMicOn(false);
      recRef.current = null;
      if (attempts++ < 6) window.setTimeout(attach, 160 * attempts);
    }
    };
    window.setTimeout(attach, 140);
  }, [haltMic]);

  useEffect(() => () => haltMic(), [haltMic]);

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
    const chipSeatKeys = chips.map((c) => c.seatKey as SeatKey);
    const keptText = text;
    const keptChips = chips;
    setText("");
    setChips([]);
    heldRef.current = "";
    committedRef.current = "";
    const ok = await onSend({ text: keptText, chipSeatKeys });
    if (ok === false) {
      setText(keptText);
      setChips(keptChips);
      heldRef.current = keptText;
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
    if (value.endsWith("@")) openMention();
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
              overflow: "hidden",
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
                  <span style={{ color: t.accent, fontWeight: 600, minWidth: 36 }}>
                    {seatKeyToShort(seat.seatKey)}
                  </span>
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
                  aria-label={`Remove @${seatKeyToShort(chip.seatKey)}`}
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
                  @{seatKeyToShort(chip.seatKey)}
                </button>
              ))}
            </div>
          )}
          <textarea
            ref={fieldRef}
            value={text}
            disabled={disabled}
            rows={1}
            placeholder={chips.length ? "Keep writing…" : "Message"}
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
            background: "transparent",
            color: t.accent,
            padding: 4,
            display: "flex",
            cursor: "pointer",
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </SurfaceBoundary>
  );
}
