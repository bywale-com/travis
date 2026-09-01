/**
 * Send/queue ear-feedback. Generated WAVs on HTMLAudioElement so a phone
 * will play them after the tap that armed audio — Web Audio scheduled on
 * the later SSE is silent under autoplay rules.
 */

const SAMPLE_RATE = 22050;

let armed = false;
const objectUrls: string[] = [];

function writeString(view: DataView, offset: number, text: string): void {
  for (let i = 0; i < text.length; i++) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}

/** 16-bit mono PCM WAV. */
export function encodeWav(
  samples: Float32Array,
  sampleRate: number,
): ArrayBuffer {
  const dataSize = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

function wavUrl(samples: Float32Array, sampleRate: number): string {
  const blob = new Blob([encodeWav(samples, sampleRate)], { type: "audio/wav" });
  const url = URL.createObjectURL(blob);
  objectUrls.push(url);
  return url;
}

function silenceSamples(seconds: number, sampleRate = SAMPLE_RATE): Float32Array {
  return new Float32Array(Math.max(1, Math.floor(sampleRate * seconds)));
}

/** Descending chirp + air — a send whoosh. */
export function swooshSamples(sampleRate = SAMPLE_RATE): Float32Array {
  const duration = 0.38;
  const n = Math.floor(sampleRate * duration);
  const out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * t) ** 0.7;
    const freq = 1600 * Math.pow(240 / 1600, t);
    phase += (2 * Math.PI * freq) / sampleRate;
    const tone = Math.sin(phase);
    const air = (Math.random() * 2 - 1) * (1 - t);
    out[i] = (tone * 0.72 + air * 0.28) * env;
  }
  return out;
}

/** Two parked notes — queued (cue), not sent. */
export function cueSamples(sampleRate = SAMPLE_RATE): Float32Array {
  const n = Math.floor(sampleRate * 0.34);
  const out = new Float32Array(n);
  const blip = (freq: number, start: number, dur: number) => {
    const a = Math.floor(start * sampleRate);
    const b = Math.min(n, a + Math.floor(dur * sampleRate));
    for (let i = a; i < b; i++) {
      const local = (i - a) / (b - a);
      const env = local < 0.12 ? local / 0.12 : 1 - (local - 0.12) / 0.88;
      out[i] += Math.sin((2 * Math.PI * freq * (i - a)) / sampleRate) * env * 0.7;
    }
  };
  blip(880, 0, 0.12);
  blip(587, 0.16, 0.14);
  return out;
}

let player: HTMLAudioElement | null = null;
let swooshUrl = "";
let cueUrl = "";
let bedUrl = "";
let shotPlaying = false;

function makePlayer(src: string): HTMLAudioElement | null {
  if (typeof Audio === "undefined") return null;
  const el = new Audio(src);
  el.preload = "auto";
  el.setAttribute("playsinline", "true");
  (el as HTMLAudioElement & { playsInline?: boolean }).playsInline = true;
  return el;
}

function ensurePlayers(): void {
  if (player && swooshUrl && cueUrl && bedUrl) return;
  if (typeof Audio === "undefined" || typeof URL === "undefined") return;
  swooshUrl = wavUrl(swooshSamples(), SAMPLE_RATE);
  cueUrl = wavUrl(cueSamples(), SAMPLE_RATE);
  bedUrl = wavUrl(silenceSamples(0.4), SAMPLE_RATE);
  player = makePlayer(bedUrl);
}

function restoreBed(): void {
  if (!player || !armed || shotPlaying) return;
  player.loop = true;
  player.volume = 0.001;
  if (player.getAttribute("src") !== bedUrl) player.src = bedUrl;
  void player.play().catch(() => {});
}

/**
 * Call from a tap. Phones will not play a sound that starts on a later
 * SSE unless audio was already unlocked in a user gesture.
 */
export function resumeSendSounds(): void {
  if (typeof window === "undefined") return;
  ensurePlayers();
  if (!player) return;
  armed = true;
  if (shotPlaying) return;
  player.muted = false;
  player.loop = true;
  player.volume = 0.001;
  if (!player.src || player.getAttribute("src") !== bedUrl) player.src = bedUrl;
  void player.play().catch(() => {});
}

export function releaseSendSounds(): void {
  armed = false;
  shotPlaying = false;
  if (player) {
    player.pause();
    player.removeAttribute("src");
    player.load();
  }
  player = null;
  swooshUrl = "";
  cueUrl = "";
  bedUrl = "";
  for (const url of objectUrls) URL.revokeObjectURL(url);
  objectUrls.length = 0;
}

function playShot(url: string): void {
  ensurePlayers();
  if (!player || !url) return;
  if (!armed) resumeSendSounds();
  if (!player) return;
  shotPlaying = true;
  player.loop = false;
  player.muted = false;
  player.volume = 1;
  player.onended = () => {
    shotPlaying = false;
    restoreBed();
  };
  player.src = url;
  const p = player.play();
  if (p) {
    void p.catch(() => {
      shotPlaying = false;
      restoreBed();
    });
  }
}

export function playSendSwoosh(): void {
  ensurePlayers();
  playShot(swooshUrl);
}

export function playQueuedCue(): void {
  ensurePlayers();
  playShot(cueUrl);
}
