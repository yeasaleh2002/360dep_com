"use client";

import { useLocale } from "@/lib/i18n";
import { formatTaka } from "@/lib/utils";

/** Shows a price only when the admin has set one; digits follow the visitor's language. */
export function PriceRange({ min, max }: { min: number | null; max: number | null }) {
  const { t, locale } = useLocale();
  if (min == null && max == null) return null;

  const fmt = (n: number) => `${t("common.currency")} ${formatTaka(n, locale)}`;
  let text: string;
  if (min != null && max != null) text = min === max ? fmt(min) : `${fmt(min)} – ${fmt(max)}`;
  else if (min != null) text = `${t("common.priceFrom")} ${fmt(min)}`;
  else text = `${t("common.priceUpTo")} ${fmt(max!)}`;

  return (
    <p className="mt-5 inline-flex items-center gap-2 text-[0.95rem] font-semibold text-gold-strong">
      <span aria-hidden className="h-px w-5 bg-gold" />
      {text}
    </p>
  );
}
