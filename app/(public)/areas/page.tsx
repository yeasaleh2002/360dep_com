import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { CtaSection } from "@/components/public/cta-section";
import { Reveal } from "@/components/ui/reveal";
import { AREAS, CORE, DIVISIONS } from "@/lib/seo/areas";
import { generalKeywords } from "@/lib/seo/keywords";

const TITLE = "সারা বাংলাদেশে ইভেন্ট ম্যানেজমেন্ট — ৬৪ জেলা | Event Management across Bangladesh";
const DESCRIPTION =
  "যশোর, ঝিনাইদহ, মাগুরা, সাতক্ষীরা, খুলনাসহ বাংলাদেশের ৬৪ জেলায় বিয়ে, গায়ে হলুদ, কর্পোরেট ও সব ধরনের অনুষ্ঠানের আয়োজন। Event management and wedding planning in all 64 districts of Bangladesh.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: generalKeywords(),
  alternates: { canonical: "/areas" },
};

export default function AreasPage() {
  return (
    <>
      <section className="hero-aurora relative overflow-hidden border-b border-line/70">
        <div className="container relative py-16 sm:py-20 lg:py-24">
          <p className="eyebrow">সেবা এলাকা · Service areas</p>
          <h1 className="mt-6 max-w-3xl text-[2.3rem] sm:text-5xl">
            সারা বাংলাদেশে, <span className="text-gradient">৬৪ জেলায়</span> আমরা আছি
          </h1>
          <p className="mt-3 font-display text-xl text-gold-strong sm:text-2xl" lang="en">
            Event management in all 64 districts of Bangladesh
          </p>
          <p className="mt-6 max-w-2xl text-muted">{DESCRIPTION}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 fill-gold text-gold" />
            <h2 className="text-2xl sm:text-3xl">আমাদের প্রধান সেবা এলাকা</h2>
          </div>
          <p className="mt-2 text-muted" lang="en">
            Our home region — Jashore and the Khulna division
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CORE.map((area, i) => (
              <Reveal as="li" key={area.slug} delay={(i % 3) * 0.06}>
                <Link
                  href={`/areas/${area.slug}`}
                  className="card-glow group flex h-full items-start gap-4 p-6"
                >
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-gold" />
                  <span className="flex-1">
                    <span className="block text-xl font-semibold">{area.bnIn} ইভেন্ট ম্যানেজমেন্ট</span>
                    <span className="block text-sm text-muted" lang="en">
                      Event management in {area.en}
                    </span>
                    <span className="mt-2 block text-xs text-muted">{area.upazilasBn.slice(0, 4).join(" · ")}</span>
                  </span>
                  <ArrowRight className="mt-1 h-4 w-4 text-muted transition group-hover:translate-x-1 group-hover:text-gold-strong" />
                </Link>
              </Reveal>
            ))}
          </ul>

          <h2 className="mt-20 text-2xl sm:text-3xl">দেশের অন্যান্য জেলা</h2>
          <p className="mt-2 text-muted" lang="en">
            Every other district, by division
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {DIVISIONS.filter((d) => d.id !== "khulna").map((division, i) => (
              <Reveal key={division.id} delay={(i % 3) * 0.06} className="card p-6">
                <h3 className="text-lg font-semibold">
                  {division.bn} <span className="text-sm font-normal text-muted">· {division.en}</span>
                </h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {AREAS.filter((a) => a.division === division.id).map((a) => (
                    <li key={a.slug}>
                      <Link
                        href={`/areas/${a.slug}`}
                        className="inline-flex rounded-full border border-line px-3 py-1.5 text-sm transition hover:border-gold hover:bg-gold/10 hover:text-gold-strong"
                      >
                        {a.bn}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
