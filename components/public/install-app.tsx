"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Download, Share, X } from "lucide-react";
import { useLocale } from "@/lib/i18n";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

// Registers the service worker and offers "Download the app" (PWA install).
export function InstallAppButton() {
  const { t } = useLocale();
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [help, setHelp] = useState<"ios" | "other" | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    setInstalled(window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (prompt) {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setPrompt(null);
      return;
    }
    // iPhone/iPad Safari has no install prompt — show the manual steps instead.
    setHelp(/iphone|ipad|ipod/i.test(navigator.userAgent) ? "ios" : "other");
  };

  if (installed) {
    return (
      <p className="inline-flex items-center gap-2 text-sm text-white/60">
        <CheckCircle2 className="h-4 w-4 text-[rgb(var(--gold))]" /> {t("pwa.installed")}
      </p>
    );
  }

  return (
    <>
      <button type="button" onClick={install} className="btn-ghost-light min-h-[44px] text-sm">
        <Download className="h-4 w-4" />
        {t("pwa.install")}
      </button>

      <AnimatePresence>
        {help && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => e.target === e.currentTarget && setHelp(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              className="w-full max-w-sm rounded-t-3xl bg-surface p-6 text-ink shadow-lift sm:rounded-3xl sm:p-8"
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
            >
              <div className="flex items-start justify-between">
                <h2 className="font-sans text-lg font-semibold">{help === "ios" ? t("pwa.iosTitle") : t("pwa.otherTitle")}</h2>
                <button type="button" onClick={() => setHelp(null)} aria-label={t("pwa.ok")} className="rounded-full p-1.5 text-muted hover:bg-surface-2">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {help === "ios" ? (
                <ol className="mt-5 space-y-3 text-sm">
                  <li className="flex gap-3">
                    <Share className="h-5 w-5 shrink-0 text-gold" /> {t("pwa.iosStep1")}
                  </li>
                  <li className="flex gap-3">
                    <Download className="h-5 w-5 shrink-0 text-gold" /> {t("pwa.iosStep2")}
                  </li>
                </ol>
              ) : (
                <p className="mt-5 text-sm text-muted">{t("pwa.otherBody")}</p>
              )}
              <button type="button" onClick={() => setHelp(null)} className="btn-primary mt-6 w-full min-h-[44px]">
                {t("pwa.ok")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
