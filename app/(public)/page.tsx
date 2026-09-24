import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Hero } from "@/components/public/hero";
import { EnergyRibbon } from "@/components/public/energy-ribbon";
import { ServiceCard } from "@/components/public/service-card";
import { TeamCard } from "@/components/public/team-card";
import { ClientsMarquee } from "@/components/public/client-logo";
import { ClientFeedback } from "@/components/public/client-feedback";
import { GalleryPreview } from "@/components/public/gallery-preview";
import { ContactBlock } from "@/components/public/contact-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { T, type TKey } from "@/lib/i18n";
import { getBanners, getClients, getGalleryPreview, getServices, getTeam } from "@/lib/data";
import { AREAS, CORE } from "@/lib/seo/areas";

const OTHERS = AREAS.filter((a) => !a.core);

const PILLARS: { title: TKey; body: TKey }[] = [
  { title: "home.pillar1Title", body: "home.pillar1Body" },
  { title: "home.pillar2Title", body: "home.pillar2Body" },
  { title: "home.pillar3Title", body: "home.pillar3Body" },
];

/**
 * Landing page: Banner → About → Services → (Team) → Clients slider → Gallery (4) → Contact.
 * Fully static — built once and served from Cloudflare's cache. Each block reads tag-cached
 * data, so e.g. editing a service rebuilds this page on its next visit (no timers).
 */
export default async function HomePage() {
  const [banners, services, team, clients, gallery] = await Promise.all([
    getBanners(),
    getServices(),
    getTeam(),
    getClients(),
    getGalleryPreview(4),
  ]);

  return (
    <>
      {banners.length > 0 && (
        <h1 className="sr-only">
          <T k="meta.title" />
        </h1>
      )}

      {/* 1 · Banner */}
      <Hero banners={banners} />
      <EnergyRibbon items={services.map((s) => s.title)} />

      {/* 2 · About */}
      <section className="section">
        <div className="container grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
          <Reveal>
            <p className="eyebrow">
              <T k="home.aboutEyebrow" />
            </p>
            <h2 className="mt-5 text-[2.1rem] font-medium sm:text-[2.6rem] lg:text-5xl">
              <T k="home.aboutTitle" />
            </h2>
            <p className="mt-6 text-base text-muted sm:text-lg">
              <T k="home.aboutBody" />
            </p>
            <Link href="/about" className="link-underline mt-8">
              <T k="home.aboutLink" />
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <ol className="grid gap-4 self-center">
            {PILLARS.map((pillar, i) => (
              <Reveal as="li" key={pillar.title} delay={0.1 * i} className="card-glow flex gap-5 p-6 sm:p-7">
                <span className="text-gradient font-display text-4xl font-extrabold leading-none">0{i + 1}</span>
                <div>
                  <h3 className="text-xl font-medium sm:text-2xl">
                    <T k={pillar.title} />
                  </h3>
                  <p className="mt-2 text-[0.95rem] text-muted">
                    <T k={pillar.body} />
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 3 · Services */}
      <section id="services" className="section scroll-mt-20 bg-surface-2/60">
        <div className="container">
          <SectionHeading eyebrow="home.servicesEyebrow" title="home.servicesTitle" subtitle="home.servicesSubtitle" />
          {services.length > 0 ? (
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-8">
              {services.slice(0, 6).map((service, i) => (
                <Reveal key={service.id} delay={(i % 3) * 0.08} className="h-full">
                  <ServiceCard service={service} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="mt-12 text-center text-muted">
              <T k="services.empty" />
            </p>
          )}
          {services.length > 0 && (
            <div className="mt-14 text-center">
              <Link href="/services" className="btn-outline">
                <T k="common.viewAll" />
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Team */}
      <section className="section relative overflow-hidden">
        <div aria-hidden className="blob blob-gold -left-40 top-10" />
        <div className="container relative">
          <SectionHeading eyebrow="home.teamEyebrow" title="home.teamTitle" subtitle="home.teamSubtitle" />
          {team.length > 0 ? (
            <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:mt-16 lg:grid-cols-4 lg:gap-x-8">
              {team.slice(0, 8).map((member, i) => (
                <Reveal key={member.id} delay={(i % 4) * 0.08}>
                  <TeamCard member={member} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="mt-12 text-center text-muted">
              <T k="team.empty" />
            </p>
          )}
          <div className="mt-14 text-center">
            <Link href="/team" className="btn-outline">
              <T k="team.viewAll" />
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4 · Previous clients slider */}
      {clients.length > 0 && (
        <section className="border-y border-line/70 bg-surface-2/60 py-16 sm:py-20">
          <div className="container">
            <Reveal className="mb-10 text-center">
              <p className="eyebrow justify-center">
                <T k="home.clientsEyebrow" />
              </p>
              <h2 className="mt-4 text-3xl font-medium sm:text-4xl">
                <T k="home.clientsTitle" />
              </h2>
            </Reveal>
          </div>
          <ClientsMarquee clients={clients} />
          {clients.some((c) => c.feedback) && (
            <div className="container mt-12">
              <ClientFeedback clients={clients} limit={3} />
            </div>
          )}
          <div className="mt-10 text-center">
            <Link href="/clients" className="link-underline text-sm">
              <T k="common.viewAll" />
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* 5 · Gallery (4 items: featured first) */}
      {gallery.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading align="left" eyebrow="home.galleryEyebrow" title="home.galleryTitle" subtitle="home.gallerySubtitle" />
              <Link href="/gallery" className="btn-outline shrink-0">
                <T k="common.viewAll" />
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-12">
              <GalleryPreview items={gallery} />
            </div>
          </div>
        </section>
      )}

      {/* Service areas: core districts first, then the rest of Bangladesh */}
      <section className="relative overflow-hidden border-t border-line/70 py-16 sm:py-20">
        <div className="container text-center">
          <p className="eyebrow justify-center">সেবা এলাকা · Service areas</p>
          <h2 className="mt-4 text-3xl sm:text-4xl">
            সারা বাংলাদেশে, <span className="text-gradient">৬৪ জেলায়</span> আমরা আছি
          </h2>
          <p className="mt-2 text-muted" lang="en">
            Event management across Bangladesh — based in Jashore
          </p>
          <ul className="mt-10 flex flex-wrap justify-center gap-2.5">
            {CORE.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/areas/${a.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-bg transition hover:-translate-y-0.5 hover:bg-gold-strong dark:bg-gold dark:text-night"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {a.bn}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="mask-fade-x mt-8 overflow-hidden">
          <ul className="flex w-max animate-marquee gap-2.5 [--marquee-duration:90s] hover:[animation-play-state:paused]">
            {[...OTHERS, ...OTHERS].map((a, i) => (
              <li key={`${a.slug}-${i}`} aria-hidden={i >= OTHERS.length}>
                <Link
                  href={`/areas/${a.slug}`}
                  tabIndex={i >= OTHERS.length ? -1 : undefined}
                  className="inline-flex whitespace-nowrap rounded-full border border-line px-4 py-2 text-sm transition hover:border-gold hover:text-gold-strong"
                >
                  {a.bn} · {a.en}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-10 text-center">
          <Link href="/areas" className="btn-gold">
            ৬৪ জেলার সব এলাকা দেখুন
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 6 · Contact form */}
      <section id="contact" className="section scroll-mt-20 bg-surface-2/60">
        <div className="container">
          <SectionHeading eyebrow="contact.eyebrow" title="contact.title" subtitle="contact.subtitle" />
          <div className="mt-14">
            <ContactBlock services={services.map(({ id, title }) => ({ id, title }))} />
          </div>
        </div>
      </section>
    </>
  );
}
