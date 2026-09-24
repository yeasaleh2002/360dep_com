/**
 * Scans the project for secrets that must never be committed (keys, passwords, DB URLs).
 * Run before every commit/deploy:  npm run check-secrets
 * Exits with code 1 if anything suspicious is found.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SKIP_DIRS = new Set(["node_modules", ".next", ".open-next", ".wrangler", ".git", "drizzle"]);
// Local-only secret files — allowed to contain secrets, and gitignored.
const SKIP_FILES = new Set([".env", ".dev.vars", ".env.local", "package-lock.json"]);
const EXTENSIONS = /\.(ts|tsx|js|mjs|mts|cjs|json|jsonc|md|css|html|txt|toml|yaml|yml|example)$|^\.env\.example$/;

const PATTERNS = [
  { name: "Postgres URL with password", re: /postgres(?:ql)?:\/\/[^:\s"'`]+:[^@\s"'`]+@/i },
  { name: "Neon password", re: /npg_[A-Za-z0-9]{8,}/ },
  { name: "ImgBB-style 32-hex API key", re: /(?<![A-Fa-f0-9])[a-f0-9]{32}(?![A-Fa-f0-9])/ },
  { name: "64-hex secret (JWT_SECRET?)", re: /(?<![A-Fa-f0-9])[a-f0-9]{64}(?![A-Fa-f0-9])/ },
  { name: "Password hash", re: /pbkdf2_sha256:\d+:[A-Za-z0-9_-]{16,}:[A-Za-z0-9_-]{30,}|\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}/ },
  { name: "Turnstile secret key", re: /0x4AAAAAA[A-Za-z0-9_-]{20,}/ },
  { name: "Private key block", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
];

// Known-safe values: Cloudflare's public Turnstile test keys and the login route's dummy hash.
const ALLOW = [/1x0000000000000000000000000000000AA/, /pbkdf2_sha256:25000:A{22}:A{43}/];

const findings = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name));
      continue;
    }
    if (SKIP_FILES.has(entry.name) || !EXTENSIONS.test(entry.name)) continue;
    const file = path.join(dir, entry.name);
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, i) => {
      if (ALLOW.some((re) => re.test(line))) return;
      for (const { name, re } of PATTERNS) {
        if (re.test(line)) findings.push(`${path.relative(ROOT, file)}:${i + 1}  ${name}`);
      }
    });
  }
}

walk(ROOT);

if (findings.length) {
  console.error("✗ Possible secrets found — move them into .env / Cloudflare secrets:\n");
  for (const f of findings) console.error("  " + f);
  process.exit(1);
}
console.log("✓ No secrets found in project files.");
