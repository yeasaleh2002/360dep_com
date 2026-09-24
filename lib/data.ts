// Public read queries, cached until their tag is revalidated by an admin write (no time-based expiry).
import { revalidateTag, unstable_cache } from "next/cache";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { banners, clients, galleryItems, services, teamMembers } from "@/lib/db/schema";

export const CACHE_TAGS = {
  banners: "banners",
  services: "services",
  team: "team",
  clients: "clients",
  gallery: "gallery",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

export function invalidatePublicContent(tag: CacheTag) {
  revalidateTag(tag);
}

export type PublicBanner = { id: string; imageUrl: string; title: string | null; description: string | null };
export type PublicService = {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  priceMin: number | null;
  priceMax: number | null;
};
export type PublicTeamMember = {
  id: string;
  name: string;
  designation: string;
  photoUrl: string | null;
  bio: string | null;
  facebook: string | null;
  linkedin: string | null;
};
export type PublicClient = { id: string; name: string; logoUrl: string; website: string | null; feedback: string | null };
export type PublicGalleryItem = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  images: string[];
  youtubeUrl: string | null;
  isFeatured: boolean;
};

/** `revalidate: false` = cache forever, until the tag is revalidated by an admin edit. */
const forever = (tag: CacheTag) => ({ tags: [tag], revalidate: false as const });

export const getBanners = unstable_cache(
  (): Promise<PublicBanner[]> =>
    getDb()
      .select({ id: banners.id, imageUrl: banners.imageUrl, title: banners.title, description: banners.description })
      .from(banners)
      .where(eq(banners.isActive, true))
      .orderBy(asc(banners.order), asc(banners.createdAt)),
  ["public-banners"],
  forever(CACHE_TAGS.banners),
);

export const getServices = unstable_cache(
  (): Promise<PublicService[]> =>
    getDb()
      .select({
        id: services.id,
        title: services.title,
        slug: services.slug,
        description: services.description,
        imageUrl: services.imageUrl,
        priceMin: services.priceMin,
        priceMax: services.priceMax,
      })
      .from(services)
      .where(eq(services.isActive, true))
      .orderBy(asc(services.order), asc(services.createdAt)),
  ["public-services"],
  forever(CACHE_TAGS.services),
);

export const getTeam = unstable_cache(
  (): Promise<PublicTeamMember[]> =>
    getDb()
      .select({
        id: teamMembers.id,
        name: teamMembers.name,
        designation: teamMembers.designation,
        photoUrl: teamMembers.photoUrl,
        bio: teamMembers.bio,
        facebook: teamMembers.facebook,
        linkedin: teamMembers.linkedin,
      })
      .from(teamMembers)
      .where(eq(teamMembers.isActive, true))
      .orderBy(asc(teamMembers.order), asc(teamMembers.createdAt)),
  ["public-team"],
  forever(CACHE_TAGS.team),
);

export const getClients = unstable_cache(
  (): Promise<PublicClient[]> =>
    getDb()
      .select({ id: clients.id, name: clients.name, logoUrl: clients.logoUrl, website: clients.website, feedback: clients.feedback })
      .from(clients)
      .where(eq(clients.isActive, true))
      .orderBy(asc(clients.order), asc(clients.createdAt)),
  ["public-clients"],
  forever(CACHE_TAGS.clients),
);

export const getGallery = unstable_cache(
  (): Promise<PublicGalleryItem[]> =>
    getDb()
      .select({
        id: galleryItems.id,
        title: galleryItems.title,
        description: galleryItems.description,
        category: galleryItems.category,
        images: galleryItems.images,
        youtubeUrl: galleryItems.youtubeUrl,
        isFeatured: galleryItems.isFeatured,
      })
      .from(galleryItems)
      .where(and(eq(galleryItems.isActive, true)))
      .orderBy(asc(galleryItems.order), asc(galleryItems.createdAt)),
  ["public-gallery"],
  forever(CACHE_TAGS.gallery),
);

/** Home page gallery: featured items first, topped up with the rest, `limit` in total. */
export async function getGalleryPreview(limit = 4): Promise<PublicGalleryItem[]> {
  const items = await getGallery();
  return [...items.filter((i) => i.isFeatured), ...items.filter((i) => !i.isFeatured)].slice(0, limit);
}
