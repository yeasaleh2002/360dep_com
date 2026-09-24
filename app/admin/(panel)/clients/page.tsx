import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { ClientsManager } from "@/components/admin/managers";
import type { Item } from "@/components/admin/resource-manager";
import { getDb } from "@/lib/db";
import { clients } from "@/lib/db/schema";

export const metadata: Metadata = { title: "Clients" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const [{ new: autoOpen }, items] = await Promise.all([
    searchParams,
    getDb().select().from(clients).orderBy(asc(clients.order), asc(clients.createdAt)),
  ]);
  // JSON round-trip turns Dates into strings, exactly as the API returns them.
  return <ClientsManager initialItems={JSON.parse(JSON.stringify(items)) as Item[]} autoOpen={autoOpen === "1"} />;
}
