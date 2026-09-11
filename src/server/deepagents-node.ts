/**
 * Vercel/Next bundles serverExternalPackages as import() — that resolves
 * deepagents/node to ESM and throws "Cannot use import statement outside a module".
 * createRequire loads dist/node.cjs (080 intent, enforced here).
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

type DeepAgentsNode = typeof import("deepagents/node");

let cached: DeepAgentsNode | null = null;

export function deepagentsNode(): DeepAgentsNode {
  if (!cached) {
    cached = require("deepagents/node") as DeepAgentsNode;
  }
  return cached;
}
