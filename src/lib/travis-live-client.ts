"use client";

import { absorbText, collapseSpeechStutter } from "@/lib/absorb-text";
import { readJson } from "@/lib/http";
import { shouldDropHeardAsUser } from "@/lib/thread-truth";
import {
  interpretRealtimeEvent,
  liveInstructions,
  parseEphemeralSecret,
  realtimeSdpAnswer,
  realtimeSessionConfig,
  type ToolDecl,
} from "@/lib/travis-openai";

async function namedFetch(
  label: string,
  input: string,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`${label}: ${msg}`);
  }
}

/** Chromium often delivers getUserMedia tracks muted until the first frame. */
function waitTrackUnmuted(track: MediaStreamTrack): Promise<void> {
  if (!track.muted) return Promise.resolve();
  return new Promise((resolve) => {
    const t = window.setTimeout(resolve, 2500);
    track.addEventListener(
      "unmute",
      () => {
        window.clearTimeout(t);
        resolve();
      },
      { once: true },
    );
  });
}

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
  const tokenRes = await namedFetch("Live token", `/api/session/${opts.sessionId}/live/token`, {
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
      // Dest leave is a Cursor job. Live stays the ear for wrap.
      return {};
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

  const attachMicAfterPeerReady = async (): Promise<MediaStream> => {
    // Unconstrained audio — forcing AEC/NS on Chromium's fake-file capture
    // zeroes the fixture. Real phones still get the UA default.
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const track = stream.getAudioTracks()[0];
    if (!track) throw new Error("Live: no microphone track");
    track.enabled = true;
    await waitTrackUnmuted(track);
    const sender =
      pc.getSenders().find((s) => s.track?.kind === "audio") ??
      pc.getSenders().find((s) => !s.track);
    if (sender) await sender.replaceTrack(track);
    else pc.addTrack(track, stream);
    return stream;
  };

  try {
    // Late media: sendrecv m-line without opening the fake-file mic.
    // Chromium starts the fixture at getUserMedia; dest is the first ~11s.
    // Arm after SDP + data-channel session.update so Realtime can hear it.
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
    const sdpRes = await namedFetch(
      "Live SDP",
      `/api/session/${opts.sessionId}/live/sdp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sdp, token: secret }),
      },
    );
    const sdpData = await readJson<{ sdp?: string; error?: string }>(sdpRes);
    const answerSdp = realtimeSdpAnswer(sdpData.sdp ?? "") ?? "";
    if (!sdpRes.ok || !answerSdp) {
      throw new Error(sdpData.error?.slice(0, 180) || `Live SDP ${sdpRes.status}`);
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
    if (pc.connectionState !== "connected") {
      await new Promise<void>((resolve) => {
        const t = window.setTimeout(resolve, 8000);
        const onState = () => {
          if (
            pc.connectionState === "connected" ||
            pc.connectionState === "failed"
          ) {
            window.clearTimeout(t);
            pc.removeEventListener("connectionstatechange", onState);
            resolve();
          }
        };
        pc.addEventListener("connectionstatechange", onState);
      });
    }
    mic = await attachMicAfterPeerReady();

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
