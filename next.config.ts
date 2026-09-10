import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@cursor/sdk",
    "deepagents",
    "deepagents/node",
    "langchain",
    "@langchain/core",
    "@langchain/langgraph",
    "@langchain/openai",
    "@langchain/langgraph-checkpoint",
    "@langchain/langgraph-checkpoint-postgres",
    "pg",
    "langsmith",
    "openai",
  ],
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
