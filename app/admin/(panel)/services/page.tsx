import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { ServicesManager } from "@/components/admin/managers";
import type { Item } from "@/components/admin/resource-manager";
import { getDb } from "@/lib/db";
import { services } from "@/lib/db/schema";

export const metadata: Metadata = { title: "Services" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const [{ new: autoOpen }, items] = await Promise.all([
    searchParams,
    getDb().select().from(services).orderBy(asc(services.order), asc(services.createdAt)),
  ]);
  // JSON round-trip turns Dates into strings, exactly as the API returns them.
  return <ServicesManager initialItems={JSON.parse(JSON.stringify(items)) as Item[]} autoOpen={autoOpen === "1"} />;
}
