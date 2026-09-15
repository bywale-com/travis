/**
 * Local phone-face double for `npm run test:preflight`.
 * Same door strings as the planted Voice/Log chrome. No Vercel. No Next.
 */

import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";

export const PREFLIGHT_COOKIE = "preflight-local";

type Turn = {
  text: string;
  role: string;
  kind: string;
  seatKey: string | null;
  speakable: boolean;
  seq: number;
};

type Session = {
  id: string;
  status: "live" | "ended";
  turns: Turn[];
};

const FACE_HTML = `<!doctype html>
<html>
<head><title>Travis</title></head>
<body>
<div id="root"></div>
<script>
(function () {
  var CHARACTER_KEY = "travis-character";
  var STAY_KEY = "travis-stay";
  var plate = "voice";
  var logSubmode = "talk";
  var lookOpen = false;
  var draft = "";
  var root = document.getElementById("root");

  function byName(name) {
    var all = root.querySelectorAll("button");
    for (var i = 0; i < all.length; i++) {
      if (all[i].textContent === name) return all[i];
    }
    return null;
  }

  function sessionId() {
    try {
      var stay = JSON.parse(localStorage.getItem(STAY_KEY) || "null");
      return stay && stay.sessionId ? stay.sessionId : "";
    } catch (e) {
      return "";
    }
  }

  function startTalkEar() {
    var Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;
    var rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = function (ev) {
      var text = "";
      for (var i = 0; i < ev.results.length; i++) {
        text += ev.results[i][0] ? ev.results[i][0].transcript : "";
      }
      draft = text;
      paint();
      if (/I'm done|I’m done/i.test(text)) {
        var sid = sessionId();
        if (!sid) return;
        fetch("/api/session/" + sid + "/finalize", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text: text }),
        }).then(function () { paint(); });
      }
    };
    rec.start();
  }

  function paint() {
    var hasChar = !!localStorage.getItem(CHARACTER_KEY);
    if (!hasChar) {
      root.innerHTML =
        "<p>TRAVIS</p>" +
        "<p>Pick a character, not a brightness.</p>" +
        "<button type=\\"button\\">Mission</button>" +
        "<button type=\\"button\\">Carbon</button>" +
        "<button type=\\"button\\">Match system</button>" +
        "<button type=\\"button\\">Continue</button>";
      var cont = root.querySelectorAll("button")[3];
      cont.addEventListener("click", function () {
        localStorage.setItem(CHARACTER_KEY, "mission");
        paint();
      });
      return;
    }
    if (plate !== "log") {
      root.innerHTML =
        "<p>Talking with Travis…</p>" +
        "<p>Listening...</p>" +
        "<button type=\\"button\\">View log</button>";
      root.querySelector("button").addEventListener("click", function () {
        plate = "log";
        paint();
        if (logSubmode === "talk") startTalkEar();
      });
      return;
    }
    var talkOn = logSubmode === "talk";
    var html =
      "<div>" +
      "<button type=\\"button\\">Backlog</button>" +
      "<button type=\\"button\\">Look</button>" +
      "<button type=\\"button\\">Requests</button>" +
      "<button type=\\"button\\">Leave</button>" +
      "</div>" +
      "<div>" +
      "<button type=\\"button\\" aria-pressed=\\"" + (talkOn ? "true" : "false") + "\\">Talk</button>" +
      "<button type=\\"button\\" aria-pressed=\\"" + (talkOn ? "false" : "true") + "\\">Type</button>" +
      (talkOn ? "<button type=\\"button\\">Pause</button><p>Listening... tap once to pause</p>" : "") +
      "</div>";
    if (talkOn) {
      html += draft ? "<p>" + draft + "</p>" : "";
    } else {
      html +=
        "<input placeholder=\\"Message the room\\" />" +
        "<button type=\\"button\\">Send</button>" +
        "<div id=\\"thread\\"></div>";
    }
    if (lookOpen) {
      html +=
        "<div>" +
        "<h2>Look</h2>" +
        "<button type=\\"button\\">Close</button>" +
        "<textarea aria-label=\\"Note\\"></textarea>" +
        "<button type=\\"button\\">File</button>" +
        "</div>";
    }
    root.innerHTML = html;
    byName("Talk").addEventListener("click", function () {
      logSubmode = "talk";
      paint();
      startTalkEar();
    });
    byName("Type").addEventListener("click", function () {
      logSubmode = "type";
      paint();
    });
    byName("Look").addEventListener("click", function () {
      lookOpen = true;
      paint();
    });
    if (lookOpen) {
      byName("Close").addEventListener("click", function () {
        lookOpen = false;
        paint();
      });
      byName("File").addEventListener("click", function () {
        var sid = sessionId();
        var note = (root.querySelector("textarea") || {}).value || "";
        fetch("/api/session/" + sid + "/look", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ note: note, turnIds: [] }),
        }).then(function () {
          lookOpen = false;
          paint();
        });
      });
    }
    if (!talkOn) {
      var input = root.querySelector("input");
      byName("Send").addEventListener("click", function () {
        var text = input.value || "";
        var sid = sessionId();
        fetch("/api/session/" + sid + "/send", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text: text }),
        }).then(function (res) { return res.json(); }).then(function (data) {
          var thread = document.getElementById("thread");
          var turns = (data && data.turns) || [];
          thread.textContent = turns.map(function (t) { return t.text; }).join(" ");
        });
      });
    }
  }
  paint();
})();
</script>
</body>
</html>
`;

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

