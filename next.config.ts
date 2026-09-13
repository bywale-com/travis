import type { NextConfig } from "next";
import path from "path";

const KIT_EXTERNAL =
  /^(deepagents|langchain|@langchain\/|langsmith|openai|pg)(\/|$)/;

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
    "@langchain/langgraph-sdk",
    "pg",
    "langsmith",
    "openai",
  ],
  outputFileTracingRoot: path.join(__dirname),
  webpack: (config, { isServer }) => {
    if (isServer) {
      const forceCjs = (
        { request }: { request?: string },
        cb: (err?: Error | null, result?: string) => void,
      ) => {
        if (request && KIT_EXTERNAL.test(request)) {
          return cb(undefined, `commonjs ${request}`);
        }
        cb();
      };
      const prev = config.externals;
      config.externals = Array.isArray(prev)
        ? [...prev, forceCjs]
        : prev
          ? [prev, forceCjs]
          : [forceCjs];
    }
    return config;
  },
};

export default nextConfig;
