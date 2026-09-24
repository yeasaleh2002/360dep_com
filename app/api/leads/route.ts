import { NextResponse, type NextRequest } from "next/server";
import { count, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { handleApiError, requireAdmin } from "@/lib/api";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/validators";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

/** GET /api/leads?status=new&page=1 — paginated enquiries, newest first (admin only). */
export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const status = req.nextUrl.searchParams.get("status");
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page")) || 1);
  const where = LEAD_STATUSES.includes(status as LeadStatus) ? eq(leads.status, status as LeadStatus) : undefined;

  try {
    const db = getDb();
    const [items, [{ total }]] = await Promise.all([
      db.select().from(leads).where(where).orderBy(desc(leads.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
      db.select({ total: count() }).from(leads).where(where),
    ]);
    return NextResponse.json({ items, total, page, pageSize: PAGE_SIZE });
  } catch (error) {
    return handleApiError(error);
  }
}
