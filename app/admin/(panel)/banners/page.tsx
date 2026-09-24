import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { BannersManager } from "@/components/admin/managers";
import type { Item } from "@/components/admin/resource-manager";
import { getDb } from "@/lib/db";
import { banners } from "@/lib/db/schema";

export const metadata: Metadata = { title: "Banners" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const [{ new: autoOpen }, items] = await Promise.all([
    searchParams,
    getDb().select().from(banners).orderBy(asc(banners.order), asc(banners.createdAt)),
  ]);
  // JSON round-trip turns Dates into strings, exactly as the API returns them.
  return <BannersManager initialItems={JSON.parse(JSON.stringify(items)) as Item[]} autoOpen={autoOpen === "1"} />;
}
