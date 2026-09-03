"use client";

import { absorbText, collapseSpeechStutter } from "@/lib/absorb-text";
import {
  interpretRealtimeEvent,
  parseEphemeralSecret,
  realtimeSessionConfig,
  type ToolDecl,
} from "@/lib/travis-openai";

export type TravisLiveSession = {
  stop: () => Promise<void>;
  /** One short beat. Not a seat body. */
  notify: (line: string) => void;
};

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
    tools?: ToolDecl[];
    systemInstruction?: string;
    error?: string;
  };
  if (!tokenData.wired || !tokenData.token) {
    if (tokenData.error) opts.onError(tokenData.error);
    opts.onUnwired();
    return null;
  }

  const secret = parseEphemeralSecret({ value: tokenData.token });
  if (!secret) {
    opts.onUnwired();
    return null;
  }

  let closed = false;
  let userAcc = "";
  let travisAcc = "";
  let userFlush: ReturnType<typeof setTimeout> | null = null;
  let pendingNotify: string | null = null;
  let stopFn: () => Promise<void> = async () => {};

  const persist = async (role: "user" | "travis", text: string) => {
    const res = await fetch(`/api/session/${opts.sessionId}/live/transcript`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, text }),
    });
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

  const flushUser = (forced?: string) => {
    if (userFlush != null) {
      clearTimeout(userFlush);
      userFlush = null;
    }
    const said = collapseSpeechStutter(forced ?? userAcc);
    userAcc = "";
    if (!said) return;
    void persist("user", said).then((data) => {
      if (data?.stopLive) void stopFn();
    });
  };

  const audioEl = document.createElement("audio");
  audioEl.autoplay = true;
  const pc = new RTCPeerConnection();
  let dc: RTCDataChannel | null = null;
  let mic: MediaStream | null = null;

  const sendEvent = (obj: unknown) => {
    if (closed || dc?.readyState !== "open") return;
    dc.send(JSON.stringify(obj));
  };

  const sendNotify = (line: string) => {
    const said = line.trim();
    if (!said) return;
    sendEvent({
      type: "response.create",
      response: {
        instructions: `Say only this, then stop: ${said} Do not read any seat post. Do not call tools.`,
      },
    });
  };

  const notify = (line: string) => {
    if (closed) return;
    if (dc?.readyState === "open") {
      sendNotify(line);
      return;
    }
    pendingNotify = line;
  };

  const runTools = async (
    calls: Array<{ name: string; callId: string; args: Record<string, unknown> }>,
  ) => {
    for (const call of calls) {
      const toolRes = await fetch(`/api/session/${opts.sessionId}/live/tool`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: call.name, args: call.args }),
      });
      const json = (await toolRes.json()) as { text?: string };
      sendEvent({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: call.callId,
          output: json.text ?? "",
        },
      });
    }
    sendEvent({ type: "response.create" });
  };

  pc.ontrack = (e) => {
    audioEl.srcObject = e.streams[0] ?? null;
    void audioEl.play().catch(() => {});
  };

  try {
    mic = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    });
    for (const track of mic.getAudioTracks()) pc.addTrack(track, mic);

    dc = pc.createDataChannel("oai-events");
    dc.addEventListener("open", () => {
      sendEvent({
        type: "session.update",
        session: realtimeSessionConfig({
          instructions: tokenData.systemInstruction ?? "",
          tools: tokenData.tools ?? [],
        }),
      });
      if (pendingNotify) {
        sendNotify(pendingNotify);
        pendingNotify = null;
      }
    });
    dc.addEventListener("message", (e) => {
      if (closed) return;
      let ev: unknown;
      try {
        ev = JSON.parse(String(e.data));
      } catch {
        return;
      }
      if (!ev || typeof ev !== "object") return;
      const actions = interpretRealtimeEvent(ev);
      for (const action of actions) {
        if (action.op === "error") {
          opts.onError(action.message);
          continue;
        }
        if (action.op === "user_delta") {
          userAcc = absorbText(userAcc, action.text).acc;
          if (userFlush != null) clearTimeout(userFlush);
          userFlush = setTimeout(() => flushUser(), 850);
          continue;
        }
        if (action.op === "user_flush") {
          if (action.text) userAcc = action.text;
          flushUser();
          continue;
        }
        if (action.op === "travis_delta") {
          travisAcc = absorbText(travisAcc, action.text).acc;
          void persist("travis", travisAcc);
          continue;
        }
        if (action.op === "travis_flush") {
          if (travisAcc.trim()) void persist("travis", travisAcc);
          travisAcc = "";
          continue;
        }
        if (action.op === "tools") void runTools(action.calls);
      }
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    if (pc.iceGatheringState !== "complete") {
      await new Promise<void>((resolve) => {
        const t = window.setTimeout(resolve, 1500);
        pc.onicegatheringstatechange = () => {
          if (pc.iceGatheringState === "complete") {
            window.clearTimeout(t);
            resolve();
          }
        };
      });
    }

    const sdp = pc.localDescription?.sdp;
    if (!sdp) throw new Error("Live: no SDP offer");
    const sdpRes = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      body: sdp,
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/sdp",
      },
    });
    const answerSdp = await sdpRes.text();
    if (!sdpRes.ok) {
      throw new Error(answerSdp.slice(0, 180) || `Live ${sdpRes.status}`);
    }
    await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

    function stop() {
      closed = true;
      if (userFlush != null) {
        clearTimeout(userFlush);
        userFlush = null;
      }
      try {
        dc?.close();
      } catch {
        /* ignore */
      }
      dc = null;
      try {
        pc.close();
      } catch {
        /* ignore */
      }
      audioEl.pause();
      audioEl.srcObject = null;
      const tracks = mic?.getTracks() ?? [];
      for (const t of tracks) t.stop();
      mic = null;
      opts.onClose?.();
      return new Promise<void>((resolve) => {
        window.setTimeout(resolve, 400);
      });
    }
    stopFn = stop;
    pc.addEventListener("connectionstatechange", () => {
      if (closed) return;
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        opts.onClose?.();
      }
    });
    return { stop, notify };
  } catch (err) {
    closed = true;
    try {
      dc?.close();
      pc.close();
    } catch {
      /* ignore */
    }
    audioEl.pause();
    audioEl.srcObject = null;
    const tracks = mic?.getTracks() ?? [];
    for (const t of tracks) t.stop();
    opts.onError(err instanceof Error ? err.message : String(err));
    return null;
  }
}
