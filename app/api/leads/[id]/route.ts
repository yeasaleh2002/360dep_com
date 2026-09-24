import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { NotFoundError, handleApiError, jsonError, readJson, requireAdmin } from "@/lib/api";
import { ID_PATTERN } from "@/lib/crud";
import { leadUpdateSchema } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/leads/:id  { status?, note? } — update status and/or private note. */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  if (!ID_PATTERN.test(id)) return jsonError(400, "Invalid id");

  try {
    const { status, note } = leadUpdateSchema.parse(await readJson(req));
    const data = {
      ...(status ? { status } : {}),
      ...(note !== undefined ? { note: note || null } : {}),
    };
    if (Object.keys(data).length === 0) return jsonError(400, "Nothing to update");
    const [item] = await getDb().update(leads).set(data).where(eq(leads.id, id)).returning();
    if (!item) throw new NotFoundError();
    return NextResponse.json({ item });
  } catch (error) {
    return handleApiError(error);
  }
}

/** DELETE /api/leads/:id */
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  if (!ID_PATTERN.test(id)) return jsonError(400, "Invalid id");

  try {
    const deleted = await getDb().delete(leads).where(eq(leads.id, id)).returning({ id: leads.id });
    if (deleted.length === 0) throw new NotFoundError();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
