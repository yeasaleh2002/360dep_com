"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const iconButton =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition hover:border-gold hover:text-gold-strong";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(iconButton, className)}
      aria-label={t("common.toggleTheme")}
      title={t("common.toggleTheme")}
    >
      {/* Render a stable icon until mounted to avoid a hydration mismatch. */}
      {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}

export function LocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();
  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "bn" ? "en" : "bn")}
      className={cn(iconButton, "w-auto min-w-10 px-3 text-sm font-semibold", className)}
      aria-label={t("common.toggleLanguage")}
      title={t("common.toggleLanguage")}
    >
      {t("common.languageShort")}
    </button>
  );
}
