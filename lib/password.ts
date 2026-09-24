// PBKDF2-SHA256 via Web Crypto (bcrypt is too CPU-heavy for Workers).
// Format: pbkdf2_sha256:<iterations>:<salt>:<hash>
export const PBKDF2_ITERATIONS = 25_000;
const KEY_BYTES = 32;

const enc = new TextEncoder();

function toB64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(value: string): Uint8Array<ArrayBuffer> {
  const bin = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function derive(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, KEY_BYTES * 8);
  return new Uint8Array(bits);
}

export function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function hashPassword(password: string, iterations = PBKDF2_ITERATIONS): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, iterations);
  return `pbkdf2_sha256:${iterations}:${toB64Url(salt)}:${toB64Url(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iter, saltB64, hashB64] = stored.trim().split(":");
  const iterations = Number(iter);
  if (scheme !== "pbkdf2_sha256" || !Number.isInteger(iterations) || iterations < 1000 || iterations > 1_000_000) return false;
  try {
    const expected = fromB64Url(hashB64);
    const actual = await derive(password, fromB64Url(saltB64), iterations);
    return timingSafeEqualBytes(actual, expected);
  } catch {
    return false;
  }
}

/** SHA-256 hex digest (used to hash IPs and compare strings in constant time). */
export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}
