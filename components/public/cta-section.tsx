import Link from "next/link";
import { T } from "@/lib/i18n";
import { Reveal } from "@/components/ui/reveal";
import { WhatsAppButton } from "@/components/public/whatsapp-button";

export function CtaSection() {
  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-night px-6 py-16 text-center sm:px-12 sm:py-20 lg:py-24">
            <div aria-hidden className="sparkles" />
            <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-energy" />
            <div aria-hidden className="absolute inset-0 -z-10">
              <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border border-[rgb(var(--gold)/0.25)]" />
              <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full border border-white/5" />
              <div className="absolute left-1/2 top-0 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(var(--gold)/0.18),transparent_65%)]" />
            </div>
            <p className="eyebrow justify-center !text-[rgb(var(--gold))]">
              <T k="cta.eyebrow" />
            </p>
            <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-medium !text-white sm:text-5xl">
              <T k="cta.title" />
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-white/70 sm:text-lg">
              <T k="cta.body" />
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <WhatsAppButton label="cta.primary" />
              <Link href="/contact" className="btn-ghost-light">
                <T k="cta.secondary" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
