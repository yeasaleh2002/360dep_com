import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Briefcase, CalendarDays, GalleryHorizontalEnd, Handshake, Images, Inbox, Plus, Users } from "lucide-react";
import { count, desc, eq, gte } from "drizzle-orm";
import { getDb } from "@/lib/db";
import * as t from "@/lib/db/schema";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Dhaka" });

export default async function DashboardPage() {
  const db = getDb();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const n = (rows: { n: number }[]) => rows[0]?.n ?? 0;

  const [newLeads, totalLeads, weekLeads, services, gallery, team, clients, banners, recent] = await Promise.all([
    db.select({ n: count() }).from(t.leads).where(eq(t.leads.status, "new")).then(n),
    db.select({ n: count() }).from(t.leads).then(n),
    db.select({ n: count() }).from(t.leads).where(gte(t.leads.createdAt, weekAgo)).then(n),
    db.select({ n: count() }).from(t.services).where(eq(t.services.isActive, true)).then(n),
    db.select({ n: count() }).from(t.galleryItems).where(eq(t.galleryItems.isActive, true)).then(n),
    db.select({ n: count() }).from(t.teamMembers).where(eq(t.teamMembers.isActive, true)).then(n),
    db.select({ n: count() }).from(t.clients).where(eq(t.clients.isActive, true)).then(n),
    db.select({ n: count() }).from(t.banners).where(eq(t.banners.isActive, true)).then(n),
    db.select().from(t.leads).orderBy(desc(t.leads.createdAt)).limit(5),
  ]);

  const leadStats = [
    { label: "New enquiries", value: newLeads, hint: "Waiting for your reply", highlight: newLeads > 0, href: "/admin/leads?status=new" },
    { label: "This week", value: weekLeads, hint: "Enquiries in the last 7 days", href: "/admin/leads" },
    { label: "All time", value: totalLeads, hint: "Total enquiries received", href: "/admin/leads" },
  ];

  const content = [
    { label: "Banners", value: banners, icon: GalleryHorizontalEnd, href: "/admin/banners" },
    { label: "Services", value: services, icon: Briefcase, href: "/admin/services" },
    { label: "Team members", value: team, icon: Users, href: "/admin/team" },
    { label: "Clients", value: clients, icon: Handshake, href: "/admin/clients" },
    { label: "Gallery items", value: gallery, icon: Images, href: "/admin/gallery" },
  ];

  const quick = [
    { label: "Add a banner", href: "/admin/banners?new=1" },
    { label: "Add a service", href: "/admin/services?new=1" },
    { label: "Add gallery photos", href: "/admin/gallery?new=1" },
    { label: "Add a team member", href: "/admin/team?new=1" },
    { label: "Add a client logo", href: "/admin/clients?new=1" },
  ];

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 flex items-center gap-2 font-sans text-sm font-semibold uppercase tracking-wider text-muted">
          <Inbox className="h-4 w-4" /> Enquiries
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {leadStats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className={`rounded-2xl border p-6 transition hover:shadow-soft ${s.highlight ? "border-gold/50 bg-gold/10" : "border-line bg-surface"}`}
            >
              <p className="text-sm font-medium text-muted">{s.label}</p>
              <p className="mt-2 font-sans text-4xl font-semibold">{s.value}</p>
              <p className="mt-1 text-xs text-muted">{s.hint}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-line bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-sans text-base font-semibold">
              <CalendarDays className="h-4 w-4 text-gold" /> Latest enquiries
            </h2>
            <Link href="/admin/leads" className="inline-flex items-center gap-1 text-sm font-medium text-gold-strong hover:underline">
              See all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No enquiries yet. They'll appear here as soon as someone uses the contact form.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((lead) => (
                <li key={lead.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{lead.name}</p>
                    <p className="truncate text-sm text-muted">
                      {lead.serviceTitle ?? lead.customService ?? "General enquiry"} · {lead.phone}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {lead.status === "new" && <span className="admin-badge bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">New</span>}
                    <p className="mt-1 text-xs text-muted">{dateFormat.format(lead.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="mb-4 flex items-center gap-2 font-sans text-base font-semibold">
            <Plus className="h-4 w-4 text-gold" /> Quick actions
          </h2>
          <ul className="space-y-2">
            {quick.map((q) => (
              <li key={q.href}>
                <Link href={q.href} className="flex items-center justify-between rounded-xl border border-line px-4 py-3 text-sm font-medium transition hover:border-gold/60 hover:bg-surface-2">
                  {q.label}
                  <ArrowRight className="h-4 w-4 text-muted" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section>
        <h2 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-muted">Live on the website</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {content.map(({ label, value, icon: Icon, href }) => (
            <Link key={label} href={href} className="rounded-2xl border border-line bg-surface p-5 transition hover:shadow-soft">
              <Icon className="h-5 w-5 text-gold" />
              <p className="mt-3 font-sans text-2xl font-semibold">{value}</p>
              <p className="text-sm text-muted">{label}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
