import { T, type TKey } from "@/lib/i18n";

/** Header band for inner pages. */
export function PageHero({ eyebrow, title, subtitle }: { eyebrow: TKey; title: TKey; subtitle?: TKey }) {
  return (
    <section className="paper-grain relative overflow-hidden border-b border-line/70">
      <div aria-hidden className="pointer-events-none absolute -right-32 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full border border-gold/25" />
      <div aria-hidden className="pointer-events-none absolute -right-10 top-1/2 h-[260px] w-[260px] -translate-y-1/2 rounded-full border border-line" />
      <div className="container relative py-16 sm:py-20 lg:py-28">
        <p className="eyebrow">
          <T k={eyebrow} />
        </p>
        <h1 className="mt-6 max-w-3xl text-[2.5rem] font-medium sm:text-5xl lg:text-6xl">
          <T k={title} />
        </h1>
        {subtitle && (
          <p className="mt-6 max-w-2xl text-base text-muted sm:text-lg">
            <T k={subtitle} />
          </p>
        )}
      </div>
    </section>
  );
}
