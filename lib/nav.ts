import type { TKey } from "@/lib/i18n";

/** Public navigation, shared by the header (client) and footer (server). */
export const NAV_ITEMS: { href: string; key: TKey }[] = [
  { href: "/", key: "nav.home" },
  { href: "/about", key: "nav.about" },
  { href: "/services", key: "nav.services" },
  { href: "/gallery", key: "nav.gallery" },
  { href: "/clients", key: "nav.clients" },
  { href: "/contact", key: "nav.contact" },
];