function addPair(session: Session, text: string): void {
  const next = session.turns.length + 1;
  session.turns.push({
    text,
    role: "user",
    kind: "user",
    seatKey: "travis",
    speakable: true,
    seq: next,
  });
  session.turns.push({
    text: "Noted on the tape.",
    role: "assistant",
    kind: "agent_post",
    seatKey: "travis",
    speakable: true,
    seq: next + 1,
  });
}

export async function startPreflightFace(): Promise<{
  url: string;
  close: () => Promise<void>;
}> {
  const sessions = new Map<string, Session>();
  let n = 0;

  const server: Server = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    const method = req.method ?? "GET";

    if (method === "GET" && url.pathname === "/") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(FACE_HTML);
      return;
    }

    if (method === "POST" && url.pathname === "/api/session") {
      n += 1;
      const id = `preflight-${n}`;
      sessions.set(id, { id, status: "live", turns: [] });
      json(res, 200, {
        session: { id, viewMode: "voice", logSubmode: "talk", seats: [] },
      });
      return;
    }

    if (method === "GET" && url.pathname === "/api/session") {
      const id = url.searchParams.get("id") ?? "";
      const session = sessions.get(id);
      if (!session) {
        json(res, 404, { error: "missing session" });
        return;
      }
      json(res, 200, { session: { id: session.id, seats: [] } });
      return;
    }

    const sessionMatch = url.pathname.match(/^\/api\/session\/([^/]+)(?:\/([^/]+))?$/);
    if (sessionMatch) {
      const id = sessionMatch[1] ?? "";
      const tail = sessionMatch[2] ?? "";
      const session = sessions.get(id);
      if (!session) {
        json(res, 404, { error: "missing session" });
        return;
      }

      if (method === "PATCH" && !tail) {
        const raw = await readBody(req);
        const body = raw ? (JSON.parse(raw) as { status?: string }) : {};
        if (body.status === "ended") session.status = "ended";
        json(res, 200, { session: { id: session.id, status: session.status } });
        return;
      }

      if (method === "POST" && tail === "address") {
        json(res, 200, {
          destTravis: true,
          activeLabel: "Travis",
          activeSeatKey: "travis",
        });
        return;
      }

      if (method === "GET" && tail === "turns") {
        json(res, 200, { turns: session.turns, streams: { live: [], cards: [] } });
        return;
      }

      if (method === "GET" && tail === "queue") {
        json(res, 200, { queue: [], drainable: [], running: [] });
        return;
      }

      if (method === "POST" && tail === "look") {
        json(res, 200, { ok: true, filed: false, reason: "walk" });
        return;
      }

      if (method === "POST" && (tail === "send" || tail === "finalize")) {
        const raw = await readBody(req);
        const body = raw ? (JSON.parse(raw) as { text?: string }) : {};
        addPair(session, String(body.text ?? ""));
        json(res, 200, { turns: session.turns, streams: { live: [], cards: [] } });
        return;
      }
    }

    json(res, 404, { error: `no door ${method} ${url.pathname}` });
  });

  await new Promise<void>((resolve, reject) => {
    server.listen(0, "127.0.0.1", () => resolve());
    server.on("error", reject);
  });
  const addr = server.address();
  if (!addr || typeof addr === "string") {
    throw new Error("preflight face had no port");
  }
  return {
    url: `http://127.0.0.1:${addr.port}`,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}
