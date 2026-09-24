import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, MapPin } from "lucide-react";
import { ServiceCard } from "@/components/public/service-card";
import { CtaSection } from "@/components/public/cta-section";
import { Reveal } from "@/components/ui/reveal";
import { getServices } from "@/lib/data";
import { AREAS, getArea } from "@/lib/seo/areas";
import { areaContent } from "@/lib/seo/area-content";
import { areaKeywords } from "@/lib/seo/keywords";
import { JsonLd, areaJsonLd } from "@/lib/seo/jsonld";

export function generateStaticParams() {
  return AREAS.map((a) => ({ slug: a.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const area = getArea((await params).slug);
  if (!area) return {};
  const c = areaContent(area);
  return {
    title: { absolute: c.metaTitle },
    description: c.metaDescription,
    keywords: areaKeywords(area),
    alternates: { canonical: `/areas/${area.slug}` },
    openGraph: { title: c.metaTitle, description: c.metaDescription, url: `/areas/${area.slug}` },
  };
}

export default async function AreaPage({ params }: Props) {
  const area = getArea((await params).slug);
  if (!area) notFound();
  const c = areaContent(area);
  const services = await getServices();
  const others = AREAS.filter((a) => a.slug !== area.slug);

  return (
    <>
      <JsonLd data={areaJsonLd(area, c.faqs)} />

      <section className="paper-grain relative overflow-hidden border-b border-line/70">
        <div className="container relative py-16 sm:py-20 lg:py-24">
          <nav aria-label="Breadcrumb" className="text-sm text-muted">
            <Link href="/" className="hover:text-ink">হোম</Link> / <Link href="/areas" className="hover:text-ink">সেবা এলাকা</Link> / {area.bn}
          </nav>
          <p className="eyebrow mt-8">
            <MapPin className="h-4 w-4" /> {area.bn} · {area.en}
          </p>
          <h1 className="mt-6 max-w-4xl text-[2.3rem] font-medium sm:text-5xl lg:text-6xl">{c.titleBn}</h1>
          <p className="mt-3 font-display text-xl text-gold-strong sm:text-2xl" lang="en">
            {c.titleEn}
          </p>
          <p className="mt-8 max-w-3xl text-base text-muted sm:text-lg">{c.introBn}</p>
          <p className="mt-4 max-w-3xl text-[0.95rem] text-muted" lang="en">
            {c.introEn}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <Reveal>
            <h2 className="text-3xl font-medium sm:text-4xl">{area.bnIn} আমরা যা করি</h2>
            <p className="mt-2 text-muted" lang="en">What we handle in {area.en}</p>
            <ul className="mt-8 space-y-4">
              {c.handles.map(([bn, en]) => (
                <li key={en} className="flex gap-3">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-gold" />
                  <span>
                    {bn}
                    <span className="block text-sm text-muted" lang="en">
                      {en}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl font-medium sm:text-4xl">সাধারণ প্রশ্ন</h2>
            <p className="mt-2 text-muted" lang="en">Frequently asked questions</p>
            <div className="mt-8 space-y-3">
              {c.faqs.map((f) => (
                <details key={f.q} className="card group p-5 open:shadow-soft">
                  <summary className="cursor-pointer list-none font-semibold marker:hidden">{f.q}</summary>
                  <p className="mt-3 text-[0.95rem] text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {services.length > 0 && (
        <section className="section bg-surface-2/60">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-medium sm:text-4xl">{area.bnOf} জন্য আমাদের সেবা</h2>
              <p className="mt-2 text-muted" lang="en">Our services in {area.en}</p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <h2 className="text-center text-2xl font-medium sm:text-3xl">আশেপাশের জেলাগুলোতেও আমরা আছি</h2>
          <p className="mt-2 text-center text-muted" lang="en">We also work in nearby districts</p>
          <ul className="mt-8 flex flex-wrap justify-center gap-2">
            {others.map((a) => (
              <li key={a.slug}>
                <Link href={`/areas/${a.slug}`} className="inline-flex rounded-full border border-line px-4 py-2 text-sm transition hover:border-gold hover:text-gold-strong">
                  {a.bn} · {a.en}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
