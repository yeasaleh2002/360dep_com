import type { Metadata } from "next";
import { count, desc, eq } from "drizzle-orm";
import { LeadsTable, type LeadRow } from "@/components/admin/leads-table";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/validators";

export const metadata: Metadata = { title: "Enquiries" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const params = await searchParams;
  const status: LeadStatus | "all" = LEAD_STATUSES.includes(params.status as LeadStatus) ? (params.status as LeadStatus) : "all";
  const page = Math.max(1, Number(params.page) || 1);
  const where = status === "all" ? undefined : eq(leads.status, status);
  const db = getDb();

  const [rows, grouped] = await Promise.all([
    db.select().from(leads).where(where).orderBy(desc(leads.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.select({ status: leads.status, n: count() }).from(leads).groupBy(leads.status),
  ]);

  const counts = { all: 0, new: 0, contacted: 0, closed: 0 } as Record<LeadStatus | "all", number>;
  for (const row of grouped) {
    counts.all += row.n;
    if (row.status in counts) counts[row.status as LeadStatus] = row.n;
  }
  const total = status === "all" ? counts.all : counts[status];

  return (
    <LeadsTable
      key={`${status}-${page}`}
      leads={JSON.parse(JSON.stringify(rows)) as LeadRow[]}
      counts={counts}
      status={status}
      page={page}
      totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
    />
  );
}
