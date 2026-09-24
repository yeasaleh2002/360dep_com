"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BannerSlide } from "@/components/public/banner-slide";
import { useLocale } from "@/lib/i18n";
import type { PublicBanner } from "@/lib/data";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD = 60;

/**
 * Auto-playing crossfade slider for 2+ banners. Slides are stacked so the next image is
 * already loaded before it fades in. Swipe on touch, pause on hover (desktop) and while
 * the tab is hidden, arrow-key and dot navigation.
 */
export default function BannerSlider({ banners }: { banners: PublicBanner[] }) {
  const { t } = useLocale();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = banners.length;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => go(index + 1), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [index, paused, go]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -400) go(index + 1);
    else if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > 400) go(index - 1);
  };

  return (
    <div
      className="relative h-full w-full touch-pan-y select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="360DEP"
      tabIndex={0}
    >
      <motion.div className="absolute inset-0" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.15} onDragEnd={onDragEnd}>
        {banners.map((banner, i) => (
          <motion.div
            key={banner.id}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: i === index ? 1 : 0, scale: i === index ? 1 : 1.04 }}
            transition={{ opacity: { duration: 1.1, ease: "easeInOut" }, scale: { duration: 7, ease: "linear" } }}
            aria-hidden={i !== index}
            inert={i !== index}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${count}`}
          >
            <BannerSlide banner={banner} priority={i === 0} />
          </motion.div>
        ))}
      </motion.div>

      <button
        type="button"
        onClick={() => go(index - 1)}
        aria-label={t("hero.prev")}
        className="absolute left-5 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur transition hover:bg-black/40 md:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        aria-label={t("hero.next")}
        className="absolute right-5 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur transition hover:bg-black/40 md:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2.5">
        {banners.map((banner, i) => (
          <button
            key={banner.id}
            type="button"
            onClick={() => go(i)}
            aria-label={t("hero.goTo", { n: i + 1 })}
            aria-current={i === index}
            className="group flex h-6 items-center"
          >
            <span
              className={cn(
                "block h-[3px] rounded-full transition-all duration-500",
                i === index ? "w-10 bg-white" : "w-5 bg-white/45 group-hover:bg-white/80",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
