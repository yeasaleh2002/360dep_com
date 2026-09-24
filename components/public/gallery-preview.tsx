import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import type { PublicGalleryItem } from "@/lib/data";
import { getYouTubeId, youtubeThumbnail } from "@/lib/youtube";
import { cn } from "@/lib/utils";

export function coverOf(item: PublicGalleryItem): string | null {
  if (item.images[0]) return item.images[0];
  const id = getYouTubeId(item.youtubeUrl);
  return id ? youtubeThumbnail(id) : null;
}

/** Editorial mosaic on the home page: the first item is given a larger tile. */
export function GalleryPreview({ items }: { items: PublicGalleryItem[] }) {
  return (
    <div className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:gap-4 lg:grid-cols-4 lg:auto-rows-[240px]">
      {items.map((item, i) => {
        const cover = coverOf(item);
        return (
          <Reveal
            key={item.id}
            delay={i * 0.06}
            // 4 items fill a clean 4×2 (desktop) / 2×4 (mobile) mosaic; 2 items split it in half.
            className={cn(
              i === 0 && "col-span-2 row-span-2",
              i === 3 && "col-span-2",
              items.length === 2 && i === 1 && "col-span-2 lg:row-span-2",
            )}
          >
            <Link
              href={`/gallery#${item.id}`}
              className="group relative block h-full w-full overflow-hidden rounded-2xl bg-surface-2"
            >
              {cover && (
                <Image
                  src={cover}
                  alt={item.title}
                  fill
                  sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                  className="object-cover transition duration-[1200ms] ease-out group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90 transition group-hover:opacity-100" />
              {!item.images[0] && item.youtubeUrl && (
                <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-night">
                  <Play className="ml-0.5 h-5 w-5 fill-current" />
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                {item.category && (
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))]">
                    {item.category}
                  </p>
                )}
                <p className={cn("mt-1 font-display font-medium text-white", i === 0 ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl")}>
                  {item.title}
                </p>
              </div>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
