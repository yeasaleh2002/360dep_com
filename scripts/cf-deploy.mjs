// Deploys the last `npm run build` to Cloudflare. Usage: npm run deploy
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { ensureCloudflareResources } from "./cf-resources.mjs";

if (!fs.existsSync(".open-next/worker.js")) {
  console.error("✗ No build found. Run `npm run build` first.");
  process.exit(1);
}

try {
  ensureCloudflareResources();
} catch (error) {
  console.error(
    /not authenticated|wrangler login|CLOUDFLARE_API_TOKEN/i.test(error.message)
      ? "✗ Not signed in to Cloudflare. Run `npx wrangler login` first."
      : `✗ Could not set up the KV / D1 cache storage:\n${error.message}`,
  );
  process.exit(1);
}

const result = spawnSync("npx opennextjs-cloudflare deploy", { stdio: "inherit", shell: true });
process.exit(result.status ?? 1);
