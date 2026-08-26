import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

// Load .env.local when drizzle-kit runs outside Next
config({ path: join(dirname(fileURLToPath(import.meta.url)), "../.env.local") });
config({ path: join(dirname(fileURLToPath(import.meta.url)), "../.env") });

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
