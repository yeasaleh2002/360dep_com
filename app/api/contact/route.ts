import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { leads, services } from "@/lib/db/schema";
import { getClientIp, isSameOrigin, jsonError, readJson } from "@/lib/api";
import { rateLimit } from "@/lib/ratelimit";
import { verifyTurnstile } from "@/lib/turnstile";
import { contactSchema, normalizePhone, OTHER_SERVICE } from "@/lib/validators";

export const dynamic = "force-dynamic";

// Error messages are i18n keys that the contact form translates.
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return jsonError(403, "contact.error");

  const ip = getClientIp(req);

  try {
    if (!(await rateLimit("CONTACT_LIMITER", ip))) return jsonError(429, "contact.rateLimited", { retryAfter: 60 });

    const parsed = contactSchema.safeParse(await readJson(req));
    if (!parsed.success) {
      return jsonError(422, parsed.error.issues[0]?.message ?? "contact.error", {
        fieldErrors: parsed.error.flatten().fieldErrors,
      });
    }
    const input = parsed.data;

    // Honeypot filled → a bot. Pretend success, store nothing.
    if (input.website) return NextResponse.json({ ok: true, serviceTitle: null });

    if (!(await verifyTurnstile(input.turnstileToken, ip))) return jsonError(400, "contact.captchaFailed");

    const db = getDb();

    // Only trust service ids that exist and are active.
    let serviceId: string | null = null;
    let serviceTitle: string | null = null;
    if (input.service !== OTHER_SERVICE) {
      const [service] = await db
        .select({ id: services.id, title: services.title })
        .from(services)
        .where(and(eq(services.id, input.service), eq(services.isActive, true)))
        .limit(1);
      if (service) {
        serviceId = service.id;
        serviceTitle = service.title;
      }
    }

    await db.insert(leads).values({
      name: input.name,
      phone: normalizePhone(input.phone),
      email: input.email || null,
      serviceId,
      serviceTitle,
      customService: input.service === OTHER_SERVICE ? input.customService || null : null,
      message: input.message || null,
    });

    return NextResponse.json({ ok: true, serviceTitle });
  } catch (error) {
    console.error("[contact] failed to save lead", error);
    return jsonError(500, "contact.error");
  }
}
