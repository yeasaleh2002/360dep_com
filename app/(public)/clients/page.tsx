import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { PageHero } from "@/components/public/page-hero";
import { ClientLogo } from "@/components/public/client-logo";
import { ClientFeedback } from "@/components/public/client-feedback";
import { SectionHeading } from "@/components/ui/section-heading";
import { CtaSection } from "@/components/public/cta-section";
import { Reveal } from "@/components/ui/reveal";
import { T } from "@/lib/i18n";
import { getClients } from "@/lib/data";
import bn from "@/lib/i18n/bn.json";

export const metadata: Metadata = {
  title: "আমাদের ক্লায়েন্ট ও তাঁদের মতামত | Our Clients",
  description: bn.clients.subtitle,
  alternates: { canonical: "/clients" },
};

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <>
      <PageHero eyebrow="clients.eyebrow" title="clients.title" subtitle="clients.subtitle" />
      <section className="section">
        <div className="container">
          {clients.length > 0 ? (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
              {clients.map((client, i) => (
                <Reveal as="li" key={client.id} delay={(i % 4) * 0.05} className="group">
                    <ClientLogo client={client} className="h-32" />
                    <div className="mt-3 flex items-center justify-center gap-2 text-center text-sm font-medium">
                      {client.website ? (
                        <a
                          href={client.website}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="inline-flex items-center gap-1.5 text-ink transition hover:text-gold-strong"
                        >
                          {client.name}
                          <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden />
                        </a>
                      ) : (
                        <span>{client.name}</span>
                      )}
                    </div>
                </Reveal>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted">
              <T k="clients.empty" />
            </p>
          )}
        </div>
      </section>
      {clients.some((c) => c.feedback) && (
        <section className="section bg-surface-2/60">
          <div className="container">
            <SectionHeading eyebrow="clients.feedbackEyebrow" title="clients.feedbackTitle" />
            <div className="mt-14">
              <ClientFeedback clients={clients} />
            </div>
          </div>
        </section>
      )}
      <CtaSection />
    </>
  );
}
