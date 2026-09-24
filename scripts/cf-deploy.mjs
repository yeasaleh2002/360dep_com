// Deploys to Cloudflare. On the first run it creates the free KV namespace (page cache) and
// D1 database (cache tags); later runs find and reuse them. No ids need to be pasted anywhere.
// Usage (after `npm run build`): npm run deploy
import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";

const CONFIG = "wrangler.jsonc";
const KV_TITLE = "dep360-page-cache";
const D1_NAME = "dep360-tag-cache";

function wrangler(args) {
  try {
    return execSync(`npx wrangler ${args}`, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    const out = `${error.stdout ?? ""}\n${error.stderr ?? ""}`;
    if (/not authenticated|login|CLOUDFLARE_API_TOKEN/i.test(out)) {
      console.error("✗ Not signed in to Cloudflare. Locally run `npx wrangler login`; in Workers Builds this is automatic.");
    } else {
      console.error(out.trim());
    }
    process.exit(1);
  }
}

function parseJson(text) {
  const start = text.search(/[[{]/);
  return JSON.parse(text.slice(start));
}

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

if (!fs.existsSync(".open-next/worker.js")) {
  console.error("✗ No build found. Run `npm run build` first.");
  process.exit(1);
}

let config = fs.readFileSync(CONFIG, "utf8");
const kvId = ensureKv();
const d1Id = ensureD1();
config = config
  .replace(/("binding":\s*"NEXT_INC_CACHE_KV")(?:,\s*"id":\s*"[^"]*")?/, `$1, "id": "${kvId}"`)
  .replace(/("database_name":\s*"dep360-tag-cache")(?:,\s*"database_id":\s*"[^"]*")?/, `$1, "database_id": "${d1Id}"`);
fs.writeFileSync(CONFIG, config);
console.log(`✓ Cache storage ready (KV ${kvId.slice(0, 8)}…, D1 ${d1Id.slice(0, 8)}…)`);

const result = spawnSync("npx opennextjs-cloudflare deploy", { stdio: "inherit", shell: true });
process.exit(result.status ?? 1);
