/**
 * SCP-030 — Deep Agents hang on Type. Dest seats stay Cursor.
 * StateBackend only. Default task / execute omitted.
 */

import {
  createDeepAgent,
  registerHarnessProfile,
  StateBackend,
} from "deepagents/node";
import { ChatOpenAI } from "@langchain/openai";
import {
  isAIMessage,
  isHumanMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import { createMiddleware, tool } from "langchain";
import { TRAVIS_TEXT_MODEL } from "@/lib/travis-models";
import { isDestWithContextAsk } from "@/lib/dest-with-context";
import {
  TRAVIS_SYSTEM,
  TRAVIS_TOOL_DECLS,
  runTravisTool,
} from "@/server/travis-tools";
import { unclippedPrintFor } from "@/server/dest-with-context";

registerHarnessProfile("openai", {
  excludedTools: ["task", "execute"],
  generalPurposeSubagent: { enabled: false },
});
registerHarnessProfile(`openai:${TRAVIS_TEXT_MODEL}`, {
  excludedTools: ["task", "execute"],
  generalPurposeSubagent: { enabled: false },
});

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

function lastUserText(messages: BaseMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (isHumanMessage(messages[i])) return contentToText(messages[i].content);
  }
  return "";
}

function lastAssistantText(messages: unknown[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m && typeof m === "object" && isAIMessage(m as BaseMessage)) {
      return contentToText((m as BaseMessage).content);
    }
  }
  return "";
}

function wrapTravisTools(sessionId: string) {
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

const destWithContextMiddleware = createMiddleware({
  name: "dest-with-context",
  wrapModelCall: async (request, handler) => {
    void isDestWithContextAsk(lastUserText(request.messages));
    return handler(request);
  },
});

function travisChatModel() {
  return new ChatOpenAI({
    model: TRAVIS_TEXT_MODEL,
    apiKey: process.env.OPENAI_API_KEY?.trim() ?? "",
    useResponsesApi: true,
    reasoning: { effort: "low" },
  });
}

function printFile(print: string) {
  const now = new Date().toISOString();
  return {
    "/print.md": {
      content: print,
      mimeType: "text/plain" as const,
      created_at: now,
      modified_at: now,
    },
  };
}

export async function invokeDeepAgent(params: {
  sessionId: string;
  prompt: string;
  room: string;
}): Promise<string> {
  const print = await unclippedPrintFor(params.sessionId).catch(() => "");
  const input = params.room
    ? `${params.room}\n\n${params.prompt}`
    : params.prompt;
  const agent = createDeepAgent({
    model: travisChatModel(),
    systemPrompt: TRAVIS_SYSTEM,
    tools: wrapTravisTools(params.sessionId),
    backend: new StateBackend(),
    middleware: [destWithContextMiddleware],
    subagents: [],
  });
  const result = await agent.invoke({
    messages: [{ role: "user", content: input }],
    files: printFile(print),
  });
  const messages = (result as { messages?: unknown[] }).messages ?? [];
  return lastAssistantText(messages);
}
