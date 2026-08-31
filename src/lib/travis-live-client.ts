"use client";

import { absorbText, collapseSpeechStutter } from "@/lib/absorb-text";
import { TRAVIS_LIVE_MODEL } from "@/lib/travis-models";

type ToolDecl = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

export type TravisLiveSession = {
  stop: () => Promise<void>;
};

function pcmToBase64(buf: Float32Array): string {
  const out = new Int16Array(buf.length);
  for (let i = 0; i < buf.length; i++) {
    const s = Math.max(-1, Math.min(1, buf[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(out.buffer);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function base64ToPcm16(b64: string): Int16Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Int16Array(bytes.buffer);
}

export async function startTravisLive(opts: {
  sessionId: string;
  onUnwired: () => void;
  onUserText: (text: string) => void;
  onTravisText: (text: string) => void;
  onSeatStream: (res: Response) => void;
  onError: (msg: string) => void;
  onClose?: () => void;
}): Promise<TravisLiveSession | null> {
  const tokenRes = await fetch(`/api/session/${opts.sessionId}/live/token`, {
    method: "POST",
  });
  const tokenData = (await tokenRes.json()) as {
    wired?: boolean;
    token?: string;
    model?: string;
    handle?: string;
    tools?: ToolDecl[];
    systemInstruction?: string;
    error?: string;
  };
  if (!tokenData.wired || !tokenData.token) {
    opts.onUnwired();
    return null;
  }

  const { GoogleGenAI, Modality } = await import("@google/genai");
  const ai = new GoogleGenAI({
    apiKey: tokenData.token,
    httpOptions: { apiVersion: "v1alpha" },
  });

  const playCtx = new AudioContext({ sampleRate: 24000 });
  void playCtx.resume();
  let nextPlay = 0;

  const playPcm = (b64: string) => {
    const pcm = base64ToPcm16(b64);
    const f32 = new Float32Array(pcm.length);
    for (let i = 0; i < pcm.length; i++) f32[i] = pcm[i] / 0x8000;
    const buf = playCtx.createBuffer(1, f32.length, 24000);
    buf.copyToChannel(f32, 0);
    const src = playCtx.createBufferSource();
    src.buffer = buf;
    src.connect(playCtx.destination);
    const now = playCtx.currentTime;
    const startAt = Math.max(now, nextPlay);
    src.start(startAt);
    nextPlay = startAt + buf.duration;
  };

  type LiveSess = {
    sendRealtimeInput: (p: unknown) => void;
    sendToolResponse: (p: unknown) => void;
    close: () => void;
  };
  let live: LiveSess | null = null;
  let closed = false;
  let userAcc = "";
  let travisAcc = "";
  let userFlush: ReturnType<typeof setTimeout> | null = null;
  let pendingHandle: string | undefined;
  let stopFn: () => Promise<void> = async () => {};

  const persist = async (
    role: "user" | "travis",
    text: string,
    handle?: string,
  ) => {
    const res = await fetch(
      `/api/session/${opts.sessionId}/live/transcript`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, text, handle }),
      },
    );
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("text/event-stream")) {
      opts.onSeatStream(res);
      return { stopLive: true };
    }
    const data = (await res.json()) as { stopLive?: boolean };
    if (role === "user") opts.onUserText(text);
    if (role === "travis") opts.onTravisText(text);
    return data;
  };

  const flushUser = () => {
    if (userFlush != null) {
      clearTimeout(userFlush);
      userFlush = null;
    }
    const said = collapseSpeechStutter(userAcc);
    userAcc = "";
    if (!said) return;
    void persist("user", said, pendingHandle).then((data) => {
      if (data?.stopLive) void stopFn();
    });
  };

  try {
  live = (await ai.live.connect({
    model: tokenData.model ?? TRAVIS_LIVE_MODEL,
    config: {
      responseModalities: [Modality.AUDIO],
      systemInstruction: tokenData.systemInstruction,
      sessionResumption: tokenData.handle
        ? { handle: tokenData.handle }
        : {},
      tools: tokenData.tools?.length
        ? [
            {
              functionDeclarations: tokenData.tools.map((t) => ({
                name: t.name,
                description: t.description,
                parameters: t.parameters,
              })),
            },
          ]
        : undefined,
    },
    callbacks: {
      onmessage: (message: {
        serverContent?: {
          modelTurn?: { parts?: Array<{ inlineData?: { data?: string } }> };
          outputTranscription?: { text?: string };
          inputTranscription?: { text?: string };
          turnComplete?: boolean;
        };
        toolCall?: {
          functionCalls?: Array<{
            id?: string;
            name?: string;
            args?: Record<string, unknown>;
          }>;
        };
        sessionResumptionUpdate?: { newHandle?: string };
      }) => {
        if (closed) return;
        const audio = message.serverContent?.modelTurn?.parts?.find(
          (p) => p.inlineData?.data,
        )?.inlineData?.data;
        if (audio) playPcm(audio);
        const out = message.serverContent?.outputTranscription?.text;
        if (out?.trim()) {
          travisAcc = absorbText(travisAcc, out.trim()).acc;
          void persist("travis", travisAcc);
        }
        const inn = message.serverContent?.inputTranscription?.text;
        if (inn?.trim()) {
          userAcc = absorbText(userAcc, inn.trim()).acc;
          if (userFlush != null) clearTimeout(userFlush);
          userFlush = setTimeout(flushUser, 850);
        }
        if (message.sessionResumptionUpdate?.newHandle) {
          pendingHandle = message.sessionResumptionUpdate.newHandle;
          void persist("user", "", pendingHandle);
        }
        if (message.serverContent?.turnComplete) {
          flushUser();
          travisAcc = "";
        }
        const calls = message.toolCall?.functionCalls ?? [];
        if (calls.length && live) {
          void (async () => {
            const responses = [];
            for (const call of calls) {
              const toolRes = await fetch(
                `/api/session/${opts.sessionId}/live/tool`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: call.name,
                    args: call.args ?? {},
                  }),
                },
              );
              const json = (await toolRes.json()) as { text?: string };
              responses.push({
                id: call.id,
                name: call.name,
                response: { result: json.text ?? "" },
              });
            }
            live?.sendToolResponse({ functionResponses: responses });
          })();
        }
      },
      onerror: (e: { message?: string }) => {
        opts.onError(e.message ?? "Live error");
      },
      onclose: () => {
        closed = true;
        opts.onClose?.();
      },
    },
  })) as LiveSess;

  const mic = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true },
  });
  const capCtx = new AudioContext({ sampleRate: 16000 });
  void capCtx.resume();
  const src = capCtx.createMediaStreamSource(mic);
  const proc = capCtx.createScriptProcessor(4096, 1, 1);
  const silent = capCtx.createGain();
  silent.gain.value = 0;
  proc.onaudioprocess = (ev) => {
    if (closed || !live) return;
    const ch = ev.inputBuffer.getChannelData(0);
    live.sendRealtimeInput({
      media: { mimeType: "audio/pcm;rate=16000", data: pcmToBase64(ch) },
    });
  };
  src.connect(proc);
  proc.connect(silent);
  silent.connect(capCtx.destination);

  function stop() {
    closed = true;
    if (userFlush != null) {
      clearTimeout(userFlush);
      userFlush = null;
    }
    try {
      live?.close();
    } catch {
      /* ignore */
    }
    live = null;
    try {
      proc.disconnect();
      src.disconnect();
      silent.disconnect();
      void capCtx.close();
      void playCtx.close();
    } catch {
      /* ignore */
    }
    const tracks = mic.getTracks();
    for (const t of tracks) t.stop();
    return new Promise<void>((resolve) => {
      window.setTimeout(resolve, 400);
    });
  }
  stopFn = stop;

  return { stop };
  } catch (err) {
    closed = true;
    try {
      live?.close();
    } catch {
      /* ignore */
    }
    live = null;
    try {
      void playCtx.close();
    } catch {
      /* ignore */
    }
    opts.onError(err instanceof Error ? err.message : String(err));
    return null;
  }
}
