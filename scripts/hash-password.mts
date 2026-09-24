/**
 * Creates the ADMIN_PASSWORD_HASH value for a new admin password.
 * Usage: npm run hash-password -- "your-strong-password"
 */
import { hashPassword } from "../lib/password";

const password = process.argv[2];
if (!password || password.length < 10) {
  console.error('Usage: npm run hash-password -- "your-strong-password"   (at least 10 characters)');
  process.exit(1);
}

const hash = await hashPassword(password);
console.log("\nPut this in .env (local) and in Cloudflare → Worker → Settings → Variables and Secrets (as a Secret):\n");
console.log(`ADMIN_PASSWORD_HASH="${hash}"\n`);
