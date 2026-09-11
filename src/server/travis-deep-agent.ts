/**
 * SCP-031 — Deep Agents hang on Type. Dest seats stay Cursor.
 * StateBackend /print.md + /roster.md. wrapModelCall hangs files, not the request.
 * SCP-034 — official checkpointer + thread_id = voice_session.id.
 * 080 hang: require() CJS entrypoints at runtime — webpack import() on mixed packages
 * picked ESM .js on Vercel and threw "Cannot use import statement outside a module".
 */

import { createRequire } from "node:module";
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

const require = createRequire(import.meta.url);

type Kit = {
  createDeepAgent: typeof import("deepagents/node").createDeepAgent;
  registerHarnessProfile: typeof import("deepagents/node").registerHarnessProfile;
  StateBackend: typeof import("deepagents/node").StateBackend;
  ChatOpenAI: typeof import("@langchain/openai").ChatOpenAI;
  isAIMessage: typeof import("@langchain/core/messages").isAIMessage;
  createMiddleware: typeof import("langchain").createMiddleware;
  tool: typeof import("langchain").tool;
};

let kit: Kit | null = null;
let profilesRegistered = false;

function loadKit(): Kit {
  if (!kit) {
    const deepagents = require("deepagents/node") as typeof import("deepagents/node");
    const openai = require("@langchain/openai") as typeof import("@langchain/openai");
    const messages = require("@langchain/core/messages") as typeof import("@langchain/core/messages");
    const langchain = require("langchain") as typeof import("langchain");
    kit = {
      createDeepAgent: deepagents.createDeepAgent,
      registerHarnessProfile: deepagents.registerHarnessProfile,
      StateBackend: deepagents.StateBackend,
      ChatOpenAI: openai.ChatOpenAI,
      isAIMessage: messages.isAIMessage,
      createMiddleware: langchain.createMiddleware,
      tool: langchain.tool,
    };
  }
  if (!profilesRegistered) {
    kit.registerHarnessProfile("openai", {
      excludedTools: ["task", "execute"],
      generalPurposeSubagent: { enabled: false },
    });
    kit.registerHarnessProfile(`openai:${TRAVIS_TEXT_MODEL}`, {
      excludedTools: ["task", "execute"],
      generalPurposeSubagent: { enabled: false },
    });
    profilesRegistered = true;
  }
  return kit;
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
    if (
      m &&
      typeof m === "object" &&
      isAIMessage(m as Parameters<Kit["isAIMessage"]>[0])
    ) {
      return contentToText((m as { content: unknown }).content);
    }
  }
  return "";
}

function wrapTravisTools(sessionId: string, toolFn: Kit["tool"]) {
  return TRAVIS_TOOL_DECLS.map((decl) =>
    toolFn(
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

export type DeepAgentMode = "update" | "synthesize";

export async function invokeDeepAgent(params: {
  sessionId: string;
  prompt: string;
  room: string;
  mode?: DeepAgentMode;
}): Promise<string> {
  const {
    createDeepAgent,
    StateBackend,
    ChatOpenAI,
    isAIMessage,
    createMiddleware,
    tool: toolFn,
  } = loadKit();

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
  const agent = createDeepAgent({
    model: new ChatOpenAI({
      model: TRAVIS_TEXT_MODEL,
      apiKey: process.env.OPENAI_API_KEY?.trim() ?? "",
      useResponsesApi: true,
      reasoning: { effort: "low" },
    }),
    systemPrompt: TRAVIS_SYSTEM,
    tools: wrapTravisTools(params.sessionId, toolFn),
    backend: new StateBackend(),
    checkpointer,
    middleware: [destKitMiddleware(params.sessionId, createMiddleware)],
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
  return lastAssistantText(messages, isAIMessage);
}
