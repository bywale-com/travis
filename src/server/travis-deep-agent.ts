/**
 * SCP-031 — Deep Agents hang on Type. Dest seats stay Cursor.
 * StateBackend /print.md + /roster.md. wrapModelCall hangs files, not the request.
 * SCP-034 — official checkpointer + thread_id = voice_session.id.
 * 080 recut — Vercel require() of ESM threw "Cannot use import statement
 * outside a module". Load the CJS builds via createRequire.
 */

import { createRequire } from "node:module";
import { join } from "node:path";
import type { BaseMessage } from "@langchain/core/messages";
import { formatRosterFact } from "@/lib/dest-with-context";
import { TRAVIS_TEXT_MODEL } from "@/lib/travis-models";
import {
  TRAVIS_SYSTEM,
  TRAVIS_TOOL_DECLS,
  runTravisTool,
} from "@/server/travis-tools";
import { travisCheckpointer } from "@/server/travis-checkpointer";
import {
  rosterFactFor,
  unclippedPrintFor,
} from "@/server/dest-with-context";

type DeepAgentsNode = typeof import("deepagents/node");
type LangChain = typeof import("langchain");
type LangChainOpenAI = typeof import("@langchain/openai");
type LangChainCoreMessages = typeof import("@langchain/core/messages");

type Kit = {
  createDeepAgent: DeepAgentsNode["createDeepAgent"];
  registerHarnessProfile: DeepAgentsNode["registerHarnessProfile"];
  StateBackend: DeepAgentsNode["StateBackend"];
  ChatOpenAI: LangChainOpenAI["ChatOpenAI"];
  isAIMessage: LangChainCoreMessages["isAIMessage"];
  createMiddleware: LangChain["createMiddleware"];
  tool: LangChain["tool"];
};

function kitRequire() {
  return createRequire(join(process.cwd(), "package.json"));
}

let kitReady: Promise<Kit> | null = null;

function loadKit(): Promise<Kit> {
  if (!kitReady) {
    kitReady = Promise.resolve().then(() => {
      const req = kitRequire();
      const da = req("deepagents/node") as DeepAgentsNode;
      const lc = req("langchain") as LangChain;
      const openai = req("@langchain/openai") as LangChainOpenAI;
      const core = req("@langchain/core/messages") as LangChainCoreMessages;
      da.registerHarnessProfile("openai", {
        excludedTools: ["task", "execute"],
        generalPurposeSubagent: { enabled: false },
      });
      da.registerHarnessProfile(`openai:${TRAVIS_TEXT_MODEL}`, {
        excludedTools: ["task", "execute"],
        generalPurposeSubagent: { enabled: false },
      });
      return {
        createDeepAgent: da.createDeepAgent,
        registerHarnessProfile: da.registerHarnessProfile,
        StateBackend: da.StateBackend,
        ChatOpenAI: openai.ChatOpenAI,
        isAIMessage: core.isAIMessage,
        createMiddleware: lc.createMiddleware,
        tool: lc.tool,
      };
    });
  }
  return kitReady;
}

function asArgs(input: unknown): Record<string, unknown> {
  if (input && typeof input === "object" && !Array.isArray(input)) {
    return input as Record<string, unknown>;
  }
  return {};
}

function contentToText(content: unknown): string {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";
  return content
    .map((block) => {
      if (typeof block === "string") return block;
      if (block && typeof block === "object" && "text" in block) {
        return String((block as { text?: unknown }).text ?? "");
      }
      return "";
    })
    .join("")
    .trim();
}

function lastAssistantText(
  messages: unknown[],
  isAIMessage: Kit["isAIMessage"],
): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m && typeof m === "object" && isAIMessage(m as BaseMessage)) {
      return contentToText((m as BaseMessage).content);
    }
  }
  return "";
}

function wrapTravisTools(sessionId: string, tool: Kit["tool"]) {
  return TRAVIS_TOOL_DECLS.map((decl) =>
    tool(
      async (input: unknown) => {
        const result = await runTravisTool({
          sessionId,
          name: decl.name,
          args: asArgs(input),
        });
        return result.text;
      },
      {
        name: decl.name,
        description: decl.description,
        schema: {
          ...decl.parameters,
          type: "object" as const,
        },
      },
    ),
  );
}

function kitFiles(print: string, roster: string) {
  const now = new Date().toISOString();
  const file = (content: string) => ({
    content,
    mimeType: "text/plain" as const,
    created_at: now,
    modified_at: now,
  });
  return {
    "/print.md": file(print),
    "/roster.md": file(roster),
  };
}

function destKitMiddleware(
  sessionId: string,
  createMiddleware: Kit["createMiddleware"],
) {
  return createMiddleware({
    name: "dest-with-context",
    wrapModelCall: async (request, handler) => {
      const print = await unclippedPrintFor(sessionId).catch(() => "");
      const roster = await rosterFactFor(sessionId).catch(() =>
        formatRosterFact(""),
      );
      const files = kitFiles(print, roster);
      const state = request.state as { files?: Record<string, unknown> };
      state.files = { ...(state.files ?? {}), ...files };
      return handler(request);
    },
  });
}

function travisChatModel(ChatOpenAI: Kit["ChatOpenAI"]) {
  return new ChatOpenAI({
    model: TRAVIS_TEXT_MODEL,
    apiKey: process.env.OPENAI_API_KEY?.trim() ?? "",
    useResponsesApi: true,
    reasoning: { effort: "low" },
  });
}

export type DeepAgentMode = "update" | "synthesize";

export async function invokeDeepAgent(params: {
  sessionId: string;
  prompt: string;
  room: string;
  mode?: DeepAgentMode;
}): Promise<string> {
  const kit = await loadKit();
  const mode = params.mode ?? "synthesize";
  const prompt =
    mode === "update"
      ? `${params.prompt}\n\nThis is an in-flight update on this room thread. Do the work. Do not speak a wrap.`
      : params.prompt;
  const print = await unclippedPrintFor(params.sessionId).catch(() => "");
  const roster = await rosterFactFor(params.sessionId).catch(() =>
    formatRosterFact(""),
  );
  const input = params.room
    ? `${params.room}\n\n${prompt}`
    : prompt;
  const checkpointer = await travisCheckpointer();
  const agent = kit.createDeepAgent({
    model: travisChatModel(kit.ChatOpenAI),
    systemPrompt: TRAVIS_SYSTEM,
    tools: wrapTravisTools(params.sessionId, kit.tool),
    backend: new kit.StateBackend(),
    checkpointer,
    middleware: [destKitMiddleware(params.sessionId, kit.createMiddleware)],
    subagents: [],
  });
  const result = await agent.invoke(
    {
      messages: [{ role: "user", content: input }],
      files: kitFiles(print, roster),
    },
    { configurable: { thread_id: params.sessionId } },
  );
  const messages = (result as { messages?: unknown[] }).messages ?? [];
  return lastAssistantText(messages, kit.isAIMessage);
}
