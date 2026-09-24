"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { YouTubeEmbed } from "@/components/public/youtube-embed";
import { useLocale } from "@/lib/i18n";
import type { PublicGalleryItem } from "@/lib/data";
import { cn } from "@/lib/utils";

// The lightbox is only downloaded when someone opens a photo.
const Lightbox = dynamic(() => import("@/components/public/lightbox"), { ssr: false });

const ALL = "__all__";
const MAX_THUMBS = 5;

export function GalleryBrowser({ items }: { items: PublicGalleryItem[] }) {
  const { t, locale } = useLocale();
  const [category, setCategory] = useState(ALL);
  const [viewer, setViewer] = useState<{ item: PublicGalleryItem; index: number } | null>(null);

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const item of items) {
      const c = item.category?.trim();
      if (c && !seen.has(c.toLowerCase())) seen.set(c.toLowerCase(), c);
    }
    return [...seen.values()];
  }, [items]);

  const visible =
    category === ALL ? items : items.filter((i) => i.category?.trim().toLowerCase() === category.toLowerCase());
  const number = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en");

  return (
    <>
      {categories.length > 0 && (
        <div role="toolbar" aria-label={t("gallery.filterLabel")} className="mb-12 flex flex-wrap justify-center gap-2">
          {[ALL, ...categories].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={cn(
                "rounded-full border px-5 py-2 text-sm font-medium transition",
                category === c
                  ? "border-ink bg-ink text-bg dark:border-gold dark:bg-gold dark:text-night"
                  : "border-line text-muted hover:border-gold hover:text-ink",
              )}
            >
              {c === ALL ? t("gallery.all") : c}
            </button>
          ))}
        </div>
      )}

      <motion.div layout className="grid gap-8 md:grid-cols-2 lg:gap-10">
        <AnimatePresence mode="popLayout">
          {visible.map((item) => {
            const extra = item.images.length - MAX_THUMBS;
            return (
              <motion.article
                layout
                key={item.id}
                id={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="card scroll-mt-28 overflow-hidden"
              >
                {item.images.length > 0 && (
                  <div className={cn("grid gap-1", item.images.length === 1 ? "grid-cols-1" : "grid-cols-6")}>
                    {item.images.slice(0, MAX_THUMBS).map((src, i) => (
                      <button
                        key={src + i}
                        type="button"
                        onClick={() => setViewer({ item, index: i })}
                        aria-label={`${t("gallery.openImage")} — ${item.title} ${i + 1}`}
                        className={cn(
                          "group relative overflow-hidden bg-surface-2",
                          item.images.length === 1 && "aspect-[16/10]",
                          item.images.length > 1 && i === 0 && "col-span-6 aspect-[16/9]",
                          item.images.length === 2 && i === 1 && "col-span-6 aspect-[16/9]",
                          item.images.length === 3 && i > 0 && "col-span-3 aspect-[4/3]",
                          item.images.length === 4 && i > 0 && "col-span-2 aspect-square",
                          item.images.length >= 5 && i > 0 && "col-span-3 aspect-[4/3] sm:col-span-3",
                        )}
                      >
                        <Image
                          src={src}
                          alt={`${item.title} ${i + 1}`}
                          fill
                          sizes={i === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
                          className="object-cover transition duration-700 group-hover:scale-105"
                        />
                        {i === MAX_THUMBS - 1 && extra > 0 && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/55 font-display text-3xl text-white">
                            +{number.format(extra)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold-strong">
                    {item.category && <span>{item.category}</span>}
                    {item.images.length > 0 && (
                      <span className="text-muted">{t("gallery.photos", { n: number.format(item.images.length) })}</span>
                    )}
                    {item.youtubeUrl && <span className="text-muted">· {t("gallery.video")}</span>}
                  </div>
                  <h2 className="mt-3 text-3xl font-medium">{item.title}</h2>
                  {item.description && <p className="mt-3 whitespace-pre-line text-muted">{item.description}</p>}
                  {item.youtubeUrl && (
                    <div className="mt-6">
                      <YouTubeEmbed url={item.youtubeUrl} title={item.title} />
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {viewer && (
          <Lightbox
            images={viewer.item.images}
            startIndex={viewer.index}
            title={viewer.item.title}
            onClose={() => setViewer(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
