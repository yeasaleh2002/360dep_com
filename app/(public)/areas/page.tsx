import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { CtaSection } from "@/components/public/cta-section";
import { Reveal } from "@/components/ui/reveal";
import { AREAS } from "@/lib/seo/areas";
import { generalKeywords } from "@/lib/seo/keywords";

const TITLE = "সেবা এলাকা — যশোর, ঝিনাইদহ, মাগুরা, সাতক্ষীরা ও খুলনা বিভাগ | Service Areas";
const DESCRIPTION =
  "যশোর, ঝিনাইদহ, মাগুরা, সাতক্ষীরা, খুলনা, নড়াইল, বাগেরহাট, কুষ্টিয়া, চুয়াডাঙ্গা ও মেহেরপুরে বিয়ে ও ইভেন্ট আয়োজন। Event management and wedding planning across the Khulna division.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: generalKeywords(),
  alternates: { canonical: "/areas" },
};

export default function AreasPage() {
  return (
    <>
      <section className="paper-grain border-b border-line/70">
        <div className="container py-16 sm:py-20 lg:py-24">
          <p className="eyebrow">সেবা এলাকা · Service areas</p>
          <h1 className="mt-6 max-w-3xl text-[2.3rem] font-medium sm:text-5xl">যশোর ও খুলনা বিভাগের সব জেলায় আমরা আছি</h1>
          <p className="mt-3 font-display text-xl text-gold-strong sm:text-2xl" lang="en">
            Event management across Jashore and the Khulna division
          </p>
          <p className="mt-6 max-w-2xl text-muted">{DESCRIPTION}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AREAS.map((area, i) => (
              <Reveal as="li" key={area.slug} delay={(i % 3) * 0.06}>
                <Link href={`/areas/${area.slug}`} className="card group flex h-full items-start gap-4 p-6 transition hover:-translate-y-0.5 hover:shadow-lift">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-gold" />
                  <span className="flex-1">
                    <span className="block text-xl font-semibold">{area.bnIn} ইভেন্ট ম্যানেজমেন্ট</span>
                    <span className="block text-sm text-muted" lang="en">Event management in {area.en}</span>
                    <span className="mt-2 block text-xs text-muted">{area.upazilasBn.slice(0, 4).join(" · ")}</span>
                  </span>
                  <ArrowRight className="mt-1 h-4 w-4 text-muted transition group-hover:translate-x-1 group-hover:text-gold-strong" />
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
