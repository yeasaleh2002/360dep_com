import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BannerSlide } from "@/components/public/banner-slide";
import { T } from "@/lib/i18n";
import type { PublicBanner } from "@/lib/data";

// The slider's JS is only shipped when there are 2+ banners.
const BannerSlider = dynamic(() => import("@/components/public/banner-slider"));

const frame = "relative overflow-hidden h-[64svh] min-h-[420px] w-full sm:h-[72svh] lg:h-[calc(100svh-72px)] lg:max-h-[880px]";

export function Hero({ banners }: { banners: PublicBanner[] }) {
  if (banners.length === 0) return <FallbackHero />;

  return (
    <section className={frame}>
      {banners.length === 1 ? <BannerSlide banner={banners[0]} priority /> : <BannerSlider banners={banners} />}
    </section>
  );
}

/** Typographic hero shown until the first banner is uploaded. */
function FallbackHero() {
  return (
    <section className="relative isolate overflow-hidden bg-night text-white">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06]" />
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgb(var(--gold)/0.22)]" />
        <div className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(var(--gold)/0.14),transparent_60%)]" />
      </div>
      <div className="container flex min-h-[560px] flex-col items-center justify-center py-24 text-center sm:min-h-[640px] lg:min-h-[min(calc(100svh-72px),880px)]">
        <p className="eyebrow !text-[rgb(var(--gold))]">
          <T k="hero.eyebrow" />
        </p>
        <h1 className="mt-7 max-w-4xl text-[2.6rem] font-medium leading-[1.1] !text-white sm:text-6xl lg:text-7xl">
          <T k="hero.title" />
        </h1>
        <p className="mt-7 max-w-2xl text-base text-white/70 sm:text-lg">
          <T k="hero.subtitle" />
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/contact" className="btn-gold">
            <T k="hero.primary" />
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/gallery" className="btn-ghost-light">
            <T k="hero.secondary" />
          </Link>
        </div>
      </div>
    </section>
  );
}
