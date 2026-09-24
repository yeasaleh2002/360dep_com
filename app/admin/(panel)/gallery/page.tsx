import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { GalleryManager } from "@/components/admin/managers";
import type { Item } from "@/components/admin/resource-manager";
import { getDb } from "@/lib/db";
import { galleryItems } from "@/lib/db/schema";

export const metadata: Metadata = { title: "Gallery" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const [{ new: autoOpen }, items] = await Promise.all([
    searchParams,
    getDb().select().from(galleryItems).orderBy(asc(galleryItems.order), asc(galleryItems.createdAt)),
  ]);
  // JSON round-trip turns Dates into strings, exactly as the API returns them.
  return <GalleryManager initialItems={JSON.parse(JSON.stringify(items)) as Item[]} autoOpen={autoOpen === "1"} />;
}
