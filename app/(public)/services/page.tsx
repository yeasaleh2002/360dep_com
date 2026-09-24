import type { Metadata } from "next";
import { PageHero } from "@/components/public/page-hero";
import { ServiceCard } from "@/components/public/service-card";
import { WhatsAppButton } from "@/components/public/whatsapp-button";
import { Reveal } from "@/components/ui/reveal";
import { T } from "@/lib/i18n";
import { getServices } from "@/lib/data";
import bn from "@/lib/i18n/bn.json";

export const metadata: Metadata = {
  title: "সেবাসমূহ — বিয়ে ও ইভেন্ট আয়োজন | Wedding & Event Services in Jashore",
  description: bn.services.subtitle,
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageHero eyebrow="services.eyebrow" title="services.title" subtitle="services.subtitle" />
      <section className="section">
        <div className="container">
          {services.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {services.map((service, i) => (
                <Reveal key={service.id} delay={(i % 3) * 0.08} className="h-full">
                  <ServiceCard service={service} full />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted">
              <T k="services.empty" />
            </p>
          )}

          <Reveal className="mt-16">
            <div className="card flex flex-col items-start justify-between gap-6 p-8 sm:p-10 md:flex-row md:items-center">
              <div>
                <h2 className="text-3xl font-medium">
                  <T k="services.customTitle" />
                </h2>
                <p className="mt-2 max-w-xl text-muted">
                  <T k="services.customBody" />
                </p>
              </div>
              <WhatsAppButton className="shrink-0" />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
