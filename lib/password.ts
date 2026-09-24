// ADMIN_PASSWORD is kept in plain text in env / Cloudflare secrets so the owner can change it easily.
// It is never sent to the browser, never logged, and compared in constant time.
const enc = new TextEncoder();

export function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time string equality (both sides are hashed first so lengths always match). */
export async function safeEqual(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([sha256Hex(a), sha256Hex(b)]);
  return timingSafeEqualBytes(enc.encode(ha), enc.encode(hb));
}

export function adminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "",
    password: process.env.ADMIN_PASSWORD ?? "",
  };
}

/**
 * Short fingerprint of the current admin email + password, stored in the session token.
 * Changing ADMIN_PASSWORD (or JWT_SECRET) therefore signs every existing session out.
 */
export async function credentialFingerprint(): Promise<string> {
  const { email, password } = adminCredentials();
  return (await sha256Hex(`${email}\n${password}\n${process.env.JWT_SECRET ?? ""}`)).slice(0, 24);
}
