import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile();
} catch {
  // no .env file — DATABASE_URL must come from the environment
}

// Only `drizzle-kit generate` is used (it never touches the database).
// Do NOT use `drizzle-kit push` here: the database is shared, and push would try to
// drop other apps' enums and sequences, which `tablesFilter` doesn't protect.
export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
  tablesFilter: ["360dep_*"],
});
