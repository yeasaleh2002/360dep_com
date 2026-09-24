import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "dep360_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

const ISSUER = "360dep";
const AUDIENCE = "360dep-admin";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters long");
  }
  return new TextEncoder().encode(secret);
}

export type AdminSession = { email: string; role: "admin" };

export async function signSession(email: string): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(email)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySession(token: string | undefined | null): Promise<AdminSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    // Changing ADMIN_EMAIL invalidates every existing session.
    if (payload.role !== "admin" || !payload.sub || payload.sub !== adminEmail) return null;
    return { email: payload.sub, role: "admin" };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
