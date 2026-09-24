import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

const LOGIN_PATH = "/admin/login";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  // Admin APIs: JSON 401 instead of a redirect.
  if (pathname.startsWith("/api/")) {
    if (!session) {
      return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname === LOGIN_PATH) {
    // Already signed in → skip the login form.
    return session ? NextResponse.redirect(new URL("/admin/dashboard", req.url)) : NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL(LOGIN_PATH, req.url);
    if (pathname !== "/admin" && pathname !== "/admin/dashboard") loginUrl.searchParams.set("next", pathname);
    const res = NextResponse.redirect(loginUrl);
    // Drop an invalid/expired cookie so the browser stops sending it.
    if (req.cookies.has(SESSION_COOKIE)) res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/:resource(banners|services|team|clients|gallery|leads|upload)",
    "/api/:resource(banners|services|team|clients|gallery|leads|upload)/:path*",
  ],
};
