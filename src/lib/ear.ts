/** Who owns the microphone for this glass state. */

export type EarKind = "none" | "stt" | "live-connecting" | "live";

export type EarState = {
  viewMode: "voice" | "log";
  logSubmode: "talk" | "type";
  destTravis: boolean;
  liveUp: boolean;
  /** In-flight WebRTC counts as Live ownership — not a window for STT. */
  liveConnecting?: boolean;
};

export type LiveCloseAction = "reconnect" | "wait";

export const LIVE_RECONNECTING_LINE = "Reconnecting…";

export type Presence = "listening" | "paused" | "speaking" | "ended";

/** Ended and paused must not arm STT or Live. Write the ref before armEar. */
export function presenceBlocksListen(presence: Presence): boolean {
  return presence === "ended" || presence === "paused";
}

export type SttOnEndAction = "stop" | "wait" | "restart";

export type ModeSwitchAction = "keep" | "arm" | "release";

export function whichEar(opts: EarState): EarKind {
  if (opts.viewMode === "log" && opts.logSubmode === "type") return "none";
  // Live up/connecting owns Voice even if dest leave flipped the chip.
  if (opts.viewMode === "voice" && opts.liveUp) return "live";
  if (opts.viewMode === "voice" && opts.liveConnecting) {
    return "live-connecting";
  }
  return "stt";
}

/** Connecting or connected — Voice + Travis never shares the mic with Talk. */
export function liveOwnsMic(opts: EarState): boolean {
  const ear = whichEar(opts);
  return ear === "live" || ear === "live-connecting";
}

/**
 * Voice + Travis wants Live. STT must not arm on the way there, while
 * connecting, or while up. Talk/Type dest Engineer still use STT.
 */
export function sttMayStart(opts: Omit<EarState, "liveUp"> & Partial<EarState>): boolean {
  return wantedEar(opts) === "stt";
}

export function watchdogShouldStartStt(opts: EarState & { recLive: boolean }): boolean {
  if (opts.recLive) return false;
  if (!sttMayStart(opts)) return false;
  return true;
}

/**
 * Live drop never becomes Talk. Voice + Travis reconnects while listen is
 * wanted; otherwise wait for an explicit user action.
 */
export function liveCloseAction(opts: {
  viewMode: "voice" | "log";
  destTravis: boolean;
  listeningWanted: boolean;
}): LiveCloseAction {
  if (opts.viewMode === "voice" && opts.destTravis && opts.listeningWanted) {
    return "reconnect";
  }
  return "wait";
}

/**
 * Hotfix 036 — the ear we should be arming, ignoring whether Live happens to
 * be connected yet. `whichEar` reports the ear you have; asking it what to arm
 * is circular, because Voice + dest Travis always reads "stt" until Live is
 * already up, and nothing ever brings Live up.
 */
export function wantedEar(
  opts: Omit<EarState, "liveUp"> & Partial<EarState>,
): EarKind {
  if (opts.viewMode === "log" && opts.logSubmode === "type") return "none";
  if (
    opts.viewMode === "voice" &&
    (opts.destTravis || opts.liveUp || opts.liveConnecting)
  ) {
    return "live";
  }
  return "stt";
}

/**
 * A Live token that finishes after the founder left Voice must not keep the
 * mic or halt Talk STT. Only Voice + dest Travis still wants that handle.
 */
export function acceptFinishedLive(opts: Omit<EarState, "liveUp">): boolean {
  return wantedEar(opts) === "live";
}

/**
 * A running recognizer is reason to leave the mic alone only when STT is the
 * ear we wanted. In Voice + dest Travis it is a fallback to be replaced.
 */
export function sttAlreadySatisfies(
  opts: Omit<EarState, "liveUp"> & { recLive: boolean },
): boolean {
  return opts.recLive && wantedEar(opts) === "stt";
}

/**
 * Talk and Voice dest Engineer (and dest Travis Talk) share Web Speech.
 * Switching those views must not abort the recognizer — Chrome will not
 * give the mic back until refresh.
 *
 * Hotfix 043 — compares the ear each state *wants*, not the one it has.
 * `whichEar` only says "live" once Live is already connected, so on the way
 * back into Voice it called dest Travis "stt" on both sides, matched them, and
 * kept the recognizer instead of arming Live. Same circular read 036 removed
 * from `armEar`; this was the second site.
 */
export function sameRoomEar(from: EarState, to: EarState): boolean {
  const a = wantedEar(from);
  const b = wantedEar(to);
  return a === b && a === "stt";
}

export function modeSwitchEarAction(opts: {
  from: EarState;
  to: EarState;
  recLive: boolean;
}): ModeSwitchAction {
  if (wantedEar(opts.to) === "none") return "release";
  if (sameRoomEar(opts.from, opts.to) && opts.recLive) return "keep";
  return "arm";
}

/**
 * Chrome kills Web Speech when speechSynthesis speaks. Quitting on
 * "speaking" leaves Talk/Voice deaf after every readback. Wait, then restart.
 */
export function sttOnEndAction(opts: {
  wanted: boolean;
  presence: Presence;
  ttsBusy: boolean;
  recLive: boolean;
}): SttOnEndAction {
  if (!opts.wanted) return "stop";
  if (opts.presence === "paused" || opts.presence === "ended") return "stop";
  if (opts.recLive) return "stop";
  if (opts.presence === "speaking" || opts.ttsBusy) return "wait";
  return "restart";
}

/**
 * A readback can run longer than any fixed retry budget. Giving up mid-read
 * leaves the ear dead until the watchdog happens to fire, which is how a
 * reply left capture off. Keep waiting while listening is still wanted.
 */
export const STT_ONEND_RETRY_MS = 400;
export const STT_ONEND_MAX_WAIT_MS = 120_000;

export function sttShouldKeepWaiting(waitedMs: number): boolean {
  return waitedMs < STT_ONEND_MAX_WAIT_MS;
}
