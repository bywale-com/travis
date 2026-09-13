/**
 * Prove Chromium fake-audio capture reaches a live WebRTC session.
 * No product URL. No OpenAI. Engineer plant proof + CI log line.
 */

import { chromium, type Browser, type Page } from "playwright";
import { fileURLToPath } from "node:url";

function streamArchWavPath(): string {
  return fileURLToPath(new URL("../fixtures/stream-arch-cue.wav", import.meta.url));
}

const PROVE_HTML = `<!doctype html><html><body><pre id="out">wait</pre>
<script>
async function go() {
  const out = document.getElementById("out");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const track = stream.getAudioTracks()[0];
    if (!track || track.readyState !== "live") {
      out.textContent = "FAIL no live audio track";
      return;
    }
    const a = new RTCPeerConnection();
    const b = new RTCPeerConnection();
    let remote = null;
    b.ontrack = (e) => { remote = e.streams[0] || null; };
    a.onicecandidate = (e) => { if (e.candidate) b.addIceCandidate(e.candidate); };
    b.onicecandidate = (e) => { if (e.candidate) a.addIceCandidate(e.candidate); };
    stream.getTracks().forEach((t) => a.addTrack(t, stream));
    const senderLive = a.getSenders().some((s) => s.track && s.track.readyState === "live");
    const offer = await a.createOffer();
    await a.setLocalDescription(offer);
    await b.setRemoteDescription(offer);
    const answer = await b.createAnswer();
    await b.setLocalDescription(answer);
    await a.setRemoteDescription(answer);
    await new Promise((r) => setTimeout(r, 800));
    if (!remote) {
      out.textContent = "FAIL no remote WebRTC stream";
      return;
    }
    const ctx = new AudioContext();
    await ctx.resume();
    async function energy(stream) {
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      src.connect(analyser);
      analyser.connect(ctx.destination);
      const data = new Uint8Array(analyser.fftSize);
      let maxDev = 0;
      for (let i = 0; i < 30; i++) {
        analyser.getByteTimeDomainData(data);
        for (let j = 0; j < data.length; j++) {
          const d = Math.abs(data[j] - 128);
          if (d > maxDev) maxDev = d;
        }
        await new Promise((r) => setTimeout(r, 60));
      }
      return maxDev;
    }
    const localE = await energy(stream);
    const remoteE = await energy(remote);
    window.__peak = { localE: localE, remoteE: remoteE, track: track.readyState };
    if (localE > 2 && senderLive) {
      out.textContent = "OK fake-audio reached WebRTC sender local=" + localE + " remote=" + remoteE;
    } else if (remoteE > 2) {
      out.textContent = "OK fake-audio reached WebRTC remote=" + remoteE;
    } else {
      out.textContent = "FAIL silent capture local=" + localE + " remote=" + remoteE + " sender=" + senderLive;
    }
  } catch (e) {
    out.textContent = "FAIL " + (e && e.message ? e.message : String(e));
  }
}
go();
</script></body></html>`;

async function launchProve(headed: boolean) {
  const wav = streamArchWavPath();
  return chromium.launch({
    headless: !headed,
    args: [
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      `--use-file-for-fake-audio-capture=${wav}`,
      "--allow-file-access-from-files",
      "--autoplay-policy=no-user-gesture-required",
    ],
  });
}

async function openProvePage(browser: Browser): Promise<Page> {
  const context = await browser.newContext();
  await context.grantPermissions(["microphone"], { origin: "https://example.com" });
  const page = await context.newPage();
  await page.goto("https://example.com", { waitUntil: "domcontentloaded" });
  await page.setContent(PROVE_HTML);
  return page;
}

async function readProve(page: Page): Promise<string> {
  await page.waitForFunction(
    () => {
      const t = document.getElementById("out")?.textContent ?? "";
      return t.startsWith("OK") || t.startsWith("FAIL");
    },
    { timeout: 20_000 },
  );
  return page.locator("#out").innerText();
}

export async function proveFakeAudioReachesWebRtc(): Promise<void> {
  let browser = await launchProve(false);
  try {
    let line = await readProve(await openProvePage(browser));
    console.log(`runtime: ${line}`);
    if (line.startsWith("OK")) return;
    await browser.close();
    console.log("runtime: headless fake-audio miss; retrying headed Chromium");
    browser = await launchProve(true);
    line = await readProve(await openProvePage(browser));
    console.log(`runtime: ${line}`);
    if (!line.startsWith("OK")) {
      throw new Error(`fake-audio did not reach WebRTC: ${line}`);
    }
  } finally {
    await browser.close();
  }
}
