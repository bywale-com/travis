import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = PostgresJsDatabase<typeof schema>;

let connected: Db | null = null;

/**
 * Connect on first query, not on import. Throwing at module load meant the
 * route never ran, so Vercel answered with an empty 500 and the phone showed
 * "Unexpected end of JSON input" instead of the missing env var.
 */
function connect(): Db {
  if (connected) return connected;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set on this deployment — add it in the Vercel project environment.",
    );
  }
  connected = drizzle(postgres(url, { prepare: false, max: 5 }), { schema });
  return connected;
}

export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const real = connect() as unknown as Record<string | symbol, unknown>;
    const value = Reflect.get(real, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
