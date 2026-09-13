"use client";

import { absorbText, collapseSpeechStutter } from "@/lib/absorb-text";
import { readJson } from "@/lib/http";
import { shouldDropHeardAsUser } from "@/lib/thread-truth";
import {
  interpretRealtimeEvent,
  liveInstructions,
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
  getReferenceTurnId?: () => string | null;
}): Promise<TravisLiveSession | null> {
  const tokenRes = await fetch(`/api/session/${opts.sessionId}/live/token`, {
    method: "POST",
  });
  const tokenData = await readJson<{
    wired?: boolean;
    token?: string;
    model?: string;
    tools?: ToolDecl[];
    systemInstruction?: string;
    here?: string;
    error?: string;
  }>(tokenRes);
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
  let lastTravis = "";
  let userFlush: ReturnType<typeof setTimeout> | null = null;
  let pendingNotify: string | null = null;
  let harnessBusy = false;
  let skipNextTravisPersist = false;
  let stopFn: () => Promise<void> = async () => {};
  let sendEvent: (obj: unknown) => void = () => {};

  const pushHere = (here: string) => {
    const block = here.trim();
    if (!block) return;
    sendEvent({
      type: "session.update",
      session: realtimeSessionConfig({
        instructions: liveInstructions(tokenData.systemInstruction ?? "", block),
        tools: tokenData.tools ?? [],
      }),
    });
  };

  const persist = async (role: "user" | "travis", text: string) => {
    const res = await fetch(`/api/session/${opts.sessionId}/live/transcript`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          text,
          referenceTurnId: opts.getReferenceTurnId?.() ?? null,
        }),
    });
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("text/event-stream")) {
      opts.onSeatStream(res);
      return { stopLive: true };
    }
    const data = await readJson<{
      stopLive?: boolean;
      here?: string;
      serveSpeak?: string;
    }>(res);
    if (typeof data.serveSpeak === "string") {
      if (role === "user") opts.onUserText(text);
      if (data.serveSpeak.trim()) {
        skipNextTravisPersist = true;
        lastTravis = data.serveSpeak;
        sendNotify(data.serveSpeak);
        opts.onTravisText(data.serveSpeak);
      }
      return data;
    }
    if (role === "user") opts.onUserText(text);
    if (role === "travis") opts.onTravisText(text);
    if (data.here) pushHere(data.here);
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
    sendEvent({ type: "response.cancel" });
    if (
      shouldDropHeardAsUser({
        heard: said,
        hisLast: lastTravis,
        heIsSpeaking: Boolean(travisAcc.trim()),
      })
    ) {
      return;
    }
    harnessBusy = true;
    void persist("user", said)
      .then((data) => {
        if (data?.stopLive) void stopFn();
      })
      .catch((e) => {
        opts.onError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        harnessBusy = false;
      });
  };

  const audioEl = document.createElement("audio");
  audioEl.autoplay = true;
  const pc = new RTCPeerConnection();
  let dc: RTCDataChannel | null = null;
  let mic: MediaStream | null = null;

  sendEvent = (obj: unknown) => {
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

  pc.ontrack = (e) => {
    audioEl.srcObject = e.streams[0] ?? null;
    void audioEl.play().catch(() => {});
  };

  const attachMicAfterPeerReady = async () => {
    mic = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    });
    const track = mic.getAudioTracks()[0];
    if (!track) throw new Error("Live: no microphone track");
    const sender =
      pc.getSenders().find((s) => s.track?.kind === "audio") ??
      pc.getSenders().find((s) => !s.track);
    if (sender) await sender.replaceTrack(track);
    else pc.addTrack(track, mic);
  };

  try {
    // Hold the audio m-line without opening the mic. Chromium's fake-file
    // capture starts at getUserMedia; the dest line is the first 4s of the
    // fixture and was gone before RTP/session.update if we armed during ICE.
    pc.addTransceiver("audio", { direction: "sendrecv" });

    dc = pc.createDataChannel("oai-events");
    let resolveDcOpen = () => {};
    const dcOpen = new Promise<void>((resolve) => {
      resolveDcOpen = resolve;
    });
    dc.addEventListener("open", () => {
      sendEvent({
        type: "session.update",
        session: realtimeSessionConfig({
          instructions: liveInstructions(
            tokenData.systemInstruction ?? "",
            tokenData.here ?? "",
          ),
          tools: tokenData.tools ?? [],
        }),
      });
      if (pendingNotify) {
        sendNotify(pendingNotify);
        pendingNotify = null;
      }
      resolveDcOpen();
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
          if (harnessBusy || skipNextTravisPersist) continue;
          travisAcc = absorbText(travisAcc, action.text).acc;
          continue;
        }
        if (action.op === "travis_flush") {
          const said = collapseSpeechStutter(travisAcc);
          travisAcc = "";
          if (harnessBusy) continue;
          if (skipNextTravisPersist) {
            skipNextTravisPersist = false;
            continue;
          }
          if (said) {
            lastTravis = said;
            void persist("travis", said).catch((e) => {
              opts.onError(e instanceof Error ? e.message : String(e));
            });
          }
          continue;
        }
        if (action.op === "tools") continue;
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
    if (dc && dc.readyState !== "open") {
      await Promise.race([
        dcOpen,
        new Promise<void>((resolve) => {
          window.setTimeout(resolve, 4000);
        }),
      ]);
    }
    await attachMicAfterPeerReady();

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
