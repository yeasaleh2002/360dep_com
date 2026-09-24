import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

export function jsonError(status: number, error: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error, ...extra }, { status });
}

// CSRF check for state-changing requests (in addition to SameSite=Strict cookies).
export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  if (req.method !== "GET" && req.method !== "HEAD" && !isSameOrigin(req)) {
    return jsonError(403, "Request origin not allowed");
  }
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) return jsonError(401, "Your session has expired. Please sign in again.");
  return null;
}

export function getClientIp(req: NextRequest): string {
  const ip =
    req.headers.get("cf-connecting-ip") ?? req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for");
  return ip?.split(",")[0]?.trim() || "unknown";
}

export async function readJson(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

function pgCode(error: unknown): string | undefined {
  const e = error as { code?: unknown; cause?: { code?: unknown } } | null;
  const code = e?.code ?? e?.cause?.code;
  return typeof code === "string" ? code : undefined;
}

export class NotFoundError extends Error {}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    const first = error.issues[0]?.message ?? "Invalid input";
    return jsonError(422, first, { fieldErrors: error.flatten().fieldErrors });
  }
  if (error instanceof NotFoundError) return jsonError(404, "This item no longer exists. Refresh the page.");
  if (pgCode(error) === "23505") return jsonError(409, "An item with the same name already exists.");
  console.error("[api] unexpected error", error);
  return jsonError(500, "Something went wrong. Please try again.");
}
