import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth";
import { getClientIp, isSameOrigin, jsonError, readJson } from "@/lib/api";
import { sha256Hex, timingSafeEqualBytes, verifyPassword } from "@/lib/password";
import { rateLimit } from "@/lib/ratelimit";
import { verifyTurnstile } from "@/lib/turnstile";
import { loginSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

// Verified when no admin hash is configured, so response timing stays the same.
const DUMMY_HASH = "pbkdf2_sha256:25000:AAAAAAAAAAAAAAAAAAAAAA:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

async function safeEqual(a: string, b: string) {
  const [ha, hb] = await Promise.all([sha256Hex(a), sha256Hex(b)]);
  const enc = new TextEncoder();
  return timingSafeEqualBytes(enc.encode(ha), enc.encode(hb));
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return jsonError(403, "Request origin not allowed");

  const ip = getClientIp(req);

  try {
    if (!(await rateLimit("LOGIN_LIMITER", ip))) {
      return jsonError(429, "Too many attempts. Please wait a minute and try again.", { retryAfter: 60 });
    }

    const parsed = loginSchema.safeParse(await readJson(req));
    if (!parsed.success) return jsonError(422, parsed.error.issues[0]?.message ?? "Invalid input");
    const { email, password, turnstileToken } = parsed.data;

    if (!(await verifyTurnstile(turnstileToken, ip))) {
      return jsonError(400, "Security check failed. Please complete the check and try again.");
    }

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
    const hash = process.env.ADMIN_PASSWORD_HASH?.trim() ?? "";
    if (!adminEmail || !hash) console.error("[auth] ADMIN_EMAIL / ADMIN_PASSWORD_HASH are not configured");

    const [passwordOk, emailOk] = await Promise.all([
      verifyPassword(password, hash || DUMMY_HASH),
      adminEmail ? safeEqual(email, adminEmail) : Promise.resolve(false),
    ]);

    if (!emailOk || !passwordOk || !hash) return jsonError(401, "Incorrect email or password.");

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, await signSession(adminEmail), sessionCookieOptions);
    return res;
  } catch (error) {
    console.error("[auth] login failed", error);
    return jsonError(500, "Sign-in is temporarily unavailable. Please try again.");
  }
}
