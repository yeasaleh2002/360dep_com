/**
 * Server-side Cloudflare Turnstile verification.
 * When TURNSTILE_SECRET_KEY is not configured, verification is skipped (with a warning)
 * so a fresh deployment still works; rate limiting remains in force either way.
 */
export async function verifyTurnstile(token: string | undefined, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("[turnstile] TURNSTILE_SECRET_KEY is not set — bot verification is disabled.");
    return true;
  }
  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (ip && ip !== "unknown") body.set("remoteip", ip);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (error) {
    console.error("[turnstile] verification request failed", error);
    return false;
  }
}
