import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getClientIp, isSameOrigin, jsonError, readJson } from "@/lib/api";
import { adminCredentials, safeEqual } from "@/lib/password";
import { rateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().trim().toLowerCase().email().max(200) });

// Footer "Admin login" step 1: only the configured admin email is let through to /admin/login.
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return jsonError(403, "adminGate.error");
  if (!(await rateLimit("LOGIN_LIMITER", `gate:${getClientIp(req)}`))) return jsonError(429, "adminGate.rateLimited");

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return jsonError(422, "adminGate.invalidEmail");

  const admin = adminCredentials();
  const ok = Boolean(admin.email) && (await safeEqual(parsed.data.email, admin.email));
  if (!ok) return jsonError(403, "adminGate.notAdmin");

  return NextResponse.json({ ok: true, redirect: `/admin/login?email=${encodeURIComponent(parsed.data.email)}` });
}
