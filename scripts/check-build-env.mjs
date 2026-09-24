// Runs automatically before `next build` (npm "prebuild") and fails early with clear instructions.
import fs from "node:fs";

if (fs.existsSync(".env")) process.loadEnvFile(".env");

const inCloudflareCI = Boolean(process.env.WORKERS_CI || process.env.CF_PAGES);
const errors = [];
const warnings = [];

if (process.env.CF_PAGES) {
  errors.push(
    "This project must be deployed as a Cloudflare *Worker*, not a Pages project.\n" +
      "  Create it under Workers & Pages → Create → Workers → Import a repository.",
  );
}

if (!process.env.DATABASE_URL) {
  errors.push(
    "DATABASE_URL is missing at build time (public pages are pre-rendered from the database).\n" +
      (inCloudflareCI
        ? "  Cloudflare dashboard → your Worker → Settings → Build → Variables and secrets → add DATABASE_URL (type: Secret).\n" +
          "  Build variables are separate from the Worker's runtime secrets — it must be set in both places."
        : "  Add DATABASE_URL to your .env file."),
  );
}

for (const key of ["NEXT_PUBLIC_WHATSAPP_NUMBER", "NEXT_PUBLIC_TURNSTILE_SITE_KEY", "NEXT_PUBLIC_CLARITY_PROJECT_ID"]) {
  if (!process.env[key]) warnings.push(`${key} is not set — it is baked in at build time (add it as a build variable).`);
}

if (inCloudflareCI) {
  const wrangler = fs.readFileSync("wrangler.jsonc", "utf8");
  if (wrangler.includes("REPLACE_WITH_")) {
    errors.push(
      "wrangler.jsonc still has placeholder KV / D1 ids.\n" +
        "  Create them once (dashboard → Storage & Databases, or `npx wrangler kv namespace create NEXT_INC_CACHE_KV`\n" +
        "  and `npx wrangler d1 create dep360-tag-cache`), paste the ids into wrangler.jsonc and push.",
    );
  }
}

for (const w of warnings) console.warn(`⚠  ${w}`);
if (errors.length) {
  console.error("\n✗ Build cannot continue:\n");
  for (const e of errors) console.error(`• ${e}\n`);
  console.error("Full guide: DEVELOPER_INSTRUCTIONS.md → section 10 (Deploy to Cloudflare).\n");
  process.exit(1);
}
console.log("✓ Build environment OK");
