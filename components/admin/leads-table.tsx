"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Mail, Phone, StickyNote, Trash2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/icons";
import { ConfirmDialog } from "@/components/admin/modal";
import { adminFetch } from "@/components/admin/api-client";
import { useToast } from "@/components/admin/toast";
import { whatsappLinkForPhone } from "@/lib/whatsapp";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/validators";
import { cn } from "@/lib/utils";

export type LeadRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  serviceTitle: string | null;
  customService: string | null;
  message: string | null;
  status: string;
  note: string | null;
  createdAt: Date | string;
};

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  contacted: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  closed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
};
const STATUS_LABELS: Record<LeadStatus, string> = { new: "New", contacted: "Contacted", closed: "Closed" };

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Dhaka",
});

export function LeadsTable({
  leads: initial,
  counts,
  status,
  page,
  totalPages,
}: {
  leads: LeadRow[];
  counts: Record<LeadStatus | "all", number>;
  status: LeadStatus | "all";
  page: number;
  totalPages: number;
}) {
  const toast = useToast();
  const router = useRouter();
  const [leads, setLeads] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<LeadRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [openNote, setOpenNote] = useState<string | null>(null);

  const update = async (lead: LeadRow, data: { status?: LeadStatus; note?: string }) => {
    setBusyId(lead.id);
    try {
      const { item } = await adminFetch<{ item: LeadRow }>(`/api/leads/${lead.id}`, { method: "PATCH", json: data });
      setLeads((list) => list.map((l) => (l.id === item.id ? item : l)));
      toast.success(data.status ? `Marked as ${STATUS_LABELS[data.status].toLowerCase()}.` : "Note saved.");
      router.refresh(); // refresh counts in tabs and sidebar badge
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminFetch(`/api/leads/${toDelete.id}`, { method: "DELETE" });
      setLeads((list) => list.filter((l) => l.id !== toDelete.id));
      toast.success("Enquiry deleted.");
      setToDelete(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete.");
    } finally {
      setDeleting(false);
    }
  };

  const tabs: (LeadStatus | "all")[] = ["all", ...LEAD_STATUSES];
  const href = (s: LeadStatus | "all", p = 1) => `/admin/leads?${new URLSearchParams({ ...(s !== "all" ? { status: s } : {}), ...(p > 1 ? { page: String(p) } : {}) })}`;

  return (
    <div>
      <p className="mb-6 max-w-2xl text-sm text-muted">
        Everyone who filled in the website's contact form. Reply on WhatsApp or by phone, then update the status so you know where each one stands.
      </p>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((s) => (
          <Link
            key={s}
            href={href(s)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
              status === s ? "border-ink bg-ink text-bg dark:border-gold dark:bg-gold dark:text-night" : "border-line text-muted hover:text-ink",
            )}
          >
            {s === "all" ? "All" : STATUS_LABELS[s]} <span className="ml-1 opacity-70">{counts[s]}</span>
          </Link>
        ))}
      </div>

      {leads.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-line px-6 py-16 text-center">
          <p className="font-medium">No enquiries here yet</p>
          <p className="mt-1 text-sm text-muted">New contact-form submissions will appear here automatically.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {leads.map((lead) => {
            const wa = whatsappLinkForPhone(lead.phone);
            const service = lead.serviceTitle ?? (lead.customService ? `Other: ${lead.customService}` : "—");
            const busy = busyId === lead.id;
            return (
              <li key={lead.id} className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold">{lead.name}</p>
                      <span className={cn("admin-badge", STATUS_STYLES[lead.status as LeadStatus] ?? STATUS_STYLES.new)}>
                        {STATUS_LABELS[lead.status as LeadStatus] ?? lead.status}
                      </span>
                      <span className="text-xs text-muted">{dateFormat.format(new Date(lead.createdAt))}</span>
                    </div>
                    <p className="mt-1 text-sm">
                      <span className="text-muted">Service:</span> <span className="font-medium">{service}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                      <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 text-ink hover:text-gold-strong">
                        <Phone className="h-3.5 w-3.5" /> {lead.phone}
                      </a>
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 break-all text-ink hover:text-gold-strong">
                          <Mail className="h-3.5 w-3.5" /> {lead.email}
                        </a>
                      )}
                    </div>
                    {lead.message && <p className="mt-3 whitespace-pre-line rounded-xl bg-surface-2 p-3 text-sm text-ink/90">{lead.message}</p>}

                    {openNote === lead.id ? (
                      <form
                        className="mt-3"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const note = String(new FormData(e.currentTarget).get("note") ?? "");
                          update(lead, { note }).then(() => setOpenNote(null));
                        }}
                      >
                        <textarea name="note" defaultValue={lead.note ?? ""} rows={2} maxLength={1000} className="field text-sm" placeholder="Private note — only visible here" autoFocus />
                        <div className="mt-2 flex gap-2">
                          <button type="submit" className="admin-btn-primary !min-h-[36px]" disabled={busy}>
                            Save note
                          </button>
                          <button type="button" className="admin-btn-secondary !min-h-[36px]" onClick={() => setOpenNote(null)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      lead.note && (
                        <p className="mt-3 flex gap-2 text-sm text-muted">
                          <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> {lead.note}
                        </p>
                      )
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-end">
                    <div className="flex items-center gap-2">
                      {busy && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
                      <label className="sr-only" htmlFor={`status-${lead.id}`}>
                        Status
                      </label>
                      <select
                        id={`status-${lead.id}`}
                        value={lead.status}
                        disabled={busy}
                        onChange={(e) => update(lead, { status: e.target.value as LeadStatus })}
                        className="field !w-auto !py-2 text-sm"
                      >
                        {LEAD_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      {wa && (
                        <a href={wa} target="_blank" rel="noopener noreferrer" className="admin-btn !min-h-[38px] bg-[#1f9d55] text-white hover:bg-[#188047]">
                          <WhatsAppIcon className="h-4 w-4" /> Reply
                        </a>
                      )}
                      <button type="button" onClick={() => setOpenNote(lead.id)} className="admin-icon-btn" title="Add a private note" aria-label="Add a private note">
                        <StickyNote className="h-[18px] w-[18px]" />
                      </button>
                      <button type="button" onClick={() => setToDelete(lead)} className="admin-icon-btn hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-950/40" title="Delete" aria-label="Delete">
                        <Trash2 className="h-[18px] w-[18px]" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3 text-sm">
          <Link aria-disabled={page <= 1} href={href(status, page - 1)} className={cn("admin-btn-secondary", page <= 1 && "pointer-events-none opacity-40")}>
            <ChevronLeft className="h-4 w-4" /> Newer
          </Link>
          <span className="text-muted">
            Page {page} of {totalPages}
          </span>
          <Link aria-disabled={page >= totalPages} href={href(status, page + 1)} className={cn("admin-btn-secondary", page >= totalPages && "pointer-events-none opacity-40")}>
            Older <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this enquiry?"
        message={`The enquiry from “${toDelete?.name ?? ""}” will be deleted permanently. To keep it for your records, mark it as Closed instead.`}
        busy={deleting}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
