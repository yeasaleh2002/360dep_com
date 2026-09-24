import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth";
import { getClientIp, isSameOrigin, jsonError, readJson } from "@/lib/api";
import { adminCredentials, safeEqual } from "@/lib/password";
import { rateLimit } from "@/lib/ratelimit";
import { verifyTurnstile } from "@/lib/turnstile";
import { loginSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

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

    const admin = adminCredentials();
    if (!admin.email || !admin.password) {
      console.error("[auth] ADMIN_EMAIL / ADMIN_PASSWORD are not configured");
      return jsonError(503, "Admin login is not set up yet.");
    }

    // Both comparisons always run, so timing doesn't reveal which one failed.
    const [emailOk, passwordOk] = await Promise.all([safeEqual(email, admin.email), safeEqual(password, admin.password)]);
    if (!emailOk || !passwordOk) return jsonError(401, "Incorrect email or password.");

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, await signSession(admin.email), sessionCookieOptions);
    return res;
  } catch (error) {
    console.error("[auth] login failed", error);
    return jsonError(500, "Sign-in is temporarily unavailable. Please try again.");
  }
}
