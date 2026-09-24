"use client";

// Bangla is rendered on the server; a saved English preference is applied after hydration,
// so public pages stay fully static.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import bn from "./bn.json";
import en from "./en.json";

export type Locale = "bn" | "en";
export const DEFAULT_LOCALE: Locale = "bn";
const STORAGE_KEY = "dep360-locale";

type Dictionary = typeof bn;
const dictionaries: Record<Locale, Dictionary> = { bn, en };

type Paths<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Paths<T[K], `${P}${K}.`>;
}[keyof T & string];
export type TKey = Paths<Dictionary>;
export type TVars = Record<string, string | number>;

function lookup(dict: unknown, key: string): string | undefined {
  const value = key.split(".").reduce<unknown>((node, part) => {
    return node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined;
  }, dict);
  return typeof value === "string" ? value : undefined;
}

export function translate(locale: Locale, key: TKey | (string & {}), vars?: TVars): string {
  const template = lookup(dictionaries[locale], key) ?? lookup(dictionaries[DEFAULT_LOCALE], key) ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? ""));
}

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TKey | (string & {}), vars?: TVars) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "bn") setLocaleState(saved);
    } catch {
      /* storage unavailable (private mode) — keep default */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: (key, vars) => translate(locale, key, vars) }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}

export function T({ k, vars }: { k: TKey; vars?: TVars }) {
  const { t } = useLocale();
  return <>{t(k, vars)}</>;
}
