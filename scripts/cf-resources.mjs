// Makes sure the free KV namespace (page cache) and D1 database (cache tags) exist, and writes
// their ids into wrangler.jsonc. Creates them on the first run, reuses them afterwards.
// Runs automatically after `npm run build` in Cloudflare Workers Builds and before `npm run deploy`.
import { execSync } from "node:child_process";
import fs from "node:fs";
import { pathToFileURL } from "node:url";

const CONFIG = "wrangler.jsonc";
const KV_TITLE = "dep360-page-cache";
const D1_NAME = "dep360-tag-cache";

class AuthError extends Error {}

function wrangler(args) {
  try {
    return execSync(`npx wrangler ${args}`, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    const out = `${error.stdout ?? ""}\n${error.stderr ?? ""}`.trim();
    if (/not authenticated|wrangler login|CLOUDFLARE_API_TOKEN/i.test(out)) throw new AuthError(out);
    throw new Error(out);
  }
}

const parseJson = (text) => JSON.parse(text.slice(text.search(/[[{]/)));

function ensureKv() {
  const find = () => parseJson(wrangler("kv namespace list")).find((ns) => ns.title === KV_TITLE);
  let ns = find();
  if (!ns) {
    console.log(`Creating KV namespace "${KV_TITLE}"…`);
    wrangler(`kv namespace create ${KV_TITLE}`);
    ns = find();
  }
  if (!ns) throw new Error(`KV namespace "${KV_TITLE}" could not be created`);
  return ns.id;
}

function ensureD1() {
  const find = () => parseJson(wrangler("d1 list --json")).find((db) => db.name === D1_NAME);
  let db = find();
  if (!db) {
    console.log(`Creating D1 database "${D1_NAME}"…`);
    wrangler(`d1 create ${D1_NAME}`);
    db = find();
  }
  if (!db) throw new Error(`D1 database "${D1_NAME}" could not be created`);
  return db.uuid;
}

export function ensureCloudflareResources() {
  const kvId = ensureKv();
  const d1Id = ensureD1();
  const config = fs
    .readFileSync(CONFIG, "utf8")
    .replace(/("binding":\s*"NEXT_INC_CACHE_KV")(?:,\s*"id":\s*"[^"]*")?/, `$1, "id": "${kvId}"`)
    .replace(/("database_name":\s*"dep360-tag-cache")(?:,\s*"database_id":\s*"[^"]*")?/, `$1, "database_id": "${d1Id}"`);
  fs.writeFileSync(CONFIG, config);
  console.log(`✓ Cloudflare cache storage ready (KV ${kvId.slice(0, 8)}…, D1 ${d1Id.slice(0, 8)}…)`);
}

// CLI: `node scripts/cf-resources.mjs --ci-only` does nothing outside Cloudflare's build servers,
// so a local `npm run build` never needs a Cloudflare login.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes("--ci-only") && !process.env.WORKERS_CI) process.exit(0);
  try {
    ensureCloudflareResources();
  } catch (error) {
    if (error instanceof AuthError) {
      console.error("✗ Not signed in to Cloudflare. Locally run `npx wrangler login`; in Workers Builds this is automatic.");
    } else {
      console.error("✗ Could not set up the KV / D1 cache storage:\n" + error.message);
      console.error(
        "  If this says the API token lacks permission: Worker → Settings → Build → API token → make sure it has\n" +
          "  \"Workers KV Storage: Edit\" and \"D1: Edit\".",
      );
    }
    process.exit(1);
  }
}
