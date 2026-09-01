/**
 * Quiet chrome: a swoosh when a turn actually sends, a two-note cue when
 * it parks on the queue. No asset table — generated in the AudioContext.
 */

let ctx: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

export function resumeSendSounds(): void {
  const ac = audioContext();
  if (ac && ac.state === "suspended") void ac.resume();
}

function playNow(build: (ac: AudioContext, t0: number) => void): void {
  const ac = audioContext();
  if (!ac) return;
  if (ac.state === "suspended") void ac.resume();
  build(ac, ac.currentTime);
}

/** Whoosh — the turn left the phone into the pipe. */
export function playSendSwoosh(): void {
  playNow((ac, t0) => {
    const duration = 0.22;
    const frames = Math.max(1, Math.floor(ac.sampleRate * duration));
    const buffer = ac.createBuffer(1, frames, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) {
      const env = 1 - i / frames;
      data[i] = (Math.random() * 2 - 1) * env * env;
    }
    const src = ac.createBufferSource();
    src.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 0.85;
    filter.frequency.setValueAtTime(2200, t0);
    filter.frequency.exponentialRampToValueAtTime(380, t0 + duration);
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.16, t0 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);
    src.start(t0);
    src.stop(t0 + duration + 0.02);
  });
}

/** Two parked notes — the turn is queued (cue), not sent. */
export function playQueuedCue(): void {
  playNow((ac, t0) => {
    const blip = (freq: number, at: number) => {
      const osc = ac.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, at);
      const gain = ac.createGain();
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.09, at + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.09);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(at);
      osc.stop(at + 0.11);
    };
    blip(784, t0);
    blip(523, t0 + 0.12);
  });
}
