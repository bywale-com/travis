import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@cursor/sdk",
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
  webpack: (config, { isServer }) => {
    if (!isServer) return config;
    // 080/086 — Vercel webpack import() hits deepagents ESM; alias the CJS entry.
    const deepagentsRoot = path.dirname(
      require.resolve("deepagents/package.json"),
    );
    config.resolve.alias = {
      ...config.resolve.alias,
      "deepagents/node": path.join(deepagentsRoot, "dist/node.cjs"),
    };
    return config;
  },
};

export default nextConfig;
