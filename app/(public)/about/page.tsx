import type { Metadata } from "next";
import { PageHero } from "@/components/public/page-hero";
import { CtaSection } from "@/components/public/cta-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { T, type TKey } from "@/lib/i18n";
import bn from "@/lib/i18n/bn.json";

export const metadata: Metadata = {
  title: "আমাদের সম্পর্কে | About 360DEP — Event Management in Jashore",
  description: bn.about.subtitle,
  alternates: { canonical: "/about" },
};

const DIFFERENTIATORS: { title: TKey; body: TKey }[] = [
  { title: "about.diff1Title", body: "about.diff1Body" },
  { title: "about.diff2Title", body: "about.diff2Body" },
  { title: "about.diff3Title", body: "about.diff3Body" },
  { title: "about.diff4Title", body: "about.diff4Body" },
];

const STEPS: { title: TKey; body: TKey }[] = [
  { title: "about.step1Title", body: "about.step1Body" },
  { title: "about.step2Title", body: "about.step2Body" },
  { title: "about.step3Title", body: "about.step3Body" },
  { title: "about.step4Title", body: "about.step4Body" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="about.eyebrow" title="about.title" subtitle="about.subtitle" />

      {/* Story */}
      <section className="section">
        <div className="container grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-4xl font-medium sm:text-5xl">
              <T k="about.storyTitle" />
            </h2>
            <span aria-hidden className="mt-6 block h-px w-16 bg-gold" />
          </Reveal>
          <div className="space-y-6 text-base text-muted sm:text-lg">
            {(["about.story1", "about.story2", "about.story3"] as const).map((key, i) => (
              <Reveal key={key} delay={i * 0.08}>
                <p className={i === 0 ? "font-display text-2xl leading-snug text-ink sm:text-[1.75rem]" : undefined}>
                  <T k={key} />
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & vision */}
      <section className="bg-night py-20 text-white sm:py-24">
        <div className="container grid gap-6 md:grid-cols-2 lg:gap-8">
          {([
            ["about.missionTitle", "about.mission"],
            ["about.visionTitle", "about.vision"],
          ] as const).map(([title, body], i) => (
            <Reveal key={title} delay={i * 0.1}>
              <div className="h-full rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10">
                <p className="font-display text-5xl text-[rgb(var(--gold))]">0{i + 1}</p>
                <h2 className="mt-6 text-3xl font-medium !text-white">
                  <T k={title} />
                </h2>
                <p className="mt-4 text-white/70 sm:text-lg">
                  <T k={body} />
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* What makes us different */}
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="about.diffEyebrow" title="about.diffTitle" />
          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
            {DIFFERENTIATORS.map((item, i) => (
              <Reveal key={item.title} delay={(i % 2) * 0.08} className="bg-surface p-8 sm:p-10">
                <span aria-hidden className="block h-8 w-8 rounded-full border border-gold/60 p-2">
                  <span className="block h-full w-full rounded-full bg-gold" />
                </span>
                <h3 className="mt-6 text-2xl font-medium">
                  <T k={item.title} />
                </h3>
                <p className="mt-3 text-muted">
                  <T k={item.body} />
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section bg-surface-2/60">
        <div className="container">
          <SectionHeading eyebrow="about.processEyebrow" title="about.processTitle" />
          <ol className="relative mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <span aria-hidden className="absolute left-0 right-0 top-7 hidden h-px bg-line lg:block" />
            {STEPS.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 0.1} className="relative">
                  <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-gold bg-bg font-display text-2xl text-gold-strong">
                    {i + 1}
                  </span>
                  <h3 className="mt-6 text-2xl font-medium">
                    <T k={step.title} />
                  </h3>
                  <p className="mt-2 text-muted">
                    <T k={step.body} />
                  </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
