/**
 * SCP-006 — Gemini Live token + text reply. Model id pinned in runtime.
 * Key stays server-side.
 */

import { TRAVIS_LIVE_MODEL, TRAVIS_TEXT_MODEL } from "@/lib/travis-models";
import {
  TRAVIS_SYSTEM,
  TRAVIS_TOOL_DECLS,
  runTravisTool,
} from "@/server/travis-tools";

export { TRAVIS_LIVE_MODEL, TRAVIS_TEXT_MODEL };

export function geminiKey(): string {
  return process.env.GEMINI_API_KEY?.trim() ?? "";
}

export function travisIsWired(): boolean {
  return Boolean(geminiKey());
}

export async function mintLiveToken(): Promise<{
  token: string;
  model: string;
} | null> {
  const key = geminiKey();
  if (!key) return null;
  const { GoogleGenAI } = await import("@google/genai");
  const client = new GoogleGenAI({
    apiKey: key,
    httpOptions: { apiVersion: "v1alpha" },
  });
  const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const token = await client.authTokens.create({
    config: {
      uses: 1,
      expireTime,
      newSessionExpireTime: new Date(Date.now() + 60 * 1000).toISOString(),
      httpOptions: { apiVersion: "v1alpha" },
    },
  });
  const name = (token as { name?: string }).name;
  if (!name) return null;
  return { token: name, model: TRAVIS_LIVE_MODEL };
}

export async function generateTravisText(params: {
  sessionId: string;
  prompt: string;
}): Promise<string> {
  const key = geminiKey();
  if (!key) return "";
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: key });
  const functionDecls = TRAVIS_TOOL_DECLS.map((t) => ({
    name: t.name,
    description: t.description,
    parametersJsonSchema: t.parameters,
  }));

  let contents: Array<{ role: string; parts: unknown[] }> = [
    { role: "user", parts: [{ text: params.prompt }] },
  ];

  for (let i = 0; i < 6; i++) {
    const res = await ai.models.generateContent({
      model: TRAVIS_TEXT_MODEL,
      contents: contents as never,
      config: {
        systemInstruction: TRAVIS_SYSTEM,
        tools: [{ functionDeclarations: functionDecls }],
      },
    });
    const fnCalls = (
      res as {
        functionCalls?: Array<{
          name?: string;
          args?: Record<string, unknown>;
        }>;
      }
    ).functionCalls;
    const text = String((res as { text?: string }).text ?? "").trim();
    if (fnCalls?.length) {
      const toolParts: unknown[] = [];
      for (const call of fnCalls) {
        const name = call.name ?? "";
        const result = await runTravisTool({
          sessionId: params.sessionId,
          name,
          args: call.args ?? {},
        });
        toolParts.push({
          functionResponse: {
            name,
            response: { result: result.text },
          },
        });
      }
      contents = [
        ...contents,
        { role: "model", parts: fnCalls.map((c) => ({ functionCall: c })) },
        { role: "user", parts: toolParts },
      ];
      continue;
    }
    return text;
  }
  return "";
}
