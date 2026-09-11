/**
 * The tape after a use. Door headers are not the app.
 * Do not grade reply quality. Fail a generate miss / run error.
 */

export type TapeTurn = {
  text: string;
  role: string;
  kind: string;
  seatKey: string | null;
  speakable: boolean;
  seq: number;
};

export function isRunErrorTurn(turn: TapeTurn): boolean {
  if (turn.kind !== "status") return false;
  return /error/i.test(turn.text);
}

export function isNamedUnwired(turn: TapeTurn): boolean {
  return turn.kind === "status" && /isn.t wired/i.test(turn.text);
}

export function travisSpoke(turns: TapeTurn[]): boolean {
  return turns.some(
    (t) =>
      t.kind === "agent_post" &&
      t.seatKey === "travis" &&
      t.speakable &&
      t.text.trim().length > 0,
  );
}

export function appWorkedReason(turns: TapeTurn[]): string | null {
  const miss = turns.filter(isRunErrorTurn);
  if (miss.length) {
    return `run error on tape: ${miss.map((t) => t.text || "(empty status)").join(" | ")}`;
  }
  if (turns.some(isNamedUnwired)) return null;
  if (!travisSpoke(turns)) {
    return "Travis did not speak (no speakable travis agent_post)";
  }
  return null;
}

export function assertAppWorked(turns: TapeTurn[], label: string): void {
  const reason = appWorkedReason(turns);
  if (reason) {
    throw new Error(`${label}: ${reason}`);
  }
}
