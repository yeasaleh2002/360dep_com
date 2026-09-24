import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { isSameOrigin, jsonError } from "@/lib/api";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return jsonError(403, "Request origin not allowed");
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return res;
}
