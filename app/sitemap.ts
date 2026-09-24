import type { MetadataRoute } from "next";
import { AREAS } from "@/lib/seo/areas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://360dep.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/services", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/gallery", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/clients", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.8, changeFrequency: "yearly" as const },
    { path: "/areas", priority: 0.8, changeFrequency: "monthly" as const },
    ...AREAS.map((a) => ({ path: `/areas/${a.slug}`, priority: 0.8, changeFrequency: "monthly" as const })),
  ].map(({ path, priority, changeFrequency }) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
