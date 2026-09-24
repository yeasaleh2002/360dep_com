// Generic admin CRUD handlers. Each write validates with Zod and revalidates the resource's cache tag.
import { NextResponse, type NextRequest } from "next/server";
import { asc, eq, sql } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import type { ZodType } from "zod";
import { getDb } from "@/lib/db";
import { NotFoundError, handleApiError, jsonError, readJson, requireAdmin } from "@/lib/api";
import { flagsSchema, reorderSchema } from "@/lib/validators";
import { invalidatePublicContent, type CacheTag } from "@/lib/data";

type Data = Record<string, unknown>;

export type ContentTable = PgTable & {
  id: PgColumn;
  order: PgColumn;
  createdAt: PgColumn;
};

export type ResourceConfig = {
  table: ContentTable;
  schema: ZodType<Data>;
  tag: CacheTag;
  /** Which quick on/off switches the list view may flip. */
  flags?: Array<"isActive" | "isFeatured">;
  /** Optional hook to derive extra fields (e.g. a unique slug) before writing. */
  prepare?: (data: Data, ctx: { id?: string }) => Promise<Data>;
};

type IdContext = { params: Promise<{ id: string }> };

/** Ids are 32-char hex (see schema.newId); anything else is rejected before hitting the DB. */
export const ID_PATTERN = /^[a-z0-9]{10,40}$/i;

// Drizzle's generics can't express "any of these five tables", so the query builder is
// typed loosely here; inputs are fully validated by Zod before reaching it.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => getDb() as any;

export function collectionHandlers(cfg: ResourceConfig) {
  const t = cfg.table;

  async function GET(req: NextRequest) {
    const denied = await requireAdmin(req);
    if (denied) return denied;
    try {
      const items = await db().select().from(t).orderBy(asc(t.order), asc(t.createdAt));
      return NextResponse.json({ items });
    } catch (error) {
      return handleApiError(error);
    }
  }

  async function POST(req: NextRequest) {
    const denied = await requireAdmin(req);
    if (denied) return denied;
    try {
      let data = cfg.schema.parse(await readJson(req));
      if (cfg.prepare) data = await cfg.prepare(data, {});
      // New items go to the end of the list.
      const [{ max }] = await db()
        .select({ max: sql<number>`coalesce(max(${t.order}), -1)`.mapWith(Number) })
        .from(t);
      const [item] = await db().insert(t).values({ ...data, order: max + 1 }).returning();
      invalidatePublicContent(cfg.tag);
      return NextResponse.json({ item }, { status: 201 });
    } catch (error) {
      return handleApiError(error);
    }
  }

  return { GET, POST };
}

export function itemHandlers(cfg: ResourceConfig) {
  const t = cfg.table;

  async function resolveId(ctx: IdContext) {
    const { id } = await ctx.params;
    return ID_PATTERN.test(id) ? id : null;
  }

  async function update(id: string, data: Data) {
    const [item] = await db().update(t).set(data).where(eq(t.id, id)).returning();
    if (!item) throw new NotFoundError();
    invalidatePublicContent(cfg.tag);
    return item;
  }

  async function PUT(req: NextRequest, ctx: IdContext) {
    const denied = await requireAdmin(req);
    if (denied) return denied;
    const id = await resolveId(ctx);
    if (!id) return jsonError(400, "Invalid id");
    try {
      let data = cfg.schema.parse(await readJson(req));
      if (cfg.prepare) data = await cfg.prepare(data, { id });
      return NextResponse.json({ item: await update(id, data) });
    } catch (error) {
      return handleApiError(error);
    }
  }

  async function PATCH(req: NextRequest, ctx: IdContext) {
    const denied = await requireAdmin(req);
    if (denied) return denied;
    const id = await resolveId(ctx);
    if (!id) return jsonError(400, "Invalid id");
    try {
      const flags = flagsSchema.parse(await readJson(req));
      const allowed = cfg.flags ?? ["isActive"];
      const data = Object.fromEntries(
        Object.entries(flags).filter(([key, value]) => value !== undefined && allowed.includes(key as never)),
      );
      if (Object.keys(data).length === 0) return jsonError(400, "Nothing to update");
      return NextResponse.json({ item: await update(id, data) });
    } catch (error) {
      return handleApiError(error);
    }
  }

  async function DELETE(req: NextRequest, ctx: IdContext) {
    const denied = await requireAdmin(req);
    if (denied) return denied;
    const id = await resolveId(ctx);
    if (!id) return jsonError(400, "Invalid id");
    try {
      const deleted = await db().delete(t).where(eq(t.id, id)).returning({ id: t.id });
      if (deleted.length === 0) throw new NotFoundError();
      invalidatePublicContent(cfg.tag);
      return NextResponse.json({ ok: true });
    } catch (error) {
      return handleApiError(error);
    }
  }

  return { PUT, PATCH, DELETE };
}

/** Saves a drag-and-drop order: `ids` in their new display order (one atomic batch). */
export function reorderHandler(cfg: ResourceConfig) {
  const t = cfg.table;
  return async function POST(req: NextRequest) {
    const denied = await requireAdmin(req);
    if (denied) return denied;
    try {
      const { ids } = reorderSchema.parse(await readJson(req));
      if (!ids.every((id) => ID_PATTERN.test(id))) return jsonError(400, "Invalid id");
      await db().batch(ids.map((id, index) => db().update(t).set({ order: index }).where(eq(t.id, id))));
      invalidatePublicContent(cfg.tag);
      return NextResponse.json({ ok: true });
    } catch (error) {
      return handleApiError(error);
    }
  };
}
