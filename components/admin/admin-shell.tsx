"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  ExternalLink,
  GalleryHorizontalEnd,
  Handshake,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/toggles";
import { ToastProvider } from "@/components/admin/toast";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Enquiries", icon: Inbox, badge: true },
  { href: "/admin/banners", label: "Banners", icon: GalleryHorizontalEnd },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/clients", label: "Clients", icon: Handshake },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
];

export function AdminShell({ children, newLeads }: { children: ReactNode; newLeads: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const signOut = async () => {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/admin/login");
    router.refresh();
  };

  const current = NAV.find((n) => pathname.startsWith(n.href));

  const nav = (
    <nav className="flex flex-1 flex-col gap-1" aria-label="Admin">
      {NAV.map(({ href, label, icon: Icon, badge }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active ? "bg-ink text-bg dark:bg-gold dark:text-night" : "text-muted hover:bg-surface-2 hover:text-ink",
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="flex-1">{label}</span>
            {badge && newLeads > 0 && (
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", active ? "bg-bg/20" : "bg-gold/20 text-gold-strong")}>
                {newLeads}
              </span>
            )}
          </Link>
        );
      })}
      <div className="mt-auto space-y-1 border-t border-line pt-4">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink">
          <ExternalLink className="h-[18px] w-[18px]" /> View website
        </Link>
        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
        >
          <LogOut className="h-[18px] w-[18px]" /> {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </nav>
  );

  return (
    <ToastProvider>
      <div className="min-h-svh bg-bg lg:grid lg:grid-cols-[260px_1fr]">
        <aside className="sticky top-0 hidden h-svh flex-col gap-8 border-r border-line bg-surface px-4 py-6 lg:flex">
          <div className="px-2">
            <Logo />
            <p className="mt-1 pl-[46px] text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Admin</p>
          </div>
          {nav}
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-bg/85 px-4 backdrop-blur sm:px-8">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setOpen(true)} className="admin-icon-btn lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="font-sans text-lg font-semibold">{current?.label ?? "Admin"}</h1>
            </div>
            <ThemeToggle />
          </header>
          <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">{children}</main>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div className="fixed inset-0 z-50 bg-black/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
              <motion.aside
                className="flex h-full w-72 flex-col gap-8 bg-surface px-4 py-6"
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-2">
                  <Logo />
                  <button type="button" onClick={() => setOpen(false)} className="admin-icon-btn" aria-label="Close menu">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {nav}
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastProvider>
  );
}
