/** Who owns the microphone for this glass state. */

export type EarKind = "none" | "stt" | "live";

export type EarState = {
  viewMode: "voice" | "log";
  logSubmode: "talk" | "type";
  destTravis: boolean;
  liveUp: boolean;
};

export type Presence = "listening" | "paused" | "speaking" | "ended";

export type SttOnEndAction = "stop" | "wait" | "restart";

export type ModeSwitchAction = "keep" | "arm" | "release";

export function whichEar(opts: EarState): EarKind {
  if (opts.viewMode === "log" && opts.logSubmode === "type") return "none";
  if (opts.viewMode === "voice" && opts.destTravis && opts.liveUp) return "live";
  return "stt";
}

/**
 * Talk and Voice dest Engineer (and dest Travis Talk) share Web Speech.
 * Switching those views must not abort the recognizer — Chrome will not
 * give the mic back until refresh.
 */
export function sameRoomEar(from: EarState, to: EarState): boolean {
  const a = whichEar(from);
  const b = whichEar(to);
  return a === b && a === "stt";
}

export function modeSwitchEarAction(opts: {
  from: EarState;
  to: EarState;
  recLive: boolean;
}): ModeSwitchAction {
  if (whichEar(opts.to) === "none") return "release";
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
