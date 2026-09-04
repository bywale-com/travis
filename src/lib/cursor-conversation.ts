/**
 * Cursor run.conversation() steps → dest-seat beats.
 * Do not join assistantMessage texts with blank lines — that re-glues L2.
 */

import { foldAssistantBeats } from "@/lib/beats";

export function textFromAssistantMessage(content: unknown): string {
  if (!Array.isArray(content)) return "";
  let out = "";
  for (const block of content) {
    if (
      block &&
      typeof block === "object" &&
      (block as { type?: string }).type === "text" &&
      typeof (block as { text?: string }).text === "string"
    ) {
      out += (block as { text: string }).text;
    }
  }
  return out;
}

export function assistantTextsFromConversation(turns: unknown): string[] {
  if (!Array.isArray(turns)) return [];
  const parts: string[] = [];
  for (const turn of turns) {
    const t = turn as {
      turn?: {
        steps?: Array<{
          type?: string;
          message?: { text?: string; content?: unknown };
        }>;
      };
    };
    for (const step of t.turn?.steps ?? []) {
      if (step.type !== "assistantMessage") continue;
      const msg = step.message;
      if (!msg) continue;
      if (typeof msg.text === "string" && msg.text.trim()) {
        parts.push(msg.text.trim());
        continue;
      }
      const fromBlocks = textFromAssistantMessage(msg.content);
      if (fromBlocks.trim()) parts.push(fromBlocks.trim());
    }
  }
  return parts;
}

export function assistantBeatsFromConversation(turns: unknown): string[] {
  return foldAssistantBeats(assistantTextsFromConversation(turns));
}
