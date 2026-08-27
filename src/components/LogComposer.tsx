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
import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";

export type RoomSeat = { seatKey: string; label: string };

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
    chipSeatKey: SeatKey | null;
  }) => Promise<void | boolean>;
}) {
  const [text, setText] = useState("");
  const [chip, setChip] = useState<RoomSeat | null>(null);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [menuBox, setMenuBox] = useState<DOMRect | null>(null);
  const fieldRef = useRef<HTMLInputElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const recRef = useRef<SpeechRec | null>(null);
  const heldRef = useRef("");
  const committedRef = useRef("");
  const wantedRef = useRef(false);

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
      setChip(seat);
      setText((prev) => prev.replace(/@\s*$/, "").trimStart());
      closeMention();
      fieldRef.current?.focus();
    },
    [closeMention],
  );

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
    }
  }, [haltMic]);

  useEffect(() => () => haltMic(), [haltMic]);

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
    const chipSeatKey = (chip?.seatKey as SeatKey | undefined) ?? null;
    const keptText = text;
    const keptChip = chip;
    setText("");
    setChip(null);
    heldRef.current = "";
    committedRef.current = "";
    const ok = await onSend({ text: keptText, chipSeatKey });
    if (ok === false) {
      setText(keptText);
      setChip(keptChip);
      heldRef.current = keptText;
      committedRef.current = keptText;
    }
    fieldRef.current?.focus();
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
      return;
    }
    if (e.key === "Backspace" && !text && chip) {
      e.preventDefault();
      setChip(null);
    }
    if (e.key === "@" || (e.key === "2" && e.shiftKey)) {
      window.setTimeout(openMention, 0);
    }
  };

  const onChange = (value: string) => {
    setText(value);
    if (value.endsWith("@")) openMention();
  };

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
            {seats.map((seat) => (
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
            ))}
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
          alignItems: "center",
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
        {chip && (
          <span
            style={{
              background: t.accentSoft,
              color: t.accent,
              borderRadius: 999,
              padding: "2px 8px",
              fontSize: 13,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            @{seatKeyToShort(chip.seatKey)}
          </span>
        )}
        <input
          ref={fieldRef}
          value={text}
          disabled={disabled}
          placeholder={chip ? "Keep writing…" : "Message"}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            color: t.textPrimary,
            fontSize: 15,
            minWidth: 0,
          }}
        />
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
