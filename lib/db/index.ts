import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type Database = NeonHttpDatabase<typeof schema>;

let cached: { url: string; db: Database } | undefined;

// Lazy: on Cloudflare, process.env is only populated inside a request.
export function getDb(): Database {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set (add it to .env locally, or as a Cloudflare build variable and runtime secret).");
  if (cached?.url !== url) cached = { url, db: drizzle(neon(url), { schema }) };
  return cached.db;
}

export { schema };
