"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLocale } from "@/lib/i18n";

/** Full-screen image viewer: swipe/arrow-key navigation, Esc to close, scroll locked. */
export default function Lightbox({
  images,
  startIndex,
  title,
  onClose,
}: {
  images: string[];
  startIndex: number;
  title: string;
  onClose: () => void;
}) {
  const { t, locale } = useLocale();
  const [index, setIndex] = useState(startIndex);
  const [direction, setDirection] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const count = images.length;

  const go = useCallback(
    (delta: number) => {
      setDirection(delta);
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previousFocus?.focus();
    };
  }, [go, onClose]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) go(1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
  };

  const counter = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en");

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="flex items-center justify-between gap-4 p-4 text-white/80 sm:p-6" onClick={(e) => e.stopPropagation()}>
        <p className="truncate text-sm sm:text-base">
          <span className="font-display text-lg text-white">{title}</span>
          {count > 1 && (
            <span className="ml-3 text-white/50">
              {counter.format(index + 1)} / {counter.format(count)}
            </span>
          )}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t("common.close")}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 transition hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={index}
            className="absolute inset-0 touch-pan-y px-2 pb-6 sm:px-20"
            custom={direction}
            initial={{ opacity: 0, x: direction * 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -80 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            drag={count > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={onDragEnd}
          >
            <div className="relative h-full w-full">
              <Image
                src={images[index]}
                alt={`${title} — ${index + 1}`}
                fill
                sizes="100vw"
                quality={85}
                className="select-none object-contain"
                draggable={false}
                priority
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={t("gallery.prev")}
              className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/10 sm:flex"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={t("gallery.next")}
              className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/10 sm:flex"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
