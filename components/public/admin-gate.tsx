"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Loader2, Lock, X } from "lucide-react";
import { useLocale } from "@/lib/i18n";

// Footer "Admin login": ask for the email first; only the admin email continues to /admin/login.
export function AdminGate() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(null), 6000);
    return () => window.clearTimeout(timer);
  }, [error]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as { redirect?: string; error?: string };
      if (res.ok && data.redirect) {
        setOpen(false);
        setEmail("");
        router.push(data.redirect);
        return;
      }
      setOpen(false);
      setEmail("");
      setError(t(data.error ?? "adminGate.error"));
    } catch {
      setOpen(false);
      setError(t("adminGate.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 text-white/50 transition hover:text-white"
      >
        <Lock className="h-3.5 w-3.5" />
        {t("adminGate.open")}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.form
              onSubmit={submit}
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-gate-title"
              className="w-full max-w-sm rounded-t-3xl bg-surface p-6 text-ink shadow-lift sm:rounded-3xl sm:p-8"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="admin-gate-title" className="font-sans text-lg font-semibold">
                    {t("adminGate.title")}
                  </h2>
                  <p className="mt-1 text-sm text-muted">{t("adminGate.body")}</p>
                </div>
                <button type="button" onClick={() => setOpen(false)} aria-label={t("adminGate.cancel")} className="rounded-full p-1.5 text-muted hover:bg-surface-2 hover:text-ink">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <label htmlFor="admin-gate-email" className="field-label mt-6">
                {t("adminGate.email")}
              </label>
              <input
                ref={inputRef}
                id="admin-gate-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                maxLength={200}
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field"
              />
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setOpen(false)} className="btn-outline flex-1 min-h-[44px]">
                  {t("adminGate.cancel")}
                </button>
                <button type="submit" disabled={busy || !email} className="btn-primary flex-1 min-h-[44px]">
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {busy ? t("adminGate.checking") : t("adminGate.submit")}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed inset-x-4 bottom-24 z-[60] mx-auto flex max-w-sm items-start gap-3 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700 shadow-lift lg:bottom-8"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span className="flex-1">{error}</span>
            <button type="button" onClick={() => setError(null)} aria-label="Close" className="text-red-400 hover:text-red-700">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
