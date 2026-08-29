import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@cursor/sdk", "@google/genai"],
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
