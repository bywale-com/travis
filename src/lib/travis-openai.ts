/**
 * Dest Travis provider helpers — OpenAI shapes only.
 * No keys. Phone never sees OPENAI_API_KEY.
 */

import { TRAVIS_LIVE_MODEL, TRAVIS_LIVE_VOICE } from "./travis-models";

export type ToolDecl = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

export function parseEphemeralSecret(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if (typeof o.value === "string" && o.value.trim()) return o.value.trim();
  const nested = o.client_secret;
  if (nested && typeof nested === "object") {
    const v = (nested as { value?: unknown }).value;
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

export function openaiErrorMessage(data: unknown, status: number): string {
  if (data && typeof data === "object") {
    const err = (data as { error?: { message?: string } }).error;
    if (err?.message?.trim()) return err.message.trim();
  }
  return `OpenAI ${status}`;
}

export function toRealtimeTools(decls: ToolDecl[]) {
  return decls.map((d) => ({
    type: "function" as const,
    name: d.name,
    description: d.description,
    parameters: d.parameters,
  }));
}

/** Live session.update must keep Here. System alone wipes the room. */
export function liveInstructions(system: string, here: string): string {
  const block = here.trim();
  return block ? `${system}\n\n${block}` : system;
}

export function realtimeSessionConfig(opts: {
  instructions: string;
  tools: ToolDecl[];
}) {
  return {
    type: "realtime" as const,
    model: TRAVIS_LIVE_MODEL,
    instructions: opts.instructions,
    output_modalities: ["audio"] as const,
    audio: {
      input: {
        transcription: { model: "gpt-4o-mini-transcribe" },
        turn_detection: { type: "semantic_vad" },
      },
      output: { voice: TRAVIS_LIVE_VOICE },
    },
    tools: toRealtimeTools(opts.tools),
    tool_choice: "auto" as const,
  };
}

export type RealtimeEvent = {
  type?: string;
  transcript?: string;
  delta?: string;
  error?: { message?: string };
  response?: {
    output?: Array<{
      type?: string;
      name?: string;
      call_id?: string;
      arguments?: string;
    }>;
  };
};

export type LiveAction =
  | { op: "user_delta"; text: string }
  | { op: "user_flush"; text?: string }
  | { op: "travis_delta"; text: string }
  | { op: "travis_flush" }
  | {
      op: "tools";
      calls: Array<{ name: string; callId: string; args: Record<string, unknown> }>;
    }
  | { op: "error"; message: string };

function parseArgs(raw: string | undefined): Record<string, unknown> {
  if (!raw?.trim()) return {};
  try {
    const v = JSON.parse(raw) as unknown;
    return v && typeof v === "object" && !Array.isArray(v)
      ? (v as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

/** Map a Realtime server event to log / tool work. */
export function interpretRealtimeEvent(ev: RealtimeEvent): LiveAction[] {
  const type = ev.type ?? "";
  if (type === "error") {
    return [{ op: "error", message: ev.error?.message ?? "Live error" }];
  }
  if (type === "conversation.item.input_audio_transcription.delta" && ev.delta) {
    return [{ op: "user_delta", text: ev.delta }];
  }
  if (type === "conversation.item.input_audio_transcription.completed") {
    const t = (ev.transcript ?? "").trim();
    return t ? [{ op: "user_flush", text: t }] : [{ op: "user_flush" }];
  }
  if (type === "response.output_audio_transcript.delta" && ev.delta) {
    return [{ op: "travis_delta", text: ev.delta }];
  }
  if (type === "response.output_audio_transcript.done") {
    return [{ op: "travis_flush" }];
  }
  if (type === "response.done") {
    const calls = (ev.response?.output ?? [])
      .filter((x) => x.type === "function_call" && x.name && x.call_id)
      .map((x) => ({
        name: String(x.name),
        callId: String(x.call_id),
        args: parseArgs(x.arguments),
      }));
    const actions: LiveAction[] = [{ op: "travis_flush" }];
    if (calls.length) actions.push({ op: "tools", calls });
    return actions;
  }
  return [];
}

export function responsesText(data: {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
}): string {
  if (data.output_text?.trim()) return data.output_text.trim();
  const parts: string[] = [];
  for (const item of data.output ?? []) {
    if (item.type !== "message") continue;
    for (const c of item.content ?? []) {
      if ((c.type === "output_text" || c.type === "text") && c.text) {
        parts.push(c.text);
      }
    }
  }
  return parts.join("").trim();
}
