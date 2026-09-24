import type { Metadata } from "next";
import type { ReactNode } from "react";
import { count, eq } from "drizzle-orm";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/session";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/db/schema";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  await requireAdminSession();
  const newLeads = await getDb()
    .select({ n: count() })
    .from(leads)
    .where(eq(leads.status, "new"))
    .then(([row]) => row.n)
    .catch(() => 0);

  return <AdminShell newLeads={newLeads}>{children}</AdminShell>;
}
