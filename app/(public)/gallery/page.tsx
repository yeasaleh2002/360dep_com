import type { Metadata } from "next";
import { PageHero } from "@/components/public/page-hero";
import { GalleryBrowser } from "@/components/public/gallery-browser";
import { T } from "@/lib/i18n";
import { getGallery } from "@/lib/data";
import bn from "@/lib/i18n/bn.json";

export const metadata: Metadata = {
  title: "গ্যালারি — বিয়ে ও ইভেন্টের ছবি ও ভিডিও | Event Gallery",
  description: bn.gallery.subtitle,
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const items = await getGallery();

  return (
    <>
      <PageHero eyebrow="gallery.eyebrow" title="gallery.title" subtitle="gallery.subtitle" />
      <section className="section">
        <div className="container">
          {items.length > 0 ? (
            <GalleryBrowser items={items} />
          ) : (
            <p className="text-center text-muted">
              <T k="gallery.empty" />
            </p>
          )}
        </div>
      </section>
    </>
  );
}
