/**
 * Hotfix 038 — condense a seat reply on the cheap text model, server-side.
 *
 * The point is cost: a 40k-character Engineer post is read here and only the
 * gist crosses into Travis. Asking for a summary is cheaper than asking to
 * hear the thing. Reads the key directly rather than importing it, so this
 * stays clear of the travis-openai ↔ travis-tools cycle.
 */

import { openaiErrorMessage, responsesText } from "@/lib/travis-openai";
import { TRAVIS_TEXT_MODEL } from "@/lib/travis-models";

const SUMMARY_SYSTEM =
  "Condense this agent reply for someone listening on a phone. Lead with the outcome. Plain sentences, no headings, no lists, no code. Three sentences at most.";

export async function summarizeSeatReply(text: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY?.trim() ?? "";
  if (!key) return "";
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: TRAVIS_TEXT_MODEL,
      instructions: SUMMARY_SYSTEM,
      input: text,
      reasoning: { effort: "low" },
    }),
  });
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(openaiErrorMessage(data, res.status));
  return responsesText(data as Parameters<typeof responsesText>[0]).trim();
}
