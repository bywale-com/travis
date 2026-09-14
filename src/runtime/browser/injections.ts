/** Page scripts installed before app boot. */

export const STT_DOUBLE = `
(() => {
  window.__travisSttStarts = 0;
  window.__travisSttLive = false;
  const instances = [];
  class FakeSpeechRecognition {
    constructor() {
      this.continuous = false;
      this.interimResults = false;
      this.lang = "";
      this.onresult = null;
      this.onerror = null;
      this.onstart = null;
      this.onend = null;
      instances.push(this);
    }
    start() {
      window.__travisSttStarts += 1;
      window.__travisSttLive = true;
      const self = this;
      setTimeout(function () {
        if (self.onstart) self.onstart();
      }, 0);
    }
    abort() {
      window.__travisSttLive = false;
    }
    stop() {
      window.__travisSttLive = false;
      const self = this;
      setTimeout(function () {
        if (self.onend) self.onend();
      }, 0);
    }
  }
  window.SpeechRecognition = FakeSpeechRecognition;
  window.webkitSpeechRecognition = FakeSpeechRecognition;
  window.__travisEmitStt = function (finals, interim) {
    const rec = instances[instances.length - 1];
    if (!rec || !rec.onresult) return;
    const results = [];
    for (let i = 0; i < finals.length; i++) {
      results.push({ 0: { transcript: finals[i] }, isFinal: true, length: 1 });
    }
    if (interim) {
      results.push({ 0: { transcript: interim }, isFinal: false, length: 1 });
    }
    rec.onresult({ results: results });
  };
})();
`;

export const LIVE_OWNERSHIP_MOCKS = `
(() => {
  window.__travisSttStarts = 0;
  window.__travisRtcCreated = 0;
  const instances = [];
  class FakeSpeechRecognition {
    constructor() {
      this.continuous = false;
      this.interimResults = false;
      this.lang = "";
      this.onresult = null;
      this.onerror = null;
      this.onstart = null;
      this.onend = null;
      instances.push(this);
    }
    start() {
      window.__travisSttStarts += 1;
    }
    abort() {}
    stop() {}
  }
  window.SpeechRecognition = FakeSpeechRecognition;
  window.webkitSpeechRecognition = FakeSpeechRecognition;

  navigator.mediaDevices.getUserMedia = async function () {
    const ctx = new AudioContext();
    const dest = ctx.createMediaStreamDestination();
    const osc = ctx.createOscillator();
    osc.frequency.value = 220;
    osc.connect(dest);
    osc.start();
    return dest.stream;
  };

  class FakePC {
    constructor() {
      window.__travisRtcCreated += 1;
      this.iceGatheringState = "complete";
      this.connectionState = "connected";
      this.localDescription = { type: "offer", sdp: "v=0" };
      this.ontrack = null;
      this.onicegatheringstatechange = null;
      this._sender = null;
    }
    addTrack(track) {
      this._sender = { track: track, replaceTrack: async (next) => { this._sender.track = next; } };
      return this._sender;
    }
    addTransceiver(kind) {
      this._sender = {
        track: null,
        kind: kind,
        replaceTrack: async (next) => { this._sender.track = next; },
      };
      return { sender: this._sender, receiver: {}, direction: "sendrecv" };
    }
    getSenders() {
      return this._sender ? [this._sender] : [];
    }
    async replaceTrack() {}
    createDataChannel() {
      const dc = {
        readyState: "connecting",
        send() {},
        close() {},
        addEventListener(ev, fn) {
          if (ev === "open") {
            setTimeout(function () {
              dc.readyState = "open";
              fn();
            }, 20);
          }
        },
      };
      return dc;
    }
    async createOffer() {
      return { type: "offer", sdp: "v=0" };
    }
    async setLocalDescription() {}
    async setRemoteDescription() {}
    close() {}
    addEventListener() {}
  }
  window.RTCPeerConnection = FakePC;

  const origFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    const url = String(typeof input === "string" ? input : input && input.url);
    if (url.indexOf("api.openai.com") !== -1 || url.indexOf("/live/sdp") !== -1) {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            sdp: "v=0\\r\\no=- 0 0 IN IP4 127.0.0.1\\r\\ns=-\\r\\nt=0 0\\r\\n",
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );
    }
    return origFetch(input, init);
  };
})();
`;

export const REALTIME_USAGE_HOOK = `
(() => {
  window.__realtimeUsage = null;
  window.__realtimeTx = [];
  window.__realtimeEv = [];
  window.__travisSttStarts = 0;
  const Orig = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (Orig) {
    const Wrapped = function () {
      const rec = new Orig();
      const start = rec.start.bind(rec);
      rec.start = function () {
        window.__travisSttStarts += 1;
        return start();
      };
      return rec;
    };
    window.SpeechRecognition = Wrapped;
    window.webkitSpeechRecognition = Wrapped;
  }
  const OrigPC = window.RTCPeerConnection;
  window.RTCPeerConnection = function (cfg) {
    const pc = new OrigPC(cfg);
    const orig = pc.createDataChannel.bind(pc);
    pc.createDataChannel = function (name, options) {
      const dc = orig(name, options);
      dc.addEventListener("message", function (e) {
        try {
          const ev = JSON.parse(String(e.data));
          if (typeof ev.type === "string") {
            window.__realtimeEv = (window.__realtimeEv || []).concat([ev.type]).slice(-40);
          }
          if (ev.type === "response.done") {
            window.__realtimeUsage = ev.response && ev.response.usage
              ? ev.response.usage
              : ev.response || ev;
          }
          if (typeof ev.type === "string" && ev.type.indexOf("transcription") !== -1) {
            window.__realtimeTx = (window.__realtimeTx || []).concat([ev.type]);
          }
        } catch (err) {}
      });
      return dc;
    };
    return pc;
  };
})();
`;
