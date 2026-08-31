/** Who owns the microphone for this glass state. */

export type EarKind = "none" | "stt" | "live";

export function whichEar(opts: {
  viewMode: "voice" | "log";
  logSubmode: "talk" | "type";
  destTravis: boolean;
  liveUp: boolean;
}): EarKind {
  if (opts.viewMode === "log" && opts.logSubmode === "type") return "none";
  if (opts.viewMode === "voice" && opts.destTravis && opts.liveUp) return "live";
  return "stt";
}
