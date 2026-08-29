/**
 * Voice commands for the read — Travis as mouth, not a Cursor send.
 * Whole-utterance only so "stop the engineer from…" does not steal.
 */

export type ReadFacilitator = "stop" | "replay" | "simplify";

const PREFIX = "^(?:(?:hey|hi|hello|okay|ok|yo)\\s+travis[,.]?\\s+)?";

const STOP = new RegExp(`${PREFIX}(stop|wait|hold on)\\s*[.!?]*$`, "i");
const REPLAY = new RegExp(
  `${PREFIX}(say that again|say it again|repeat that|repeat)\\s*[.!?]*$`,
  "i",
);
const SIMPLIFY = new RegExp(
  `${PREFIX}(simplify(?: that| this| (?:what )?(?:you(?:'re| are)|it(?:'s| is)|they(?:'re| are))? ?(?:saying)?)?|say that simpler|please simplify)\\s*[.!?]*$`,
  "i",
);

export function parseReadFacilitator(
  utterance: string,
): ReadFacilitator | null {
  const t = utterance.trim();
  if (!t) return null;
  if (STOP.test(t)) return "stop";
  if (REPLAY.test(t)) return "replay";
  if (SIMPLIFY.test(t)) return "simplify";
  return null;
}
