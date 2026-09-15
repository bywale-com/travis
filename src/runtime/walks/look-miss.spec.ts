import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { failUse } from "../app-worked";
import { doorFetch, openFreshRoom, readTurns, runtimeBaseUrl } from "../desk";
import { send } from "../doors";

const haveUrl = Boolean(runtimeBaseUrl());
const NOTE = "Mouth never came back.";

describe("look-miss", { skip: !haveUrl }, () => {
  it("File on Log is 2xx and does not write an initiative", async () => {
    const desk = await openFreshRoom();
    const line = "Look walk line on the tape.";
    const sent = await send(desk, line, { chipSeatKeys: ["travis"] });
    const turns = await readTurns(desk);
    if (
      !(
        sent.status >= 200 &&
        sent.status < 500 &&
        (sent.kind === "sse" || sent.kind === "json")
      )
    ) {
      failUse("look-miss", `send was ${sent.kind} ${sent.status}`, turns, sent);
    }
    const user = turns.find(
      (row) => row.role === "user" && row.text.includes(line) && row.id,
    );
    if (!user?.id) {
      failUse("look-miss", "typed line never landed with an id", turns, sent);
    }

    const filed = await doorFetch(`/api/session/${desk.sessionId}/look`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ note: NOTE, turnIds: [user.id] }),
    });
    if (filed.kind !== "json" || filed.res.status < 200 || filed.res.status >= 300) {
      failUse(
        "look-miss",
        `look was ${filed.kind} ${filed.res.status} ${filed.bodyText.slice(0, 180)}`,
        turns,
      );
    }
    const body = JSON.parse(filed.bodyText) as {
      ok?: boolean;
      filed?: boolean;
      reason?: string;
    };
    assert.equal(body.ok, true);

    const pile = await doorFetch(
      `/api/session/${desk.sessionId}/initiatives?view=all&status=all`,
    );
    if (pile.kind !== "json" || !pile.res.ok) {
      failUse(
        "look-miss",
        `initiatives ${pile.kind} ${pile.res.status}`,
        turns,
      );
    }
    const data = JSON.parse(pile.bodyText) as {
      items?: {
        kind?: string;
        title?: string;
        foundingText?: string;
        foundingTurnId?: string | null;
      }[];
      initiatives?: {
        title?: string;
        foundingText?: string;
        foundingTurnId?: string | null;
      }[];
    };
    const rows = [...(data.items ?? []), ...(data.initiatives ?? [])];
    const leaked = rows.some((row) => {
      const title = String(row.title ?? "");
      const founding = String(row.foundingText ?? "");
      return (
        row.foundingTurnId === user.id ||
        title.includes(NOTE) ||
        title.includes(line) ||
        founding.includes(NOTE) ||
        founding.includes(line)
      );
    });
    if (leaked) {
      failUse("look-miss", "File wrote an initiative", turns);
    }
    assert.ok(true);
  });
});
