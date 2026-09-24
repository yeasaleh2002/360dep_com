/** Server-side configuration for each admin-managed collection. */
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { banners, clients, galleryItems, services, teamMembers } from "@/lib/db/schema";
import { slugify } from "@/lib/utils";
import { bannerSchema, clientSchema, gallerySchema, serviceSchema, teamSchema } from "@/lib/validators";
import { CACHE_TAGS } from "@/lib/data";
import type { ResourceConfig } from "@/lib/crud";

/** Generates a slug from the title that is unique across services. */
async function uniqueServiceSlug(title: string, id?: string): Promise<string> {
  const base = slugify(title);
  let slug = base;
  for (let n = 2; ; n++) {
    const [existing] = await getDb().select({ id: services.id }).from(services).where(eq(services.slug, slug)).limit(1);
    if (!existing || existing.id === id) return slug;
    slug = `${base}-${n}`;
  }
}

type Schema = ResourceConfig["schema"];

export const bannerResource: ResourceConfig = {
  table: banners,
  schema: bannerSchema as Schema,
  tag: CACHE_TAGS.banners,
};

export const serviceResource: ResourceConfig = {
  table: services,
  schema: serviceSchema as Schema,
  tag: CACHE_TAGS.services,
  prepare: async (data, { id }) => ({ ...data, slug: await uniqueServiceSlug(String(data.title), id) }),
};

export const teamResource: ResourceConfig = {
  table: teamMembers,
  schema: teamSchema as Schema,
  tag: CACHE_TAGS.team,
};

export const clientResource: ResourceConfig = {
  table: clients,
  schema: clientSchema as Schema,
  tag: CACHE_TAGS.clients,
};

export const galleryResource: ResourceConfig = {
  table: galleryItems,
  schema: gallerySchema as Schema,
  tag: CACHE_TAGS.gallery,
  flags: ["isActive", "isFeatured"],
};
