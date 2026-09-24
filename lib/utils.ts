import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * URL slug that keeps Bangla (and any other script) letters intact,
 * e.g. "বিয়ের আয়োজন" → "বিয়ের-আয়োজন", "Corporate Events" → "corporate-events".
 */
export function slugify(input: string): string {
  const slug = input
    .normalize("NFC")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "service";
}

/** Formats taka amounts with locale-appropriate digits (Bangla digits for `bn`). */
export function formatTaka(amount: number, locale: "bn" | "en"): string {
  return new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-IN", { maximumFractionDigits: 0 }).format(amount);
}
