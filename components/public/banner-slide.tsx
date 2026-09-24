import Image from "next/image";
import type { PublicBanner } from "@/lib/data";

/**
 * One banner image. If a title and/or description is set, it's overlaid centered on a
 * soft dark gradient for legibility; with neither, the photograph stands alone.
 */
export function BannerSlide({ banner, priority = false }: { banner: PublicBanner; priority?: boolean }) {
  const hasText = Boolean(banner.title || banner.description);

  return (
    <div className="relative h-full w-full overflow-hidden bg-night">
      <Image
        src={banner.imageUrl}
        alt={banner.title ?? "360DEP"}
        fill
        priority={priority}
        fetchPriority={priority ? "high" : "auto"}
        sizes="100vw"
        quality={80}
        className="object-cover"
        draggable={false}
      />
      {hasText && (
        <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgb(0_0_0/0.55),rgb(0_0_0/0.25)_70%)] px-6">
          <div className="max-w-3xl text-center text-white">
            {banner.title && (
              <h2 className="animate-rise font-display text-4xl font-medium leading-tight !text-white drop-shadow-md sm:text-5xl lg:text-6xl">
                {banner.title}
              </h2>
            )}
            {banner.title && banner.description && (
              <span aria-hidden className="animate-rise mx-auto my-5 block h-1 w-20 rounded-full bg-energy [animation-delay:150ms]" />
            )}
            {banner.description && (
              <p className="animate-rise mx-auto max-w-2xl whitespace-pre-line text-base text-white/90 [animation-delay:300ms] sm:text-lg lg:text-xl">
                {banner.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
